"""
YouTube Video Summarizer with Groq Cloud
=========================================
A Streamlit application that extracts YouTube video transcripts or audio,
and uses Groq Cloud for AI-powered summarization.
"""

import streamlit as st
import os
import re
import uuid
import tempfile
from typing import Optional, Tuple, List
from datetime import datetime

# Groq and LangChain imports
from groq import Groq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

# YouTube imports
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import yt_dlp

# Page configuration
st.set_page_config(
    page_title="YouTube AI 요약기 - Groq Cloud",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better UI
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-align: center;
        margin-bottom: 2rem;
    }
    .status-box {
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: #1e1e1e;
        border: 1px solid #333;
    }
    .summary-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 1.5rem;
        border-radius: 1rem;
        color: white;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 2rem;
    }
    .stTabs [data-baseweb="tab"] {
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)


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
            'extract_flat': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            return {
                'title': info.get('title', 'Unknown Title'),
                'thumbnail': info.get('thumbnail', ''),
                'duration': info.get('duration', 0),
                'channel': info.get('channel', 'Unknown Channel'),
                'view_count': info.get('view_count', 0),
            }
    except Exception as e:
        st.warning(f"메타데이터 추출 실패: {e}")
        return {
            'title': 'Unknown Title',
            'thumbnail': '',
            'duration': 0,
            'channel': 'Unknown Channel',
            'view_count': 0,
        }


def get_transcript(video_id: str) -> Tuple[Optional[str], str]:
    """
    Step A: Try to get existing transcript from YouTube.
    Returns (transcript_text, source) where source is 'subtitle' or 'none'.
    Uses youtube-transcript-api v1.x API.
    """
    try:
        # Create API instance
        ytt_api = YouTubeTranscriptApi()
        
        # Try to fetch with Korean first, then English
        languages_to_try = [
            ['ko'],           # Korean
            ['en'],           # English
            ['ko', 'en'],     # Either
        ]
        
        transcript_data = None
        
        for langs in languages_to_try:
            try:
                fetched = ytt_api.fetch(video_id, languages=langs)
                transcript_data = fetched.to_raw_data()
                break
            except Exception:
                continue
        
        # If no transcript found with preferred languages, try to list and get any available
        if transcript_data is None:
            try:
                transcript_list = ytt_api.list(video_id)
                for transcript in transcript_list:
                    fetched = transcript.fetch()
                    transcript_data = fetched.to_raw_data()
                    break
            except Exception:
                pass
        
        if transcript_data:
            full_text = " ".join([entry['text'] for entry in transcript_data])
            return full_text, 'subtitle'
            
    except TranscriptsDisabled:
        st.info("이 영상은 자막이 비활성화되어 있습니다. 오디오 분석을 시도합니다.")
    except NoTranscriptFound:
        st.info("자막을 찾을 수 없습니다. 오디오 분석을 시도합니다.")
    except Exception as e:
        st.warning(f"자막 추출 중 오류: {e}")
    
    return None, 'none'


def download_audio(video_id: str, output_dir: str) -> Optional[str]:
    """
    Step B: Download audio from YouTube using yt-dlp.
    Returns path to downloaded audio file.
    """
    unique_id = str(uuid.uuid4())[:8]
    output_path = os.path.join(output_dir, f"audio_{video_id}_{unique_id}")
    
    ydl_opts = {
        'format': 'bestaudio[ext=m4a]/bestaudio/best',
        'outtmpl': output_path + '.%(ext)s',
        'quiet': True,
        'no_warnings': True,
        'extract_audio': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '128',
        }],
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([f"https://www.youtube.com/watch?v={video_id}"])
        
        # Find the downloaded file
        for ext in ['mp3', 'm4a', 'webm', 'opus']:
            file_path = output_path + '.' + ext
            if os.path.exists(file_path):
                return file_path
                
        # Check if any file was created with the prefix
        for f in os.listdir(output_dir):
            if f.startswith(f"audio_{video_id}_{unique_id}"):
                return os.path.join(output_dir, f)
                
    except Exception as e:
        st.error(f"오디오 다운로드 실패: {e}")
    
    return None


def transcribe_audio_with_groq(audio_path: str, api_key: str) -> Optional[str]:
    """
    Step 2: Use Groq Whisper API for speech-to-text.
    """
    try:
        client = Groq(api_key=api_key)
        
        # Check file size (Groq has limits)
        file_size = os.path.getsize(audio_path)
        if file_size > 25 * 1024 * 1024:  # 25MB limit
            st.warning("오디오 파일이 25MB를 초과합니다. 처음 25MB만 처리합니다.")
        
        with open(audio_path, "rb") as audio_file:
            transcription = client.audio.transcriptions.create(
                file=(os.path.basename(audio_path), audio_file.read()),
                model="whisper-large-v3",
                language="ko",  # Try Korean first
                response_format="text"
            )
        
        return transcription
        
    except Exception as e:
        st.error(f"음성 인식 실패: {e}")
        return None


def chunk_text(text: str, chunk_size: int = 4000, overlap: int = 200) -> List[str]:
    """
    Step 3: Split text into manageable chunks for LLM processing.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    chunks = splitter.split_text(text)
    return chunks


def summarize_chunk(chunk: str, chunk_num: int, total_chunks: int, llm: ChatGroq) -> str:
    """Map step: Summarize a single chunk."""
    map_prompt = PromptTemplate(
        input_variables=["chunk", "chunk_num", "total_chunks"],
        template="""다음은 YouTube 영상의 {chunk_num}/{total_chunks} 부분입니다.

이 부분의 핵심 내용을 요약해주세요:

{chunk}

요약:"""
    )
    
    chain = map_prompt | llm | StrOutputParser()
    result = chain.invoke({"chunk": chunk, "chunk_num": chunk_num, "total_chunks": total_chunks})
    return result


def final_summarize(summaries: List[str], llm: ChatGroq) -> dict:
    """Reduce step: Combine all chunk summaries into final output."""
    combined = "\n\n---\n\n".join(summaries)
    
    reduce_prompt = PromptTemplate(
        input_variables=["summaries"],
        template="""다음은 YouTube 영상의 각 부분별 요약입니다:

{summaries}

위 내용을 바탕으로 다음 형식으로 최종 분석을 작성해주세요:

## 🎯 핵심 내용 3줄 요약
(가장 중요한 내용 3가지를 간결하게)

## 📋 타임라인별 상세 내용
(영상의 주요 흐름을 시간순으로 설명)

## 🏷️ 주요 키워드 해시태그
(영상의 핵심 키워드를 해시태그 형식으로 나열)

## 💡 핵심 인사이트
(영상에서 얻을 수 있는 주요 통찰이나 교훈)

분석 결과:"""
    )
    
    chain = reduce_prompt | llm | StrOutputParser()
    result = chain.invoke({"summaries": combined})
    
    return {
        'full_analysis': result,
        'chunk_summaries': summaries
    }


def process_video(video_id: str, api_key: str) -> dict:
    """Main processing pipeline."""
    results = {
        'metadata': None,
        'transcript': None,
        'source': None,
        'summary': None,
        'error': None
    }
    
    # Get metadata
    with st.status("📊 영상 정보 가져오는 중...", expanded=True) as status:
        results['metadata'] = get_video_metadata(video_id)
        st.write(f"✅ 영상 제목: {results['metadata']['title']}")
        status.update(label="✅ 영상 정보 완료", state="complete")
    
    # Step 1: Try to get transcript
    with st.status("📝 자막 확인 중...", expanded=True) as status:
        transcript, source = get_transcript(video_id)
        
        if transcript:
            results['transcript'] = transcript
            results['source'] = 'subtitle'
            st.write(f"✅ 자막 추출 완료 ({len(transcript):,}자)")
            status.update(label="✅ 자막 추출 완료", state="complete")
        else:
            status.update(label="⚠️ 자막 없음 - 오디오 분석 필요", state="complete")
    
    # Step 2: If no transcript, download and transcribe audio
    if results['transcript'] is None:
        with st.status("🎵 오디오 다운로드 중...", expanded=True) as status:
            with tempfile.TemporaryDirectory() as temp_dir:
                audio_path = download_audio(video_id, temp_dir)
                
                if audio_path:
                    st.write(f"✅ 오디오 다운로드 완료")
                    status.update(label="✅ 오디오 다운로드 완료", state="complete")
                    
                    with st.status("🎤 Groq Whisper로 음성 인식 중...", expanded=True) as stt_status:
                        transcript = transcribe_audio_with_groq(audio_path, api_key)
                        
                        if transcript:
                            results['transcript'] = transcript
                            results['source'] = 'whisper'
                            st.write(f"✅ 음성 인식 완료 ({len(transcript):,}자)")
                            stt_status.update(label="✅ 음성 인식 완료", state="complete")
                        else:
                            results['error'] = "음성 인식에 실패했습니다."
                            stt_status.update(label="❌ 음성 인식 실패", state="error")
                            return results
                else:
                    results['error'] = "오디오 다운로드에 실패했습니다."
                    status.update(label="❌ 오디오 다운로드 실패", state="error")
                    return results
    
    # Step 3 & 4: Chunk and summarize
    if results['transcript']:
        with st.status("🤖 AI 분석 중...", expanded=True) as status:
            # Initialize LLM
            llm = ChatGroq(
                groq_api_key=api_key,
                model_name="llama-3.3-70b-versatile",
                temperature=0.3,
                max_tokens=4096
            )
            
            # Chunk the text
            chunks = chunk_text(results['transcript'])
            st.write(f"📄 텍스트를 {len(chunks)}개 청크로 분할")
            
            if len(chunks) == 1:
                # Short video - direct summarization
                st.write("🔄 단일 요약 진행 중...")
                summary_result = final_summarize([results['transcript']], llm)
            else:
                # Long video - Map-Reduce
                st.write("🔄 Map-Reduce 요약 진행 중...")
                chunk_summaries = []
                
                progress_bar = st.progress(0)
                for i, chunk in enumerate(chunks):
                    chunk_summary = summarize_chunk(chunk, i+1, len(chunks), llm)
                    chunk_summaries.append(chunk_summary)
                    progress_bar.progress((i + 1) / len(chunks))
                
                summary_result = final_summarize(chunk_summaries, llm)
            
            results['summary'] = summary_result
            st.write("✅ AI 분석 완료!")
            status.update(label="✅ AI 분석 완료", state="complete")
    
    return results


def main():
    # Header
    st.markdown('<h1 class="main-header">🎬 YouTube AI 요약기</h1>', unsafe_allow_html=True)
    st.markdown('<p style="text-align: center; color: #888;">Groq Cloud 기반 초고속 영상 분석</p>', unsafe_allow_html=True)
    
    # Sidebar
    with st.sidebar:
        st.header("⚙️ 설정")
        
        api_key = st.text_input(
            "Groq API Key",
            type="password",
            placeholder="gsk_...",
            help="Groq Cloud에서 발급받은 API 키를 입력하세요."
        )
        
        if api_key:
            st.success("✅ API Key 설정됨")
        else:
            st.warning("⚠️ API Key를 입력해주세요")
        
        st.divider()
        
        st.markdown("""
        ### 📌 사용 방법
        1. Groq API Key 입력
        2. YouTube URL 붙여넣기
        3. '분석 시작' 클릭
        4. 결과 확인!
        
        ### 🚀 처리 순서
        1. 자막 추출 시도
        2. (자막 없으면) 오디오 다운로드
        3. Whisper로 음성 인식
        4. LLM으로 요약 생성
        """)
    
    # Main content
    col1, col2 = st.columns([3, 1])
    
    with col1:
        url = st.text_input(
            "YouTube URL",
            placeholder="https://www.youtube.com/watch?v=...",
            help="분석할 YouTube 영상의 URL을 입력하세요."
        )
    
    with col2:
        st.write("")  # Spacing
        st.write("")  # Spacing
        analyze_button = st.button("🔍 분석 시작", type="primary", use_container_width=True)
    
    # Process video
    if analyze_button:
        if not api_key:
            st.error("❌ Groq API Key를 입력해주세요.")
            return
        
        if not url:
            st.error("❌ YouTube URL을 입력해주세요.")
            return
        
        video_id = extract_video_id(url)
        if not video_id:
            st.error("❌ 유효하지 않은 YouTube URL입니다.")
            return
        
        # Process the video
        results = process_video(video_id, api_key)
        
        if results['error']:
            st.error(f"❌ 오류: {results['error']}")
            return
        
        # Display results
        st.divider()
        
        # Video info header
        if results['metadata']:
            col1, col2 = st.columns([1, 2])
            with col1:
                if results['metadata']['thumbnail']:
                    st.image(results['metadata']['thumbnail'], use_container_width=True)
            with col2:
                st.subheader(results['metadata']['title'])
                st.caption(f"📺 {results['metadata']['channel']}")
                
                duration_mins = results['metadata']['duration'] // 60
                duration_secs = results['metadata']['duration'] % 60
                source_label = "📝 자막" if results['source'] == 'subtitle' else "🎤 Whisper STT"
                
                st.markdown(f"""
                - ⏱️ **길이**: {duration_mins}분 {duration_secs}초
                - 👁️ **조회수**: {results['metadata']['view_count']:,}
                - 📄 **소스**: {source_label}
                - 📊 **텍스트 길이**: {len(results['transcript']):,}자
                """)
        
        # Tabs for results
        if results['summary']:
            tab1, tab2, tab3 = st.tabs(["📋 요약", "📊 상세 분석", "📄 원본 스크립트"])
            
            with tab1:
                st.markdown(results['summary']['full_analysis'])
            
            with tab2:
                if len(results['summary']['chunk_summaries']) > 1:
                    st.subheader("청크별 요약")
                    for i, chunk_summary in enumerate(results['summary']['chunk_summaries']):
                        with st.expander(f"📄 Part {i+1}"):
                            st.write(chunk_summary)
                else:
                    st.info("이 영상은 짧아서 단일 요약으로 처리되었습니다.")
            
            with tab3:
                st.text_area(
                    "원본 스크립트",
                    value=results['transcript'],
                    height=400,
                    disabled=True
                )
                
                # Download button
                st.download_button(
                    label="📥 스크립트 다운로드",
                    data=results['transcript'],
                    file_name=f"transcript_{video_id}.txt",
                    mime="text/plain"
                )


if __name__ == "__main__":
    main()
