import React from 'react';
import { Check, CheckCircle2, Zap } from 'lucide-react';
import { Language } from '../translations';
import { useNavigate } from 'react-router-dom';

interface PricingPageProps {
    language: Language;
}

const PricingPage: React.FC<PricingPageProps> = ({ language }) => {
    const navigate = useNavigate();

    const t = language === 'ko' ? {
        title: '단순하고 투명한 요금제',
        subtitle: '숨겨진 비용 없이, 필요한 만큼만 지불하세요.',
        free: {
            name: 'Starter',
            price: '₩0',
            desc: '개인 사용자 및 체험용',
            features: [
                '일일 3회 무료 분석',
                '영상당 최대 30분 길이 제한',
                '기본 요약 및 인사이트',
                'SD급 자막 추출'
            ]
        },
        pro: {
            name: 'Pro',
            price: '₩12,000',
            period: '/월',
            desc: '크리에이터 및 전문가용',
            features: [
                '무제한 분석',
                '영상당 최대 4시간',
                '블로그/SNS 포스트 자동 생성',
                '고급 AI 모델 (GPT-4급)',
                '우선 순위 처리',
                '광고 제거'
            ],
            cta: 'Pro 시작하기'
        },
        team: {
            name: 'Team',
            price: '₩50,000',
            period: '/월',
            desc: '연구팀 및 기업용',
            features: [
                '5인 멤버 포함',
                '공유 지식 보관소',
                'API 액세스',
                '전담 고객 지원',
                '대량 시크릿 모드',
                '맞춤형 프롬프트'
            ]
        }
    } : {
        title: 'Simple, Transparent Pricing',
        subtitle: 'No hidden fees. Pay only for what you use.',
        free: {
            name: 'Starter',
            price: '$0',
            desc: 'For individuals & trial',
            features: [
                '3 free analyses per day',
                'Max 30 mins per video',
                'Basic Summary & Insights',
                'Standard Transcript'
            ]
        },
        pro: {
            name: 'Pro',
            price: '$12',
            period: '/mo',
            desc: 'For Creators & Pros',
            features: [
                'Unlimited Analysis',
                'Max 4 hours per video',
                'Auto Blog/SNS Posts',
                'Advanced AI Model',
                'Priority Processing',
                'No Ads'
            ],
            cta: 'Get Pro'
        },
        team: {
            name: 'Team',
            price: '$45',
            period: '/mo',
            desc: 'For Teams & Enterprise',
            features: [
                'Includes 5 members',
                'Shared Knowledge Base',
                'API Access',
                'Dedicated Support',
                'Bulk Secret Mode',
                'Custom Prompts'
            ]
        }
    };

    return (
        <div className="min-h-screen bg-black pt-20">
            <div className="max-w-7xl mx-auto px-6 py-24">
                <div className="text-center mb-20 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                        {t.title}
                    </h1>
                    <p className="text-xl text-gray-400">
                        {t.subtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Free Tier */}
                    <div className="p-8 rounded-3xl bg-zinc-900 border border-white/10 hover:border-white/20 transition-all">
                        <h3 className="text-xl font-bold text-white mb-2">{t.free.name}</h3>
                        <p className="text-gray-400 text-sm mb-6">{t.free.desc}</p>
                        <div className="text-4xl font-extrabold text-white mb-8">{t.free.price}</div>
                        <ul className="space-y-4 mb-8">
                            {t.free.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                                    <CheckCircle2 size={18} className="text-gray-500" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                        >
                            {language === 'ko' ? '무료로 시작하기' : 'Start for Free'}
                        </button>
                    </div>

                    {/* Pro Tier (Highlighted) */}
                    <div className="p-8 rounded-3xl bg-zinc-900 border-2 border-lime-400 relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(163,230,53,0.15)]">
                        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-lime-400 text-black text-xs font-bold rounded-full uppercase tracking-wider">
                            Most Popular
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                            {t.pro.name}
                            <Zap size={18} className="text-lime-400 fill-lime-400" />
                        </h3>
                        <p className="text-gray-400 text-sm mb-6">{t.pro.desc}</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-5xl font-extrabold text-white">{t.pro.price}</span>
                            <span className="text-gray-500">{t.pro.period}</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {t.pro.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-white text-sm font-medium">
                                    <CheckCircle2 size={18} className="text-lime-400" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => navigate('/signup')}
                            className="w-full py-4 rounded-xl bg-lime-400 text-black font-extrabold hover:bg-lime-300 transition-colors shadow-lg hover:shadow-lime-400/20"
                        >
                            {t.pro.cta}
                        </button>
                    </div>

                    {/* Team Tier */}
                    <div className="p-8 rounded-3xl bg-zinc-900 border border-white/10 hover:border-white/20 transition-all">
                        <h3 className="text-xl font-bold text-white mb-2">{t.team.name}</h3>
                        <p className="text-gray-400 text-sm mb-6">{t.team.desc}</p>
                        <div className="flex items-baseline gap-1 mb-8">
                            <span className="text-4xl font-extrabold text-white">{t.team.price}</span>
                            <span className="text-gray-500">{t.team.period}</span>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {t.team.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
                                    <CheckCircle2 size={18} className="text-gray-500" />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => navigate('/contact')}
                            className="w-full py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
                        >
                            {language === 'ko' ? '문의하기' : 'Contact Sales'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
