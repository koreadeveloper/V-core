import React, { useState } from 'react';
import { X, Sparkles, Video, FileText, Lightbulb, Zap, HelpCircle } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: 'ko' | 'en';
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, language }) => {
    if (!isOpen) return null;

    const t = language === 'ko' ? {
        title: 'V-Core 사용 가이드',
        subtitle: '영상 분석의 모든 것을 알아보세요',
        step1Title: '1. YouTube URL 입력',
        step1Desc: '분석하고 싶은 YouTube 영상의 URL을 입력하세요. 자막이 있는 영상에서 가장 정확한 결과를 얻을 수 있습니다.',
        step2Title: '2. AI 분석 시작',
        step2Desc: '분석 시작 버튼을 클릭하면 AI가 영상의 자막을 추출하고 핵심 내용을 분석합니다.',
        step3Title: '3. 결과 확인 및 활용',
        step3Desc: '요약, 핵심 인사이트, 타임라인 챕터, 블로그 포스트, SNS 캡션 등 다양한 콘텐츠를 확인하세요.',
        features: '주요 기능',
        feature1: 'AI 요약 및 핵심 인사이트',
        feature2: '타임라인 챕터 자동 생성',
        feature3: '블로그/SNS 콘텐츠 생성',
        feature4: 'AI 채팅으로 영상 Q&A',
        tips: 'Pro Tips',
        tip1: '요약 길이를 조절하여 원하는 상세도를 선택하세요',
        tip2: '지식 보관소에 분석 결과를 저장하여 나중에 참조하세요',
        tip3: '마크다운 내보내기로 문서에 바로 활용하세요',
        close: '닫기',
    } : {
        title: 'V-Core Guide',
        subtitle: 'Learn everything about video analysis',
        step1Title: '1. Enter YouTube URL',
        step1Desc: 'Enter the URL of the YouTube video you want to analyze. Videos with subtitles provide the most accurate results.',
        step2Title: '2. Start AI Analysis',
        step2Desc: 'Click the start button and AI will extract transcripts and analyze the key content.',
        step3Title: '3. Review and Use Results',
        step3Desc: 'Check out summaries, key insights, timeline chapters, blog posts, SNS captions and more.',
        features: 'Key Features',
        feature1: 'AI Summary & Key Insights',
        feature2: 'Auto Timeline Chapters',
        feature3: 'Blog/SNS Content Generation',
        feature4: 'AI Chat for Video Q&A',
        tips: 'Pro Tips',
        tip1: 'Adjust summary length to get your desired level of detail',
        tip2: 'Save analysis results to Knowledge Base for later reference',
        tip3: 'Export to Markdown for direct use in documents',
        close: 'Close',
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-2xl border border-white/10 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-zinc-900 border-b border-white/10 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-extrabold text-white">{t.title}</h2>
                        <p className="text-gray-500 text-sm mt-1">{t.subtitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-lime-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Video size={24} className="text-lime-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">{t.step1Title}</h3>
                                <p className="text-gray-400 text-sm">{t.step1Desc}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Sparkles size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">{t.step2Title}</h3>
                                <p className="text-gray-400 text-sm">{t.step2Desc}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <FileText size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">{t.step3Title}</h3>
                                <p className="text-gray-400 text-sm">{t.step3Desc}</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-xl p-4 border border-white/10">
                        <h3 className="font-bold text-lime-400 mb-3 flex items-center gap-2">
                            <Zap size={18} />
                            {t.features}
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>• {t.feature1}</li>
                            <li>• {t.feature2}</li>
                            <li>• {t.feature3}</li>
                            <li>• {t.feature4}</li>
                        </ul>
                    </div>

                    <div className="glass-card rounded-xl p-4 border border-amber-400/20 bg-amber-400/5">
                        <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                            <Lightbulb size={18} />
                            {t.tips}
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li>• {t.tip1}</li>
                            <li>• {t.tip2}</li>
                            <li>• {t.tip3}</li>
                        </ul>
                    </div>
                </div>

                <div className="sticky bottom-0 bg-zinc-900 border-t border-white/10 p-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-lime-400 text-black rounded-xl py-3 font-bold hover:bg-lime-300 transition-colors"
                    >
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;
