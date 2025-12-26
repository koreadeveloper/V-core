import React from 'react';
import {
    Zap, Video, FileText, Share2, Sparkles, MessageSquare,
    CheckCircle2, Globe, Shield, ArrowRight
} from 'lucide-react';
import { getTranslations, Language } from '../translations';
import { useNavigate } from 'react-router-dom';

interface ProductPageProps {
    language: Language;
}

const ProductPage: React.FC<ProductPageProps> = ({ language }) => {
    const navigate = useNavigate();

    // Custom translations for this page since it wasn't in the original scope
    const t = language === 'ko' ? {
        hero: 'AI로 완성하는 영상 인텔리전스',
        subhero: 'YouTube 영상을 시청하는 대신, V-Core에게 분석을 맡기세요. 핵심 내용 파악부터 콘텐츠 재생산까지, 모든 과정을 자동화합니다.',
        features: [
            {
                icon: Zap,
                title: '초고속 영상 요약',
                desc: '1시간 분량의 영상을 단 10초 만에 완벽하게 요약합니다. 핵심 내용을 놓치지 마세요.'
            },
            {
                icon: Sparkles,
                title: '심층 인사이트 도출',
                desc: '단순 요약을 넘어, 영상에 담긴 숨겨진 통찰과 핵심 메시지를 5가지 포인트로 정리해드립니다.'
            },
            {
                icon: FileText,
                title: '자동 콘텐츠 생성',
                desc: '블로그 포스트, 트위터 스레드, 링크드인 게시물을 클릭 한 번으로 생성하여 바이럴 콘텐츠를 만드세요.'
            },
            {
                icon: MessageSquare,
                title: '영상과의 대화 (Chat)',
                desc: '영상 내용에 대해 AI에게 직접 질문하세요. 챗봇이 영상의 맥락을 완벽히 이해하고 답변합니다.'
            }
        ],
        cta: '지금 무료로 시작하기'
    } : {
        hero: 'AI-Powered Video Intelligence',
        subhero: 'Stop watching, start analyzing. V-Core automates everything from understanding key content to reproducing viral assets.',
        features: [
            {
                icon: Zap,
                title: 'Lightning Fast Summaries',
                desc: 'Summarize hour-long videos in just 10 seconds. Never miss the key points again.'
            },
            {
                icon: Sparkles,
                title: 'Deep Insights',
                desc: 'Go beyond summaries. Get the 5 most critical insights and hidden messages extracted instantly.'
            },
            {
                icon: FileText,
                title: 'Auto Content Generation',
                desc: 'Create blog posts, Twitter threads, and LinkedIn updates with a single click.'
            },
            {
                icon: MessageSquare,
                title: 'Chat with Video',
                desc: 'Ask questions directly to the video. Our AI understands the full context and answers instantly.'
            }
        ],
        cta: 'Start for Free'
    };

    return (
        <div className="min-h-screen bg-black pt-20">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-lime-400/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />

                <div className="max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/10 text-lime-400 text-sm font-medium mb-6 animate-fade-in-up">
                        <Sparkles size={14} />
                        V-Core 2.0 is Here
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
                        {t.hero}
                    </h1>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                        {t.subhero}
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-4 bg-lime-400 text-black text-lg font-bold rounded-full hover:bg-lime-300 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(163,230,53,0.3)] flex items-center gap-2 mx-auto"
                    >
                        {t.cta}
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {t.features.map((feature, i) => (
                        <div key={i} className="glass-card p-8 rounded-3xl border border-white/10 hover:border-lime-400/30 transition-colors group">
                            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-lime-400 text-lime-400 group-hover:text-black transition-colors duration-300">
                                <feature.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed text-lg">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tech Specs */}
            <div className="border-t border-white/10 bg-zinc-900/50">
                <div className="max-w-6xl mx-auto px-6 py-24">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="text-4xl font-extrabold text-white mb-2">30+</div>
                            <div className="text-gray-500 font-medium">Languages Supported</div>
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-lime-400 mb-2">99%</div>
                            <div className="text-gray-500 font-medium">Summary Accuracy</div>
                        </div>
                        <div>
                            <div className="text-4xl font-extrabold text-white mb-2">2x</div>
                            <div className="text-gray-500 font-medium">Faster Content Creation</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
