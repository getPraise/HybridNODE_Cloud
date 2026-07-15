import re
from app.cors.graph.state import HybridNodeState
from app.agents.local_provider import call_ollama

def manager_routing_node(state: HybridNodeState)-> dict:
  prompt = state.prompt.strip()
  score = 0

  if len(prompt.split()) < 5 and re.search(r"^(hi|hello|hey|bye|thanks|greetings)", prompt.lower()):
    return {"complexity_score":10, "execution_tier":"LOCAL_1B", "status":"ROUTED"}
  
  if any(word in prompt.lower() for word in["architecture", "kubernetes", "microservices", "optimize system"]):
    return {"complexity_score":90, "execution_tier":"CLOUD","status":"ROUTED"}
  

  scoring_prompt = scoring_prompt = f"""
  [SYSTEM: TASK COMPLEXITY ANALYZER]
  Rate the following software engineering task on a scale of 0 to 100.
  - 0: Simple greeting, "how are you", or nonsensical text.
  - 30: Basic UI request (e.g., "make a button", "change color").
  - 70: Logic/Coding task (e.g., "write a login function", "fix a loop").
  - 100: Complex architecture (e.g., "design a banking system", "multi-agent flow").

  IMPORTANT: Output ONLY the integer. Do NOT include words, punctuation, or fractions.
  Example Output: 45

  Task: {prompt}
  Score:"""
    
  try:
    raw_score = call_ollama(model="llama3.2:1b",prompt=scoring_prompt)
    score = int(re.sub(r"/D","",raw_score))
  except Exception:
    score = 50

  if score > 75:
    tier = "CLOUD"
  elif score > 50:
    tier = "LOCAL_8B"
  elif score > 20:
    tier = "LOCAL_3B"
  else:
    tier = "LOCAL_1B"
  return {
    "complexity_score":score,
    "execution_tier":tier,
    "status":"ROUTED"
  }
