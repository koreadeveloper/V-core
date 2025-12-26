"""
VideoInsight AI - FastAPI Backend (Refactored)
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

# LangChain imports for Chat
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Import new Analysis Router
from app.api.endpoints import analysis

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

app = FastAPI(title="VideoInsight AI API", version="2.0.0")

# CORS configuration
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    """Handle CORS preflight requests explicitly."""
    origin = request.headers.get("origin", "")
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": origin if origin else "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )

# Include the Analysis Router
# Endpoints will be /api/analyze/summary, /api/analyze/quiz, etc.
app.include_router(analysis.router, prefix="/api/analyze", tags=["analysis"])


# --- Chat Functionality (Kept in main.py for now) ---

class ChatRequest(BaseModel):
    query: str
    context: str
    language: str = "ko"
    # history: List[dict] = [] # Optional

class ChatResponse(BaseModel):
    response: str

@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_video(request: ChatRequest):
    """Chat with video context using Groq LLM."""
    
    if not GROQ_API_KEY:
         return ChatResponse(response="Server Error: GROQ_API_KEY not configured.")

    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile",
        temperature=0.5,
        max_tokens=1024
    )
    
    # Language instruction based on request
    language_instruction = ""
    if request.language == "ko":
        language_instruction = "반드시 한국어로 답변하세요. "
    else:
        language_instruction = "Answer in English. "
    
    chat_prompt = PromptTemplate(
        input_variables=["context", "query", "lang_instruction"],
        template="""Based on this video transcript:
{context}

{lang_instruction}Answer this question concisely: {query}

Answer:"""
    )
    
    chain = chat_prompt | llm | StrOutputParser()
    
    try:
        response = chain.invoke({
            "context": request.context[:15000], # Limit context
            "query": request.query,
            "lang_instruction": language_instruction
        })
        return ChatResponse(response=response)
    except Exception as e:
        print(f"Chat error: {e}")
        return ChatResponse(response="죄송합니다. 오류가 발생했습니다.")


@app.get("/")
async def root():
    return {"message": "VideoInsight AI API v2 is running"}

if __name__ == "__main__":
    import uvicorn
    # Use "main:app" string to enable reload
    uvicorn.run("main:app", host="127.0.0.1", port=5000, log_level="info", reload=True)
