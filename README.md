# V-Core - AI Video Intelligence Platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6.svg?logo=typescript)
![FastAPI](https://img.shields.io/badge/FastAPI-0.95-009688.svg?logo=fastapi)
![Supabase](https://img.shields.io/badge/Supabase-Auth-3ecf8e.svg?logo=supabase)

> **V-Core**는 YouTube 영상을 AI로 분석하여 요약, 인사이트, 블로그/SNS 콘텐츠를 자동 생성하는 올인원 비디오 인텔리전스 플랫폼입니다.
> 
> **V-Core** acts as your AI-powered video intelligence hub, analyzing YouTube videos to generate summaries, insights, and ready-to-publish content for blogs and social media.

---

## 📋 Table of Contents (목차)

1. [Project Overview (프로젝트 개요)](#-project-overview)
2. [Key Features (핵심 기능)](#-key-features)
3. [System Architecture (시스템 구조)](#-system-architecture)
4. [Tech Stack (기술 스택)](#-tech-stack)
5. [Getting Started (시작하기)](#-getting-started)
6. [Data & Security (데이터 및 보안)](#-data--security)
7. [Roadmap (로드맵)](#-roadmap)

---

## 🎯 Project Overview

### The Problem
*   긴 영상에서 핵심 정보를 빠르게 추출하고 싶은 니즈
*   영상 기반의 2차 콘텐츠(블로그, SNS) 제작 시간 소요
*   지식 관리의 어려움

### The Solution
*   **Rapid Analysis:** YouTube URL 입력 즉시 요약 및 챕터 생성
*   **Content Generation:** 블로그, Twitter, LinkedIn 용 콘텐츠 원클릭 생성
*   **Knowledge Base:** 분석 결과를 저장하고 체계적으로 관리

---

## ✨ Key Features

### 1. AI Video Analysis
*   **Summary:** 전체 영상의 핵심 요약
*   **Insights:** 5가지 주요 인사이트 추출
*   **Chapters:** 타임스탬프가 포함된 챕터별 정리

### 2. Smart Content Creation
*   블로그 포스트 자동 생성
*   SNS 바이럴 콘텐츠 (Instagram, Twitter, LinkedIn)
*   Markdown 내보내기

### 3. AI Chat
*   영상 컨텍스트 기반 RAG 채팅
*   심층 질문 및 답변

### 4. Authentication & User Management (New!)
*   **Supabase Auth** 통합 (Email, Social Login)
*   사용자별 데이터 관리

---

## 🏗️ System Architecture

```mermaid
graph TD
    User[User] -->|Web| Frontend[React + Vite Frontend]
    Frontend -->|Auth| Supabase[Supabase Auth]
    Frontend -->|API| Backend[FastAPI Backend]
    Backend -->|Extract| YT[YouTube Transcript API]
    Backend -->|Analyze| Groq[Groq Cloud API]
    Frontend -->|Store| Local[LocalStorage (History)]
```

### Data Flow
1.  **Input:** User provides YouTube URL.
2.  **Process:** Backend fetches transcript -> Sends to Groq LLM.
3.  **Output:** Structured JSON response displayed on Frontend.
4.  **Auth:** User identity verified via Supabase.

---

## 🛠️ Tech Stack

| Category | Technology | Description |
|----------|------------|-------------|
| **Frontend** | React 19, TypeScript | Core application logic |
| **Build** | Vite | Fast development server |
| **Styling** | Tailwind CSS | Utility-first styling |
| **Routing** | React Router v6 | Navigation management |
| **Auth** | **Supabase** | User authentication & management |
| **Backend** | Python, FastAPI | API server |
| **AI** | Groq Cloud API | LLaMA 3 / Mixtral inference |
| **Icons** | Lucide React | Clean UI icons |

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   Python 3.10+
*   Supabase Project (for Auth)
*   Groq API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/v-core.git
    cd v-core
    ```

2.  **Frontend Setup**
    ```bash
    npm install
    # Create .env file if needed
    npm run dev
    ```

3.  **Backend Setup**
    ```bash
    cd backend
    pip install -r requirements.txt
    export GROQ_API_KEY="your_api_key_here"
    python main.py
    ```

---

## 🔒 Data & Security

*   **Authentication:** Powered by Supabase. Secure, token-based authentication.
*   **API Keys:** `GROQ_API_KEY` managed in backend environment variables.
*   **Local Storage:** User history stored locally for privacy and speed (syncing planned).

---

## 📊 Roadmap & Status

### ✅ Completed
- [x] Core Video Analysis Engine
- [x] Content Generation (Blog, SNS)
- [x] V-Core Rebranding
- [x] **Supabase Integration (Auth)**
- [x] Product / Pricing / About Pages
- [x] Dark Mode UI

### 🔄 In Progress
- [ ] User Profile Management
- [ ] Cross-device Sync (Supabase DB)

### 📋 Planned
- [ ] Team Collaboration
- [ ] Payment Gateway Integration

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.
