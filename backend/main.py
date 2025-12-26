"""
VideoInsight AI - FastAPI Backend
==================================
Backend API for YouTube video analysis and summarization using Groq Cloud.
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, List
import re
import os

# Groq and LangChain imports
from groq import Groq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

# YouTube imports
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import yt_dlp

# Hardcoded API key (will be replaced by env var in production)
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Key (loaded from .env)
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY is not set in environment variables.")


app = FastAPI(title="VideoInsight AI API", version="1.0.0")

# CORS configuration - must not use "*" with allow_credentials=True
origins = [
    "*", # Allow all origins for now to fix deployment issues
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)



# Explicit OPTIONS handler for CORS preflight (fallback)
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    """Handle CORS preflight requests explicitly."""
    origin = request.headers.get("origin", "")
    if origin in origins:
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
            }
        )
    return Response(status_code=403)


# Pydantic models
class AnalyzeRequest(BaseModel):
    url: str
    length: str = "MEDIUM"  # SHORT, MEDIUM, LONG
    language: str = "ko"  # ko or en


class TimestampEntry(BaseModel):
    time: str
    label: str


class Sentiment(BaseModel):
    score: float
    label: str
    description: str


class AnalysisResult(BaseModel):
    summary: str
    takeaways: List[str]
    timestamps: List[TimestampEntry]
    sentiment: Sentiment
    keywords: List[str]
    script: str


class SNS(BaseModel):
    twitter: str
    linkedin: str
    instagram: str


class GeneratedContent(BaseModel):
    blog: str
    sns: SNS
    newsletter: str


class AnalyzeResponse(BaseModel):
    metadata: dict
    analysis: AnalysisResult
    assets: GeneratedContent


class ChatRequest(BaseModel):
    query: str
    context: str
    language: str = "ko"
    history: List[dict] = []


class ChatResponse(BaseModel):
    response: str


# Helper functions
def extract_video_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from various URL formats."""
    patterns = [
        r'(?:v=|\/)([0-9A-Za-z_-]{11}).*',
        r'(?:embed\/)([0-9A-Za-z_-]{11})',
        r'(?:youtu\.be\/)([0-9A-Za-z_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def get_video_metadata(video_id: str) -> dict:
    """Get video metadata using yt-dlp."""
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            return {
                'id': video_id,
                'url': f"https://www.youtube.com/watch?v={video_id}",
                'title': info.get('title', 'Unknown Title'),
                'thumbnail': info.get('thumbnail', f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"),
                'duration': format_duration(info.get('duration', 0)),
                'channelTitle': info.get('channel', 'Unknown Channel'),
                'publishedAt': info.get('upload_date', 'Unknown'),
            }
    except Exception as e:
        return {
            'id': video_id,
            'url': f"https://www.youtube.com/watch?v={video_id}",
            'title': 'Video Analysis',
            'thumbnail': f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
            'duration': '0:00',
            'channelTitle': 'Unknown Channel',
            'publishedAt': 'Unknown',
        }


def format_duration(seconds: int) -> str:
    """Format seconds to MM:SS or HH:MM:SS."""
    if seconds < 3600:
        return f"{seconds // 60}:{seconds % 60:02d}"
    return f"{seconds // 3600}:{(seconds % 3600) // 60:02d}:{seconds % 60:02d}"


def get_transcript(video_id: str) -> Optional[str]:
    """Get transcript from YouTube video."""
    try:
        ytt_api = YouTubeTranscriptApi()
        
        languages_to_try = [['ko'], ['en'], ['ko', 'en']]
        
        for langs in languages_to_try:
            try:
                fetched = ytt_api.fetch(video_id, languages=langs)
                transcript_data = fetched.to_raw_data()
                return " ".join([entry['text'] for entry in transcript_data])
            except Exception:
                continue
        
        # Try any available
        try:
            transcript_list = ytt_api.list(video_id)
            for transcript in transcript_list:
                fetched = transcript.fetch()
                return " ".join([entry['text'] for entry in fetched.to_raw_data()])
        except:
            pass
            
    except Exception as e:
        print(f"Transcript error: {e}")
    
    return None


def chunk_text(text: str, chunk_size: int = 4000, overlap: int = 200) -> List[str]:
    """Split text into manageable chunks."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    return splitter.split_text(text)


def analyze_with_llm(transcript: str, length: str, title: str, language: str = "ko") -> tuple:
    """Analyze transcript and generate content using Groq LLM."""
    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name="llama-3.3-70b-versatile",
        temperature=0.3,
        max_tokens=4096
    )
    
    # Language-specific configurations
    if language == "ko":
        length_guide = {
            "SHORT": "2-3문장",
            "MEDIUM": "1개 단락",
            "LONG": "2-3개 단락"
        }
        
        # Korean analysis prompt
        analysis_prompt = PromptTemplate(
            input_variables=["transcript", "length_desc", "title"],
            template="""다음 YouTube 영상 "{title}"의 스크립트를 분석해주세요:

{transcript}

중요: 반드시 순수 한국어로만 작성하세요. 한자(中文/漢字)를 절대 사용하지 마세요. 
반드시 한국어로 다음 JSON 형식으로 분석 결과를 제공하세요 (오직 유효한 JSON만 응답):
{{
    "summary": "{length_desc} 분량의 영상 내용 요약 (한국어로)",
    "takeaways": ["핵심 인사이트 1", "핵심 인사이트 2", "핵심 인사이트 3", "핵심 인사이트 4", "핵심 인사이트 5"],
    "timestamps": [
        {{"time": "0:00", "label": "인트로 및 시작"}},
        {{"time": "2:30", "label": "본론 시작"}},
        {{"time": "5:00", "label": "핵심 논의"}},
        {{"time": "8:00", "label": "마무리"}}
    ],
    "sentiment": {{
        "score": 0.75,
        "label": "긍정적/중립적/부정적",
        "description": "전체적인 톤에 대한 간략한 설명 (한국어로)"
    }},
    "keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"]
}}"""
        )
    else:
        length_guide = {
            "SHORT": "2-3 sentences",
            "MEDIUM": "1 paragraph",
            "LONG": "2-3 paragraphs"
        }
        
        # English analysis prompt
        analysis_prompt = PromptTemplate(
            input_variables=["transcript", "length_desc", "title"],
            template="""Analyze this YouTube video transcript titled "{title}":

{transcript}

Provide a comprehensive analysis in the following JSON format (respond ONLY with valid JSON):
{{
    "summary": "{length_desc} summary of the video content",
    "takeaways": ["key insight 1", "key insight 2", "key insight 3", "key insight 4", "key insight 5"],
    "timestamps": [
        {{"time": "0:00", "label": "Introduction and opening"}},
        {{"time": "2:30", "label": "Main topic begins"}},
        {{"time": "5:00", "label": "Key discussion point"}},
        {{"time": "8:00", "label": "Conclusion"}}
    ],
    "sentiment": {{
        "score": 0.75,
        "label": "Positive/Neutral/Negative",
        "description": "Brief description of the overall tone"
    }},
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}}"""
        )
    
    # Content generation prompt
    if language == "ko":
        content_prompt = PromptTemplate(
            input_variables=["summary", "takeaways", "title"],
            template="""다음 영상 "{title}"을 기반으로:
요약: {summary}
핵심 포인트: {takeaways}

반드시 한국어로 다음 JSON 형식의 콘텐츠를 생성하세요 (유효한 JSON만 응답):
{{
    "blog": "# {title}\\n\\n## 소개\\n\\n[매력적인 도입부 작성 - 한국어로]\\n\\n## 핵심 포인트\\n\\n[주요 내용 - 한국어로]\\n\\n## 결론\\n\\n[마무리 - 한국어로]",
    "sns": {{
        "twitter": "280자 이내의 매력적인 트윗과 관련 이모지 (한국어로)",
        "linkedin": "핵심 인사이트를 담은 전문적인 LinkedIn 포스트 (한국어로)",
        "instagram": "이모지와 해시태그가 포함된 매력적인 인스타그램 캡션 (한국어로)"
    }},
    "newsletter": "인사말, 주요 내용, 행동 유도 문구가 포함된 뉴스레터 형식 (한국어로)"
}}"""
        )
    else:
        content_prompt = PromptTemplate(
            input_variables=["summary", "takeaways", "title"],
            template="""Based on this video "{title}":
Summary: {summary}
Key Points: {takeaways}

Generate content in the following JSON format (respond ONLY with valid JSON):
{{
    "blog": "# {title}\\n\\n## Introduction\\n\\n[Write engaging intro]\\n\\n## Key Points\\n\\n[Main content]\\n\\n## Conclusion\\n\\n[Wrap up]",
    "sns": {{
        "twitter": "Compelling tweet under 280 chars with relevant emojis",
        "linkedin": "Professional LinkedIn post with key insights",
        "instagram": "Engaging Instagram caption with emojis and hashtags"
    }},
    "newsletter": "Newsletter format with greeting, main content, and call to action"
}}"""
        )
    
    # Handle long transcripts with chunking
    chunks = chunk_text(transcript)
    
    if len(chunks) > 1:
        # Map-reduce for long content
        chunk_summaries = []
        for i, chunk in enumerate(chunks[:5]):  # Limit to 5 chunks
            map_prompt = PromptTemplate(
                input_variables=["chunk"],
                template="Summarize this part of a video transcript:\n\n{chunk}\n\nSummary:"
            )
            chain = map_prompt | llm | StrOutputParser()
            chunk_summaries.append(chain.invoke({"chunk": chunk}))
        
        combined_transcript = "\n\n".join(chunk_summaries)
    else:
        combined_transcript = transcript[:8000]  # Limit length
    
    # Generate analysis
    analysis_chain = analysis_prompt | llm | StrOutputParser()
    analysis_result = analysis_chain.invoke({
        "transcript": combined_transcript,
        "length_desc": length_guide.get(length, "1 paragraph"),
        "title": title
    })
    
    # Parse analysis JSON
    import json
    try:
        # Clean up the response
        analysis_json = analysis_result.strip()
        if analysis_json.startswith("```json"):
            analysis_json = analysis_json[7:]
        if analysis_json.startswith("```"):
            analysis_json = analysis_json[3:]
        if analysis_json.endswith("```"):
            analysis_json = analysis_json[:-3]
        analysis_data = json.loads(analysis_json.strip())
    except:
        analysis_data = {
            "summary": analysis_result[:500],
            "takeaways": ["Key insight from the video"],
            "timestamps": [{"time": "0:00", "label": "Video start"}],
            "sentiment": {"score": 0.7, "label": "Neutral", "description": "Informative content"},
            "keywords": ["video", "content"]
        }
    
    # Generate content
    content_chain = content_prompt | llm | StrOutputParser()
    content_result = content_chain.invoke({
        "summary": analysis_data.get("summary", ""),
        "takeaways": ", ".join(analysis_data.get("takeaways", [])),
        "title": title
    })
    
    # Parse content JSON
    try:
        content_json = content_result.strip()
        if content_json.startswith("```json"):
            content_json = content_json[7:]
        if content_json.startswith("```"):
            content_json = content_json[3:]
        if content_json.endswith("```"):
            content_json = content_json[:-3]
        content_data = json.loads(content_json.strip())
    except:
        content_data = {
            "blog": f"# {title}\n\n{analysis_data.get('summary', '')}",
            "sns": {
                "twitter": f"Check out this video: {title}",
                "linkedin": f"Interesting insights from: {title}",
                "instagram": f"🎬 {title} #video #content"
            },
            "newsletter": f"Today's highlight: {title}"
        }
    
    return analysis_data, content_data, transcript


# API Endpoints
@app.get("/")
async def root():
    return {"message": "VideoInsight AI API is running"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_video(request: AnalyzeRequest):
    """Analyze a YouTube video and return summary, takeaways, and generated content."""
    
    try:
        # Extract video ID
        video_id = extract_video_id(request.url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube URL")
        
        # Get metadata
        metadata = get_video_metadata(video_id)
        
        # Get transcript
        transcript = get_transcript(video_id)
        if not transcript:
            raise HTTPException(status_code=404, detail="Could not extract transcript. This video may not have subtitles.")
        
        # Analyze with LLM
        analysis_data, content_data, script = analyze_with_llm(
            transcript, 
            request.length,
            metadata['title'],
            request.language
        )
        
        # Build response
        return AnalyzeResponse(
            metadata=metadata,
            analysis=AnalysisResult(
                summary=analysis_data.get("summary", ""),
                takeaways=analysis_data.get("takeaways", []),
                timestamps=[TimestampEntry(**t) for t in analysis_data.get("timestamps", [])],
                sentiment=Sentiment(**analysis_data.get("sentiment", {"score": 0.7, "label": "Neutral", "description": ""})),
                keywords=analysis_data.get("keywords", []),
                script=script[:5000]  # Limit script length
            ),
            assets=GeneratedContent(
                blog=content_data.get("blog", ""),
                sns=SNS(**content_data.get("sns", {"twitter": "", "linkedin": "", "instagram": ""})),
                newsletter=content_data.get("newsletter", "")
            )
        )
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        error_msg = str(e)
        print(f"Analysis error: {error_msg}")
        
        # Check for rate limit error
        if "rate_limit" in error_msg.lower() or "rate limit" in error_msg.lower():
            raise HTTPException(
                status_code=429, 
                detail="API 요청 한도 초과. 잠시 후 다시 시도해주세요. (Rate limit exceeded. Please try again later.)"
            )
        
        # Check for authentication error
        if "authentication" in error_msg.lower() or "api_key" in error_msg.lower():
            raise HTTPException(
                status_code=401,
                detail="API 인증 오류. 관리자에게 문의하세요. (API authentication error.)"
            )
        
        # Generic error
        raise HTTPException(
            status_code=500,
            detail=f"분석 중 오류가 발생했습니다: {error_msg[:200]}"
        )


@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_video(request: ChatRequest):
    """Chat with video context using Groq LLM."""
    
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
    response = chain.invoke({
        "context": request.context[:4000],
        "query": request.query,
        "lang_instruction": language_instruction
    })
    
    return ChatResponse(response=response)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000, log_level="info")
