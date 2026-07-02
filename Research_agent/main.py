import uvicorn
import sys
import os

# Ensure project root is on the path
sys.path.insert(0, os.path.dirname(__file__))

from api.app import app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # Disable reload in production to avoid issues
    reload = os.environ.get("ENVIRONMENT", "development") == "development"
    uvicorn.run(
        "api.app:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
        log_level="info",
    )
