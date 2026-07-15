import asyncio
import re
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage

# --- 1. Import our custom modular engine ---
from config import FRONTEND_URL, SYSTEM_PROMPT
from models import cloud_model, grok_api_models
from router import classify_prompt
from telemetry import count_input_tokens, count_output_tokens

# --- 2. Server & Socket Initialization ---
sio = socketio.AsyncServer(
    async_mode='asgi', 
    cors_allowed_origins="*", 
    ping_timeout=60, 
    ping_interval=25
)
app = FastAPI(title="HybridNode AI Engine Assembly")
socket_app = socketio.ASGIApp(sio, app)

app.add_middleware(
    CORSMiddleware, 
    allow_origins=[FRONTEND_URL, "http://127.0.0.1:5173"], 
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

@sio.event
async def connect(sid, environ):
    print(f"✅ Node Attached to Mesh Network: {sid}")

@sio.event
async def disconnect(sid):
    print(f"❌ Node Severed: {sid}")

# --- 3. The Core Event Listener ---
@sio.event
async def user_message(sid, data):
    prompt = data.get("prompt", "")
    context = data.get("context", []) 
    print(f"\n📩 New Request: '{prompt}'")
    
    try:
        # A. Route the request using our Semantic Router in a worker thread
        tier = await asyncio.to_thread(classify_prompt, prompt)
        print(f"🧠 Router Decision: {tier.upper()}")
        
        # B. Format the Chat History for LangChain
        history = []
        for m in context:
            if m['role'] == 'user': 
                history.append(HumanMessage(content=m['content']))
            elif m['role'] == 'assistant': 
                history.append(AIMessage(content=m['content']))

        # C. Build the prompt layout template
        template = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="history"),
            ("human", "{input}")
        ])

        # D. Telemetry: Count Input Tokens
        full_context_text = f"System: {SYSTEM_PROMPT} " + " ".join([f"{m['role']}: {m['content']}" for m in context]) + f" user: {prompt}"
        input_tokens = count_input_tokens(tier, full_context_text)
        output_tokens = 0

        # E. Execution & Streaming Engine
        if tier == "gemini":
            await sio.emit("tier_update", {"tier": tier}, to=sid)
            chain = template | cloud_model
            generated_text = ""
            
            async for chunk in chain.astream({"history": history, "input": prompt}):
                text = chunk.content
                generated_text += text
                await sio.emit("token", {"text": text, "tier": tier}, to=sid)
                
            output_tokens = count_output_tokens(tier, generated_text)
            
        else:
            # Tell UI we are attempting the selected Groq tier
            await sio.emit("tier_update", {"tier": tier}, to=sid)
            
            try:
                active_model = grok_api_models[tier]
                chain = template | active_model
                generated_text = ""
                
                # GROQ: Natively supports blazing fast async streaming
                async for chunk in chain.astream({"history": history, "input": prompt}):
                    text = chunk.content
                    generated_text += text
                    
                    # Stream everything directly to the UI
                    await sio.emit("token", {"text": text, "tier": tier}, to=sid)
                
                output_tokens = count_output_tokens(tier, generated_text)

            except Exception as groq_error:
                # CRITICAL FALLBACK SYSTEM: If Groq hits a rate limit or drops out, hot-swap to Gemini instantly
                print(f"⚠️ Tier {tier.upper()} Groq API Failed: {groq_error}. Falling back to GEMINI cloud.")
                
                tier = "gemini"
                await sio.emit("tier_update", {"tier": "gemini"}, to=sid)
                
                fallback_chain = template | cloud_model
                fallback_notice = "[Groq Rate Limit/Interruption - Processing via Resilient Gemini Node]\n\n"
                await sio.emit("token", {"text": fallback_notice, "tier": tier}, to=sid)
                
                generated_text = fallback_notice
                async for chunk in fallback_chain.astream({"history": history, "input": prompt}):
                    text = chunk.content
                    generated_text += text
                    await sio.emit("token", {"text": text, "tier": tier}, to=sid)
                    
                output_tokens = count_output_tokens(tier, generated_text)

        # F. Analytics Dispatch
        print(f"📊 Analytics -> Input: {input_tokens} | Output: {output_tokens} ({tier.upper()})")
        await sio.emit("analytics_update", {
            "tier": tier,
            "inputTokens": input_tokens,
            "outputTokens": output_tokens
        }, to=sid)

        # G. Unlock UI
        await sio.emit("done", {}, to=sid)

    except Exception as e:
        print(f"⚠️ Engine Fatal Error: {str(e)}")
        await sio.emit("token", {"text": f"\n[System Failure: {str(e)}]", "tier": "gemini"}, to=sid)
        await sio.emit("done", {}, to=sid)

# --- 4. Server Execution ---
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="127.0.0.1", port=8000)