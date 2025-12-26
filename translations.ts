export type Language = 'ko' | 'en';

export interface Translations {
    [key: string]: string;
}

const translations: Record<Language, Translations> = {
    ko: {
        // Hero section
        heroTitle: '당신의 시간을 소중하게',
        heroDescription: 'V-Core는 그 자산을 가장 가치 있게 사용하는 방법을 제안합니다. 복잡한 영상 속에서 핵심 맥락을 읽어내어, 당신이 바로 행동에 옮길 수 있는 명확한 정보를 제공합니다. 영상 그 이상의 가치를 봅니다.',
        urlPlaceholder: 'YouTube URL을 입력하세요...',
        startAnalysis: '분석 시작 →',
        trustTitle: '혁신적인 팀들이 신뢰합니다',

        // Summary length
        summaryLengthShort: '짧게',
        summaryLengthMedium: '보통',
        summaryLengthLong: '자세히',

        // Status messages
        statusConnecting: '서버 연결 중...',
        statusExtracting: '영상 자막 추출 중...',
        statusAnalyzing: 'AI 분석 진행 중...',

        // Analysis Display
        summaryTitle: '요약',
        insightsTitle: '핵심 인사이트',
        chaptersTitle: '타임라인 챕터',
        assetsTitle: '콘텐츠 자산',
        keywordsTitle: '키워드',
        sentimentTitle: '감성 분석',
        exportMarkdown: '마크다운 내보내기',
        shareText: '공유',
        askAI: '영상에 대해 AI에게 질문하세요',

        // Assets tabs
        blogTab: '블로그 포스트',
        socialTab: 'SNS 캡션',
        twitterCaption: 'Twitter/X',
        linkedinCaption: 'LinkedIn',
        instagramCaption: 'Instagram',

        // Chat Modal
        chatTitle: 'AI에게 질문하기',
        chatPlaceholder: '영상 내용에 대해 질문하세요...',
        chatClose: '닫기',
        chatError: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',

        // Sidebar
        sidebarHome: '홈',
        sidebarRecent: '최근 활동',
        sidebarKnowledge: '지식 보관소',
        sidebarAssets: '자산 관리',

        // Header
        headerProduct: '제품',
        headerAbout: '소개',
        headerPricing: '가격',
        headerSignIn: '로그인',

        // Settings
        settingsTitle: '설정',
        settingsServiceLanguage: '서비스 언어',
        settingsAILanguage: 'AI 결과 언어',
        settingsModelSelection: '모델 선택',
        settingsSTTHint: 'STT 힌트 언어',
        settingsMaxTokens: '최대 토큰',
        settingsSave: '저장',
        settingsCancel: '취소',

        // Loading screen
        loadingConnecting: '서버 연결 중...',
        loadingExtracting: '영상 자막 추출 중...',
        loadingAnalyzing: 'AI 분석 진행 중...',

        // Logical Chapters
        logicalChapters: '논리적 챕터',

        // Ask Intelligence (Chat)
        askIntelligence: 'AI에게 질문하기',
        chatInputPlaceholder: '이 영상에 대해 궁금한 점을 물어보세요...',
        chatSend: '전송',

        // Keywords section
        keywordsSectionTitle: '키워드',

        // Recent page
        recentTitle: '최근 활동',
        recentSearch: '검색...',
        recentNoItems: '아직 분석 히스토리가 없습니다.',
        recentPin: '고정',
        recentUnpin: '고정 해제',
        recentDelete: '삭제',
        recentView: '보기',

        // Knowledge page
        knowledgeTitle: '지식 보관소',
        knowledgeSearch: '영상 검색...',
        knowledgeNoItems: '저장된 영상이 없습니다.',
        knowledgeAddCategory: '카테고리 추가',
        knowledgeAllCategory: '전체 동영상',
        knowledgeNotes: '메모',

        // Assets page
        assetsPageTitle: '자산 관리',
        promptLibrary: '프롬프트 라이브러리',
        glossary: '용어 사전',
        downloadCenter: '다운로드 센터',
        addPrompt: '프롬프트 추가',
        addTerm: '용어 추가',
    },
    en: {
        // Hero section
        heroTitle: 'Knowledge is money.',
        heroTitleHighlight: 'Save both.',
        heroDescription: 'V-Core helps research teams, creators, and professionals turn hours of video into actionable intelligence in seconds.',
        urlPlaceholder: 'Enter YouTube URL...',
        startAnalysis: 'Start Analysis →',
        trustTitle: 'Trusted by innovative teams',

        // Summary length
        summaryLengthShort: 'Short',
        summaryLengthMedium: 'Medium',
        summaryLengthLong: 'Detailed',

        // Status messages
        statusConnecting: 'Connecting to server...',
        statusExtracting: 'Extracting video transcript...',
        statusAnalyzing: 'AI analysis in progress...',

        // Analysis Display
        summaryTitle: 'Summary',
        insightsTitle: 'Key Insights',
        chaptersTitle: 'Timeline Chapters',
        assetsTitle: 'Content Assets',
        keywordsTitle: 'Keywords',
        sentimentTitle: 'Sentiment Analysis',
        exportMarkdown: 'Export Markdown',
        shareText: 'Share',
        askAI: 'Ask AI about this video',

        // Assets tabs
        blogTab: 'Blog Post',
        socialTab: 'Social Caption',
        twitterCaption: 'Twitter/X',
        linkedinCaption: 'LinkedIn',
        instagramCaption: 'Instagram',

        // Chat Modal
        chatTitle: 'Ask AI',
        chatPlaceholder: 'Ask about the video content...',
        chatClose: 'Close',
        chatError: 'Sorry, an error occurred. Please try again.',

        // Sidebar
        sidebarHome: 'Home',
        sidebarRecent: 'Recent',
        sidebarKnowledge: 'Knowledge Base',
        sidebarAssets: 'Assets',

        // Header
        headerProduct: 'Product',
        headerAbout: 'About',
        headerPricing: 'Pricing',
        headerSignIn: 'Sign In',

        // Settings
        settingsTitle: 'Settings',
        settingsServiceLanguage: 'Service Language',
        settingsAILanguage: 'AI Outcome Language',
        settingsModelSelection: 'Model Selection',
        settingsSTTHint: 'STT Hint Language',
        settingsMaxTokens: 'Max Tokens',
        settingsSave: 'Save',
        settingsCancel: 'Cancel',

        // Loading screen
        loadingConnecting: 'Connecting to server...',
        loadingExtracting: 'Extracting video transcript...',
        loadingAnalyzing: 'AI analysis in progress...',

        // Logical Chapters
        logicalChapters: 'Logical Chapters',

        // Ask Intelligence (Chat)
        askIntelligence: 'Ask Intelligence',
        chatInputPlaceholder: 'Ask anything about this video...',
        chatSend: 'Send',

        // Keywords section
        keywordsSectionTitle: 'Keywords',

        // Recent page
        recentTitle: 'Recent Activity',
        recentSearch: 'Search...',
        recentNoItems: 'No analysis history yet.',
        recentPin: 'Pin',
        recentUnpin: 'Unpin',
        recentDelete: 'Delete',
        recentView: 'View',

        // Knowledge page
        knowledgeTitle: 'Knowledge Base',
        knowledgeSearch: 'Search videos...',
        knowledgeNoItems: 'No saved videos.',
        knowledgeAddCategory: 'Add Category',
        knowledgeAllCategory: 'All Videos',
        knowledgeNotes: 'Notes',

        // Assets page
        assetsPageTitle: 'Asset Management',
        promptLibrary: 'Prompt Library',
        glossary: 'Glossary',
        downloadCenter: 'Download Center',
        addPrompt: 'Add Prompt',
        addTerm: 'Add Term',
    }
};

export const getTranslations = (language: Language): Translations => {
    return translations[language] || translations.ko;
};
