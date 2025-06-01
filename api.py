from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from featureExtractor import PredictURL
import validators
import os
from dotenv import load_dotenv
#from ollama_client import run_gpt_analysis  # New import from the new client file
from ollama_client import generate_threatphrases


# Initialize FastAPI app
app = FastAPI()

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "dummy-key")
if GOOGLE_API_KEY == "dummy-key":
    print("⚠️ WARNING: Using dummy API key. Set GOOGLE_API_KEY in .env!")

# Enable CORS (for dev/testing from browser extensions or frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # NOTE: restrict this in production!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ThreatRequest(BaseModel):
    text: str

threat_keywords = ["bomb", "kill", "attack", "explode"]

@app.post("/threatphrases")
def detect_threat(request: ThreatRequest):
    for word in threat_keywords:
        if word in request.text.lower():
            return {"threat_detected": True}
    return {"threat_detected": False}


# Root route for testing
@app.get("/")
def read_root():
    return {"message": "Phishing Detection API is running!"}

@app.get("/test-api-key")
def test_api_key():
    return {"GOOGLE_API_KEY": GOOGLE_API_KEY}

# URL-only checking route (optional)
class URLRequest(BaseModel):
    url: str

@app.post("/check-url/")
def check_url(request: URLRequest):
    print("Received URL:", request.url)
    # Simplified dummy check
    return {"status": "safe" if "google" in request.url else "dangerous"}

# Email data model for full analysis
class EmailData(BaseModel):
    subject: str
    body: str
    urls: list[str]
    attachment_filenames: list[str]

# Your ML model
classification = PredictURL()

# Main analysis endpoint
@app.post("/api/analyze")
async def analyze_email(data: EmailData):
    response = {
        "phishing_urls": [],
        "suspicious_attachments": [],
        "llm_analysis": {}
    }

    # ML-based URL classification
    for url in data.urls:
        if validators.url(url):
            verdict = classification.predict(url)
            if verdict != "Given website is a legitimate site":
                response["phishing_urls"].append({"url": url, "verdict": verdict})

    # Check for suspicious file extensions
    dangerous_exts = ['.exe', '.bat', '.cmd', '.scr', '.js', '.vbs', '.jar']
    for fname in data.attachment_filenames:
        if any(fname.lower().endswith(ext) for ext in dangerous_exts):
            response["suspicious_attachments"].append(fname)

    # Run LLM-based contextual analysis via ollama_client.py
    response["llm_analysis"] = run_gpt_analysis(
        subject=data.subject,
        body=data.body,
        urls=data.urls,
        attachments=data.attachment_filenames
    )

    return response



