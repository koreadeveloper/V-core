from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json

from langchain_groq import ChatGroq
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from youtube_transcript_api import TranscriptsDisabled, NoTranscriptFound

from app.services.prompts import (
    SUMMARY_PROMPT, 
    MINDMAP_PROMPT, 
    QUIZ_PROMPT, 
    FLASHCARD_PROMPT
)
from app.services.youtube import extract_video_id, get_video_metadata, get_transcript

router = APIRouter()

# --- Dependencies & Helpers ---
def get_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
    
    return ChatGroq(
        groq_api_key=api_key,
        model_name="llama-3.3-70b-versatile",
        temperature=0.3,
        max_tokens=4096
    )

# --- Request/Response Models ---
class SummaryRequest(BaseModel):
    url: str
    length: str = "MEDIUM"
    language: str = "ko"

class BaseAnalysisRequest(BaseModel):
    transcript: str
    title: str

class VideoMetadata(BaseModel):
    id: str
    url: str
    title: str
    thumbnail: str
    duration: str
    channelTitle: str
    publishedAt: str
    views: int

class SummaryResponse(BaseModel):
    metadata: VideoMetadata
    summary: str 
    transcript: str

class MindMapResponse(BaseModel):
    markdown_code: str

class QuizItem(BaseModel):
    question: str
    options: List[str]
    answer_index: int
    explanation: str

class QuizResponse(BaseModel):
    quizzes: List[QuizItem]

class FlashcardItem(BaseModel):
    term: str
    definition: str

class FlashcardResponse(BaseModel):
    flashcards: List[FlashcardItem]


# --- Endpoints ---

@router.post("/summary", response_model=SummaryResponse)
async def generate_summary(request: SummaryRequest):
    try:
        print(f"Analyzing URL: {request.url}")
        
        # 1. Extract Info
        video_id = extract_video_id(request.url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
        print(f"Video ID extracted: {video_id}")
        
        metadata_dict = get_video_metadata(video_id)
        print(f"Metadata fetched: {metadata_dict.get('title')}")
        
        transcript = get_transcript(video_id)
        if not transcript:
            print("Transcript extraction failed.")
            raise HTTPException(status_code=404, detail="Could not extract transcript. The video might not have captions or is restricted.")
        
        print(f"Transcript fetched (Length: {len(transcript)})")

        # 2. Generate Summary
        print("Initializing LLM...")
        llm = get_llm()
        
        print("Invoking Chain...")
        chain = SUMMARY_PROMPT | llm | StrOutputParser()
        
        processed_transcript = transcript[:25000] 
        
        length_map = {
            "SHORT": "Brief/Concise",
            "MEDIUM": "Moderate/Standard",
            "LONG": "Detailed/In-depth"
        }
        
        summary_md = chain.invoke({
            "transcript": processed_transcript,
            "length_desc": length_map.get(request.length, "standard"),
            "title": metadata_dict['title']
        })
        
        print("Summary generated successfully.")
        
        return SummaryResponse(
            metadata=VideoMetadata(**metadata_dict),
            summary=summary_md,
            transcript=transcript
        )
    except HTTPException as he:
        raise he
    except TranscriptsDisabled:
        print("Error: Transcripts are disabled for this video.")
        raise HTTPException(
            status_code=400, 
            detail={"code": "ERR_YT_TRANSCRIPT_DISABLED", "message": "이 동영상은 자막이 비활성화되어 있습니다. (Transcripts Disabled)"}
        )
    except NoTranscriptFound:
        print("Error: No transcript found.")
        raise HTTPException(
            status_code=404, 
            detail={"code": "ERR_YT_NO_TRANSCRIPT", "message": "이 동영상에서 자막을 찾을 수 없습니다. (No Transcript Found)"}
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        error_msg = str(e)
        if "429" in error_msg:
             raise HTTPException(
                status_code=429, 
                detail={"code": "ERR_LLM_RATE_LIMIT", "message": "AI 모델 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요. (Rate Limit Exceeded)"}
            )
        
        print(f"General Error: {error_msg}")
        raise HTTPException(
            status_code=500, 
            detail={"code": "ERR_INTERNAL_SERVER", "message": f"서버 내부 오류가 발생했습니다. 담당자에게 문의해주세요.\nDetails: {error_msg}"}
        )


@router.post("/mindmap", response_model=MindMapResponse)
async def generate_mindmap(request: BaseAnalysisRequest):
    llm = get_llm()
    chain = MINDMAP_PROMPT | llm | StrOutputParser()
    
    processed_transcript = request.transcript[:20000] 
    
    mermaid_code = chain.invoke({
        "transcript": processed_transcript,
        "title": request.title
    })
    
    # Cleanup code blocks if model insists on adding them
    cleaned = mermaid_code.replace("```mermaid", "").replace("```", "").strip()
    
    return MindMapResponse(markdown_code=cleaned)


@router.post("/quiz", response_model=QuizResponse)
async def generate_quiz(request: BaseAnalysisRequest):
    llm = get_llm()
    chain = QUIZ_PROMPT | llm | JsonOutputParser()
    
    processed_transcript = request.transcript[:20000]
    
    try:
        data = chain.invoke({
            "transcript": processed_transcript,
            "title": request.title
        })
        # data should be {"quizzes": [...]}
        return QuizResponse(**data)
    except Exception as e:
        print(f"Quiz generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate quiz")


@router.post("/flashcards", response_model=FlashcardResponse)
async def generate_flashcards(request: BaseAnalysisRequest):
    llm = get_llm()
    chain = FLASHCARD_PROMPT | llm | JsonOutputParser()
    
    processed_transcript = request.transcript[:20000]
    
    try:
        data = chain.invoke({
            "transcript": processed_transcript,
            "title": request.title
        })
        return FlashcardResponse(**data)
    except Exception as e:
        print(f"Flashcard generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate flashcards")
