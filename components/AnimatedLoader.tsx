import React, { useState, useEffect } from 'react';
import { Video, Sparkles, Brain, FileText, Zap } from 'lucide-react';

interface AnimatedLoaderProps {
    status: string;
    language: 'ko' | 'en';
}

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({ status, language }) => {
    const [dots, setDots] = useState('');
    const [currentIcon, setCurrentIcon] = useState(0);

    const icons = [Video, Sparkles, Brain, FileText, Zap];
    const IconComponent = icons[currentIcon];

    useEffect(() => {
        const dotInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);

        const iconInterval = setInterval(() => {
            setCurrentIcon(prev => (prev + 1) % icons.length);
        }, 2000);

        return () => {
            clearInterval(dotInterval);
            clearInterval(iconInterval);
        };
    }, []);

    const t = language === 'ko' ? {
        analyzing: 'AI가 영상의 핵심을 파악하고 있습니다',
        tip1: '영상 길이에 따라 분석 시간이 달라질 수 있습니다',
        tip2: '자막이 있는 영상일수록 정확도가 높아집니다',
    } : {
        analyzing: 'AI is analyzing the key points of the video',
        tip1: 'Analysis time may vary depending on video length',
        tip2: 'Videos with subtitles have higher accuracy',
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 px-8">
            {/* Main Animation Container */}
            <div className="relative w-64 h-64 mb-8">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 rounded-full border-2 border-lime-400/20 animate-spin" style={{ animationDuration: '8s' }} />

                {/* Middle pulsing ring */}
                <div className="absolute inset-4 rounded-full border-2 border-blue-400/30 animate-pulse" />

                {/* Inner glow ring */}
                <div className="absolute inset-8 rounded-full bg-gradient-to-br from-lime-400/10 to-blue-500/10 animate-pulse" style={{ animationDuration: '2s' }} />

                {/* Scanning line */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-lime-400 to-transparent animate-scan" />
                </div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-lime-400/20 to-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                        <IconComponent size={48} className="text-lime-400 animate-pulse" />
                    </div>
                </div>

                {/* Floating particles */}
                <div className="absolute top-4 left-1/2 w-2 h-2 bg-lime-400 rounded-full animate-float-1" />
                <div className="absolute bottom-8 right-8 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float-2" />
                <div className="absolute top-1/2 left-4 w-1 h-1 bg-purple-400 rounded-full animate-float-3" />
            </div>

            {/* Status Message with Typing Effect */}
            <div className="text-center mb-6">
                <p className="text-xl font-bold text-white mb-2">
                    {t.analyzing}{dots}
                </p>
                <p className="text-lime-400 font-medium animate-pulse">
                    {status}
                </p>
            </div>

            {/* Progress Dots */}
            <div className="flex gap-2 mb-8">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-lime-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1s' }}
                    />
                ))}
            </div>

            {/* Tips */}
            <div className="glass-card rounded-xl p-4 max-w-sm text-center">
                <p className="text-xs text-gray-400">
                    💡 {Math.random() > 0.5 ? t.tip1 : t.tip2}
                </p>
            </div>

            {/* Custom CSS for animations */}
            <style>{`
                @keyframes scan {
                    0% { top: -2%; }
                    50% { top: 100%; }
                    50.01% { top: -2%; }
                    100% { top: 100%; }
                }
                @keyframes float-1 {
                    0%, 100% { transform: translateY(0) translateX(-50%); opacity: 0.5; }
                    50% { transform: translateY(-20px) translateX(-50%); opacity: 1; }
                }
                @keyframes float-2 {
                    0%, 100% { transform: translateY(0); opacity: 0.5; }
                    50% { transform: translateY(-15px); opacity: 1; }
                }
                @keyframes float-3 {
                    0%, 100% { transform: translateY(0); opacity: 0.3; }
                    50% { transform: translateY(-10px); opacity: 0.8; }
                }
                .animate-scan { animation: scan 3s linear infinite; }
                .animate-float-1 { animation: float-1 3s ease-in-out infinite; }
                .animate-float-2 { animation: float-2 2.5s ease-in-out infinite 0.5s; }
                .animate-float-3 { animation: float-3 2s ease-in-out infinite 1s; }
            `}</style>
        </div>
    );
};

export default AnimatedLoader;
