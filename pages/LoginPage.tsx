import React, { useState } from 'react';
import {
    Mail, Lock, User, Eye, EyeOff, ArrowRight,
    Github, Chrome, Video, Sparkles, Zap
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
    language: 'ko' | 'en';
    onLoginSuccess: () => void;
    onNavigateToSignup: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ language, onLoginSuccess, onNavigateToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const t = language === 'ko' ? {
        welcome: '다시 만나서 반갑습니다',
        subtitle: 'V-Core에 로그인하세요',
        email: '이메일',
        emailPlaceholder: 'name@company.com',
        password: '비밀번호',
        passwordPlaceholder: '비밀번호를 입력하세요',
        rememberMe: '로그인 상태 유지',
        forgotPassword: '비밀번호 찾기',
        login: '로그인',
        orContinue: '또는 다음으로 계속하기',
        noAccount: '계정이 없으신가요?',
        signUp: '회원가입',
        google: 'Google로 로그인',
        github: 'GitHub로 로그인',
    } : {
        welcome: 'Welcome back',
        subtitle: 'Sign in to V-Core',
        email: 'Email',
        emailPlaceholder: 'name@company.com',
        password: 'Password',
        passwordPlaceholder: 'Enter your password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        login: 'Sign in',
        orContinue: 'Or continue with',
        noAccount: "Don't have an account?",
        signUp: 'Sign up',
        google: 'Sign in with Google',
        github: 'Sign in with GitHub',
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            onLoginSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex">
            <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-zinc-900 via-black to-zinc-900 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(163,230,53,0.15),transparent_50%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.15),transparent_50%)]" />

                <div className="relative z-10 flex flex-col justify-center p-16">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center font-black text-2xl italic">V</div>
                        <h1 className="text-2xl font-bold text-white">V-Core</h1>
                    </div>

                    <div className="space-y-8 mb-12">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-lime-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Sparkles size={24} className="text-lime-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">
                                    {language === 'ko' ? 'AI로 영상 분석' : 'AI Video Analysis'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {language === 'ko' ? '몇 시간의 영상을 초 단위로 분석하세요' : 'Analyze hours of video in seconds'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Zap size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">
                                    {language === 'ko' ? '자동 콘텐츠 생성' : 'Auto Content Generation'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {language === 'ko' ? '블로그, SNS 포스트를 한번에' : 'Blog posts, SNS content in one click'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Video size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">
                                    {language === 'ko' ? '지식 라이브러리' : 'Knowledge Library'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {language === 'ko' ? '분석 결과를 체계적으로 관리' : 'Organize your analysis results'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-6 border border-white/10">
                        <p className="text-gray-300 italic mb-4">
                            {language === 'ko'
                                ? '"V-Core 덕분에 리서치 시간을 75% 절약했습니다. 정말 놀라운 도구입니다."'
                                : '"V-Core saved me 75% of my research time. It\'s an amazing tool."'}
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-blue-500 rounded-full" />
                            <div>
                                <p className="font-bold text-white text-sm">Kim Hyunsu</p>
                                <p className="text-xs text-gray-500">Content Creator</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
                        <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center font-black text-xl italic">V</div>
                        <h1 className="text-xl font-bold text-white">V-Core</h1>
                    </div>

                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-extrabold text-white mb-2">{t.welcome}</h2>
                        <p className="text-gray-500">{t.subtitle}</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">{t.email}</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t.emailPlaceholder}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">{t.password}</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={t.passwordPlaceholder}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-xl pl-12 pr-12 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:border-lime-400/50 transition-colors"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-white/20 bg-zinc-800 accent-lime-400"
                                />
                                <span className="text-sm text-gray-400">{t.rememberMe}</span>
                            </label>
                            <button type="button" className="text-sm text-lime-400 hover:text-lime-300 transition-colors">
                                {t.forgotPassword}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-lime-400 text-black rounded-xl py-3.5 font-bold hover:bg-lime-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    {t.login}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-black text-sm text-gray-500">{t.orContinue}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white hover:bg-zinc-800 transition-colors">
                            <Chrome size={18} />
                            <span className="text-sm font-medium">Google</span>
                        </button>
                        <button className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-white hover:bg-zinc-800 transition-colors">
                            <Github size={18} />
                            <span className="text-sm font-medium">GitHub</span>
                        </button>
                    </div>

                    <p className="text-center mt-8 text-gray-500">
                        {t.noAccount}{' '}
                        <button
                            onClick={onNavigateToSignup}
                            className="text-lime-400 hover:text-lime-300 font-medium transition-colors"
                        >
                            {t.signUp}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
