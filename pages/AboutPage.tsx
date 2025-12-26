import React from 'react';
import { Users, Target, Heart, Award, Github, Linkedin, Mail } from 'lucide-react';
import { Language } from '../translations';

interface AboutPageProps {
    language: Language;
}

const AboutPage: React.FC<AboutPageProps> = ({ language }) => {
    const t = language === 'ko' ? {
        title: '우리는 비디오 인텔리전스의 미래를 만듭니다',
        subtitle: 'V-Core 팀은 매일 쏟아지는 방대한 영상 콘텐츠 속에서 가장 가치 있는 정보만을 추출하여 여러분의 시간을 되찾아드리는 것을 목표로 합니다.',
        mission: '우리의 미션',
        missionDesc: '정보 과잉의 시대에서 사람들이 더 빠르고 스마트하게 학습할 수 있도록 돕는 것입니다. AI 기술을 통해, 영상 시청은 선택이 되고 지식 습득은 필수가 됩니다.',
        values: [
            { title: '혁신', desc: '끊임없이 새로운 AI 모델과 기술을 도입하여 최고의 성능을 제공합니다.' },
            { title: '단순함', desc: '가장 복잡한 기술을 가장 사용하기 쉬운 인터페이스로 풀어냅니다.' },
            { title: '신뢰', desc: '사용자의 데이터 프라이버시를 최우선으로 생각하며 투명하게 운영합니다.' }
        ],
        team: '함께하는 사람들',
        contact: '연락하기'
    } : {
        title: 'Building the Future of Video Intelligence',
        subtitle: 'The V-Core team aims to reclaim your time by extracting only the most valuable information from the endless flood of daily video content.',
        mission: 'Our Mission',
        missionDesc: 'To help people learn faster and smarter in an era of information overload. With AI, watching video becomes optional, but gaining knowledge remains essential.',
        values: [
            { title: 'Innovation', desc: 'We continuously adopt new AI models to deliver peak performance.' },
            { title: 'Simplicity', desc: 'We resolve the most complex technologies into the simplest interfaces.' },
            { title: 'Trust', desc: 'User data privacy is our priority, and we operate with transparency.' }
        ],
        team: 'The Team',
        contact: 'Contact Us'
    };

    return (
        <div className="min-h-screen bg-black pt-20">
            <div className="max-w-4xl mx-auto px-6 py-24">
                <div className="text-center mb-20 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 leading-tight">
                        {t.title}
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed">
                        {t.subtitle}
                    </p>
                </div>

                <div className="glass-card p-10 rounded-3xl border border-white/10 mb-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/10 blur-[80px] rounded-full pointer-events-none" />
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Target className="text-lime-400" />
                        {t.mission}
                    </h2>
                    <p className="text-lg text-gray-300 leading-relaxed">
                        {t.missionDesc}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {t.values.map((val, i) => (
                        <div key={i} className="text-center p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                            <h3 className="text-xl font-bold text-white mb-3">{val.title}</h3>
                            <p className="text-gray-400 text-sm">{val.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="text-center border-t border-white/10 pt-20">
                    <h2 className="text-2xl font-bold text-white mb-8">{t.contact}</h2>
                    <div className="flex justify-center gap-6">
                        <a href="https://github.com/v-core" target="_blank" rel="noreferrer" className="p-4 bg-zinc-900 rounded-full text-white hover:bg-white hover:text-black transition-all">
                            <Github size={24} />
                        </a>
                        <a href="https://linkedin.com/company/v-core" target="_blank" rel="noreferrer" className="p-4 bg-zinc-900 rounded-full text-white hover:bg-[#0077b5] transition-all">
                            <Linkedin size={24} />
                        </a>
                        <a href="mailto:contact@v-core.ai" className="p-4 bg-zinc-900 rounded-full text-white hover:bg-lime-400 hover:text-black transition-all">
                            <Mail size={24} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
