import re
import yt_dlp
from typing import Optional, List
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

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

def format_duration(seconds: int) -> str:
    """Format seconds to MM:SS or HH:MM:SS."""
    if seconds < 3600:
        return f"{seconds // 60}:{seconds % 60:02d}"
    return f"{seconds // 3600}:{(seconds % 3600) // 60:02d}:{seconds % 60:02d}"

def get_video_metadata(video_id: str) -> dict:
    """Get video metadata using yt-dlp."""
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Note: This might be slow for some videos as it fetches info
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
            return {
                'id': video_id,
                'url': f"https://www.youtube.com/watch?v={video_id}",
                'title': info.get('title', 'Unknown Title'),
                'thumbnail': info.get('thumbnail', f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"),
                'duration': format_duration(info.get('duration', 0)),
                'channelTitle': info.get('channel', 'Unknown Channel'),
                'publishedAt': info.get('upload_date', 'Unknown'),
                'views': info.get('view_count', 0),
            }
    except Exception as e:
        print(f"Metadata error: {e}")
        return {
            'id': video_id,
            'url': f"https://www.youtube.com/watch?v={video_id}",
            'title': 'Video Analysis',
            'thumbnail': f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg",
            'duration': '0:00',
            'channelTitle': 'Unknown Channel',
            'publishedAt': 'Unknown',
            'views': 0,
        }

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
