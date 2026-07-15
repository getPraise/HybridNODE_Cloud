import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

# Gemini :-
cloud_model = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.7
)

# Groq :-
def create_groq_model(model_id):
    return ChatGroq(
        model=model_id,
        max_tokens=250,
        groq_api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.4,
    ).bind(stop=["<|im_end|>", "User:", "Human:", "\nUser:"])

grok_api_models = {
    "20b": create_groq_model("openai/gpt-oss-20b"), 
    "27b": create_groq_model("qwen/qwen3.6-27b"),        
    "120b": create_groq_model("openai/gpt-oss-120b") 
}

