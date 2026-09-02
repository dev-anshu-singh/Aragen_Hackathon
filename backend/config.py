import os
from pathlib import Path
from dotenv import load_dotenv

# Locate and load root .env file
BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
else:
    load_dotenv()

# Environment & Model Configurations
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL_NAME = os.getenv("GEMINI_MODEL_NAME", "gemini-3.7-flash")

# Fallback models in priority order
FALLBACK_MODELS = [
    GEMINI_MODEL_NAME,
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
]
# Remove any duplicates while preserving order
FALLBACK_MODELS = list(dict.fromkeys(FALLBACK_MODELS))

# Server configurations
API_HOST = os.getenv("API_HOST", "127.0.0.1")
API_PORT = int(os.getenv("API_PORT", 8000))
MCP_SERVER_PATH = str(Path(__file__).resolve().parent / "mcp_server" / "server.py")
