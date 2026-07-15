import os
from dotenv import load_dotenv

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URI", "http://localhost:5173")
SYSTEM_PROMPT = "You are HybridNode AI. Keep responses helpful and concise."