from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
from app.auth.dependencies import get_current_user

load_dotenv()

router = APIRouter(prefix="/api/ai", tags=["AI"])

class AIRequest(BaseModel):
    prompt: str

class AIResponse(BaseModel):
    reply: str

@router.post("/ask", response_model=AIResponse)
async def ask_ai(data: AIRequest, current_user: dict = Depends(get_current_user)):
    """Ask AI a question using Gemini API"""
    try:
        if not data.prompt or data.prompt.strip() == "":
            raise HTTPException(status_code=400, detail="Prompt is required")

        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY missing in environment")

        # Call Gemini API
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
                json={
                    "contents": [
                        {
                            "parts": [
                                {"text": data.prompt}
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 1024
                    }
                },
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": gemini_api_key
                },
                timeout=30.0
            )

            if response.status_code != 200:
                error_detail = response.json().get("error", {}).get("message", "Gemini API failed")
                raise HTTPException(status_code=500, detail=error_detail)

            result = response.json()
            reply = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response generated")

        return {"reply": reply}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI request failed: {str(e)}")
