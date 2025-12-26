import React, { useState } from 'react';
import {
    Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft,
    Briefcase, Globe, CheckCircle2, Video, Youtube, Twitter, BookOpen
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SignupPageProps {
    language: 'ko' | 'en';
    onSignupSuccess: () => void;
    onNavigateToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ language, onSignupSuccess, onNavigateToLogin }) => {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        passwordConfirm: '',
        nickname: '',
        occupation: '',
        company: '',
        contentSources: [] as string[],
        contentFrequency: '',
        interests: [] as string[],
        agreeTerms: false,
        agreeMarketing: false,
    });

    const t = language === 'ko' ? {
        title: '회원가입',
        subtitle: 'V-Core와 함께 시작하세요',
        step1: '계정 정보',
        step2: '프로필 정보',
        step3: '콘텐츠 설정',
        email: '이메일',
        emailPlaceholder: 'name@company.com',
        password: '비밀번호',
        passwordPlaceholder: '8자 이상 입력하세요',
        passwordConfirm: '비밀번호 확인',
        passwordConfirmPlaceholder: '비밀번호를 다시 입력하세요',
        nickname: '닉네임',
        nicknamePlaceholder: '다른 사용자에게 보여질 이름',
        occupation: '직업/직종',
        occupationPlaceholder: '직업을 선택하세요',
        company: '회사/조직',
        companyPlaceholder: '회사 또는 조직명',
        contentSources: '주로 사용하는 콘텐츠 플랫폼',
        contentFrequency: '콘텐츠 소비 빈도',
        interests: '관심 분야',
        agreeTerms: '서비스 이용약관 및 개인정보 처리방침에 동의합니다',
        agreeMarketing: '마케팅 정보 수신에 동의합니다 (선택)',
        next: '다음',
        prev: '이전',
        complete: '가입 완료',
        haveAccount: '이미 계정이 있으신가요?',
        login: '로그인',
        occupations: [
            { value: 'creator', label: '콘텐츠 크리에이터' },
            { value: 'marketer', label: '마케터' },
            { value: 'researcher', label: '연구원/분석가' },
            { value: 'student', label: '학생' },
            { value: 'developer', label: '개발자' },
            { value: 'designer', label: '디자이너' },
            { value: 'manager', label: '기획자/PM' },
            { value: 'educator', label: '교육자' },
            { value: 'journalist', label: '기자/작가' },
            { value: 'other', label: '기타' },
        ],
        frequencies: [
            { value: 'daily', label: '매일' },
            { value: 'weekly', label: '주 2-3회' },
            { value: 'monthly', label: '주 1회' },
            { value: 'occasionally', label: '가끔' },
        ],
        interestList: [
            '기술/IT', '비즈니스', '마케팅', '교육', '엔터테인먼트',
            '과학', '건강/웰빙', '예술/문화', '스포츠', '자기계발'
        ],
    } : {
        title: 'Sign Up',
        subtitle: 'Get started with V-Core',
        step1: 'Account Info',
        step2: 'Profile Info',
        step3: 'Content Preferences',
        email: 'Email',
        emailPlaceholder: 'name@company.com',
        password: 'Password',
        passwordPlaceholder: 'At least 8 characters',
        passwordConfirm: 'Confirm Password',
        passwordConfirmPlaceholder: 'Re-enter your password',
        nickname: 'Nickname',
        nicknamePlaceholder: 'Display name for other users',
        occupation: 'Occupation',
        occupationPlaceholder: 'Select your occupation',
        company: 'Company/Organization',
        companyPlaceholder: 'Company or organization name',
        contentSources: 'Primary Content Platforms',
        contentFrequency: 'Content Consumption Frequency',
        interests: 'Interests',
        agreeTerms: 'I agree to the Terms of Service and Privacy Policy',
        agreeMarketing: 'I agree to receive marketing communications (optional)',
        next: 'Next',
        prev: 'Previous',
        complete: 'Complete',
        haveAccount: 'Already have an account?',
        login: 'Sign in',
        occupations: [
            { value: 'creator', label: 'Content Creator' },
            { value: 'marketer', label: 'Marketer' },
            { value: 'researcher', label: 'Researcher/Analyst' },
            { value: 'student', label: 'Student' },
            { value: 'developer', label: 'Developer' },
            { value: 'designer', label: 'Designer' },
            { value: 'manager', label: 'Product Manager' },
            { value: 'educator', label: 'Educator' },
            { value: 'journalist', label: 'Journalist/Writer' },
            { value: 'other', label: 'Other' },
        ],
        frequencies: [
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: '2-3 times/week' },
            { value: 'monthly', label: 'Once a week' },
            { value: 'occasionally', label: 'Occasionally' },
        ],
        interestList: [
            'Technology', 'Business', 'Marketing', 'Education', 'Entertainment',
            'Science', 'Health/Wellness', 'Arts/Culture', 'Sports', 'Self-improvement'
        ],
    };

    const contentPlatforms = [
        { id: 'youtube', icon: Youtube, label: 'YouTube' },
        { id: 'twitter', icon: Twitter, label: 'X (Twitter)' },
        { id: 'blog', icon: BookOpen, label: language === 'ko' ? '블로그' : 'Blog' },
        { id: 'podcast', icon: Video, label: language === 'ko' ? '팟캐스트' : 'Podcast' },
    ];

    const handleSubmit = async () => {
        if (formData.password !== formData.passwordConfirm) {
            setError(language === 'ko' ? '비밀번호가 일치하지 않습니다.' : 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        nickname: formData.nickname,
                        occupation: formData.occupation,
                        company: formData.company,
                        contentSources: formData.contentSources,
                        contentFrequency: formData.contentFrequency,
                        interests: formData.interests,
                        marketingConsent: formData.agreeMarketing
                    }
                }
            });

            if (error) throw error;
            onSignupSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSource = (id: string) => {
        setFormData(prev => ({
            ...prev,
            contentSources: prev.contentSources.includes(id)
                ? prev.contentSources.filter(s => s !== id)
                : [...prev.contentSources, id]
        }));
    };

    const toggleInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(s => s !== interest)
                : [...prev.interests, interest]
        }));
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
            <div className="w-full max-w-xl">
                <div className="flex items-center gap-3 mb-8 justify-center">
                    <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center font-black text-xl italic">V</div>
                    <h1 className="text-xl font-bold text-white">V-Core</h1>
                </div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-white mb-2">{t.title}</h2>
                    <p className="text-gray-500">{t.subtitle}</p>
                </div>

                <div className="flex items-center justify-center gap-2 mb-10">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${s === step ? 'bg-lime-400 text-black' :
                                s < step ? 'bg-lime-400/30 text-lime-400' :
                                    'bg-zinc-800 text-gray-500'
                                }`}>
                                {s < step ? <CheckCircle2 size={18} /> : s}
                            </div>
                            {s < 3 && (
                                <div className={`w-16 h-1 rounded-full transition-all ${s < step ? 'bg-lime-400/50' : 'bg-zinc-800'
                                    }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="flex justify-between mb-8 px-4">
                    <span className={`text-xs ${step >= 1 ? 'text-lime-400' : 'text-gray-500'}`}>{t.step1}</span>
                    <span className={`text-xs ${step >= 2 ? 'text-lime-400' : 'text-gray-500'}`}>{t.step2}</span>
                    <span className={`text-xs ${step >= 3 ? 'text-lime-400' : 'text-gray-500'}`}>{t.step3}</span>
                </div>

                <div className="glass-card rounded-2xl p-8 border border-white/10">
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">{t.email}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder={t.emailPlaceholder}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">{t.password}</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={t.passwordPlaceholder}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">{t.passwordConfirm}</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.passwordConfirm}
                                        onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                                        placeholder={t.passwordConfirmPlaceholder}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">{t.nickname}</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={formData.nickname}
                                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                                        placeholder={t.nicknamePlaceholder}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">{t.occupation}</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <select
                                        value={formData.occupation}
                                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white appearance-none cursor-pointer focus:outline-none focus:border-lime-400/50"
                                    >
                                        <option value="">{t.occupationPlaceholder}</option>
                                        {t.occupations.map((occ) => (
                                            <option key={occ.value} value={occ.value}>{occ.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">{t.company}</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        placeholder={t.companyPlaceholder}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-300">{t.contentSources}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {contentPlatforms.map((platform) => (
                                        <button
                                            key={platform.id}
                                            type="button"
                                            onClick={() => toggleSource(platform.id)}
                                            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${formData.contentSources.includes(platform.id)
                                                ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                                                : 'border-white/10 bg-zinc-900 text-gray-400 hover:border-white/20'
                                                }`}
                                        >
                                            <platform.icon size={20} />
                                            <span className="font-medium">{platform.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-300">{t.contentFrequency}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {t.frequencies.map((freq) => (
                                        <button
                                            key={freq.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, contentFrequency: freq.value })}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${formData.contentFrequency === freq.value
                                                ? 'border-lime-400 bg-lime-400/10 text-lime-400'
                                                : 'border-white/10 bg-zinc-900 text-gray-400 hover:border-white/20'
                                                }`}
                                        >
                                            {freq.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-gray-300">{t.interests}</label>
                                <div className="flex flex-wrap gap-2">
                                    {t.interestList.map((interest) => (
                                        <button
                                            key={interest}
                                            type="button"
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${formData.interests.includes(interest)
                                                ? 'bg-lime-400 text-black font-medium'
                                                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                                                }`}
                                        >
                                            {interest}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-white/10">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.agreeTerms}
                                        onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                                        className="w-5 h-5 mt-0.5 rounded border-white/20 bg-zinc-800 accent-lime-400"
                                    />
                                    <span className="text-sm text-gray-400">{t.agreeTerms}</span>
                                </label>
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.agreeMarketing}
                                        onChange={(e) => setFormData({ ...formData, agreeMarketing: e.target.checked })}
                                        className="w-5 h-5 mt-0.5 rounded border-white/20 bg-zinc-800 accent-lime-400"
                                    />
                                    <span className="text-sm text-gray-400">{t.agreeMarketing}</span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-8">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={18} />
                                {t.prev}
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={() => setStep(step + 1)}
                                className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-black rounded-xl font-bold hover:bg-lime-300 transition-colors"
                            >
                                {t.next}
                                <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!formData.agreeTerms || isLoading}
                                className="flex items-center gap-2 px-6 py-3 bg-lime-400 text-black rounded-xl font-bold hover:bg-lime-300 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {t.complete}
                                        <CheckCircle2 size={18} />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-center mt-6 text-gray-500">
                    {t.haveAccount}{' '}
                    <button
                        onClick={onNavigateToLogin}
                        className="text-lime-400 hover:text-lime-300 font-medium transition-colors"
                    >
                        {t.login}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
