import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AnalysisDisplay from './components/AnalysisDisplay';
import SettingsModal, { AppSettings, loadSettings, defaultSettings } from './components/SettingsModal';
import HelpModal from './components/HelpModal';
import AnimatedLoader from './components/AnimatedLoader';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { analyzeVideoContent } from './services/groqService';
import { SummaryLength, VideoMetadata, AnalysisResult, GeneratedContent } from './types';
import { getTranslations } from './translations';
import { addToHistory, HistoryItem } from './stores/historyStore';
import RecentPage from './pages/RecentPage';
import KnowledgePage from './pages/KnowledgePage';
import AssetsPage from './pages/AssetsPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProductPage from './pages/ProductPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import { useAuth } from './contexts/AuthContext';
import {
  Search,
  Loader2,
  PlayCircle,
  Sparkles,
  Youtube,
  Zap,
  FileText,
  MessageSquare,
  ArrowRight,
  Globe,
  Clock,
  Shield,
  Star
} from 'lucide-react';

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [url, setUrl] = useState('');
  const [length, setLength] = useState<SummaryLength>(SummaryLength.MEDIUM);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedContent | null>(null);
  const [currentVideo, setCurrentVideo] = useState<VideoMetadata | null>(null);

  // Settings state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Get translations based on service language
  const t = getTranslations(settings.serviceLanguage);

  // Restore state from history on reload if on /results
  useEffect(() => {
    // Don't redirect if we are currently loading a new analysis
    if (location.pathname === '/results' && !analysisResult && !isLoading) {
      import('./stores/historyStore').then(mod => {
        const items = mod.loadHistory();
        if (items.length > 0) {
          const latest = items[0]; // Sort by timestamp if needed, but usually index 0 is newest or updated
          setCurrentVideo(latest.metadata);
          setAnalysisResult(latest.analysis);
          setGeneratedAssets(latest.assets);
        } else {
          // No data found, redirect to home
          navigate('/');
        }
      });
    }
  }, [location.pathname, analysisResult, navigate, isLoading]);

  const handleAnalysis = async () => {
    if (!url) return;
    setIsLoading(true);
    setStatusMessage(t.statusConnecting);
    navigate('/results'); // Navigate immediately to show loader on results page

    try {
      setStatusMessage(t.statusExtracting);
      await new Promise(r => setTimeout(r, 500));

      setStatusMessage(t.statusAnalyzing);
      const result = await analyzeVideoContent(url, length, settings.serviceLanguage);

      // Set all data from the unified response
      setCurrentVideo(result.metadata);
      setAnalysisResult(result.analysis);
      setGeneratedAssets(result.assets);

      // Save to history
      addToHistory(result.metadata, result.analysis, result.assets);

      // Animation handles transition
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Analysis failed. Please check your network or URL.');
      navigate('/'); // Go back home on error
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Handle viewing analysis from history
  const handleViewFromHistory = (item: HistoryItem) => {
    setCurrentVideo(item.metadata);
    setAnalysisResult(item.analysis);
    setGeneratedAssets(item.assets);
    navigate('/results');
  };

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-lime-400 selection:text-black">
      <Sidebar
        onSettingsClick={() => setIsSettingsOpen(true)}
        onHelpClick={() => setIsHelpOpen(true)}
        language={settings.serviceLanguage}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={setSettings}
        settings={settings}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        language={settings.serviceLanguage}
      />

      <main className="flex-1 ml-64 relative overflow-y-auto max-h-screen">
        {location.pathname === '/' && (
          <div className="relative min-h-screen hero-gradient overflow-hidden">
            {/* Top Navigation */}
            <div className="flex items-center justify-between px-12 py-6">
              <div className="flex gap-8 text-sm font-medium text-gray-400">
                <button onClick={() => navigate('/product')} className="hover:text-white transition-colors">{t.headerProduct}</button>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">{t.headerAbout}</button>
                <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">{t.headerPricing}</button>
              </div>
              <div className="flex items-center gap-4">
                {user ? (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-300 hidden md:block">{user.email}</span>
                    <button onClick={() => signOut()} className="text-sm font-medium hover:text-gray-300">
                      {settings.serviceLanguage === 'ko' ? '로그아웃' : 'Sign Out'}
                    </button>
                    {/* <button className="ramp-button px-5 py-2 rounded-lg font-bold text-sm shadow-lg">My Dashboard</button> */}
                  </div>
                ) : (
                  <>
                    <button onClick={() => navigate('/login')} className="text-sm font-medium hover:text-gray-300">{t.headerSignIn}</button>
                    <button onClick={() => navigate('/signup')} className="ramp-button px-5 py-2 rounded-lg font-bold text-sm shadow-lg">{settings.serviceLanguage === 'ko' ? '무료 시작' : 'Start Free'}</button>
                  </>
                )}
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-12 pt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex text-lime-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">5 stars 10,000+ reviews</span>
                </div>

                <h1 className="text-7xl font-extrabold leading-[1.1] mb-8 tracking-tight">
                  {t.heroTitle} <br />
                  <span className="text-gray-400">{t.heroTitleHighlight}</span>
                </h1>

                <p className="text-xl text-gray-400 mb-10 max-w-lg leading-relaxed">
                  {t.heroDescription}
                </p>

                <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex flex-col md:flex-row gap-2 max-w-xl shadow-2xl backdrop-blur-md">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={t.urlPlaceholder}
                    className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-white placeholder-gray-500 text-lg"
                  />
                  <button
                    onClick={handleAnalysis}
                    disabled={isLoading || !url}
                    className="ramp-button px-8 py-4 rounded-xl font-bold text-black flex items-center justify-center gap-2 whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : t.startAnalysis}
                    {!isLoading && <ArrowRight size={20} />}
                  </button>
                </div>

                <div className="mt-6 flex items-center gap-8 text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>{settings.serviceLanguage === 'ko' ? '요약 길이:' : 'Summary:'}</span>
                    <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                      {(['SHORT', 'MEDIUM', 'LONG'] as const).map((l) => (
                        <button
                          key={l}
                          onClick={() => setLength(l as SummaryLength)}
                          className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${length === l ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          {l === 'SHORT' ? t.summaryLengthShort : l === 'MEDIUM' ? t.summaryLengthMedium : t.summaryLengthLong}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mockup Preview */}
              <div className="mockup-container hidden lg:block animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                <div className="mockup-frame relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-lime-400/30 to-blue-500/30 blur-2xl rounded-[2.5rem] opacity-50"></div>
                  <div className="bg-zinc-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden aspect-[4/3] flex flex-col">
                    <div className="h-10 border-b border-white/5 flex items-center px-6 gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                      <div className="flex-1 text-[10px] text-gray-600 font-mono text-center">video-insight-dashboard.ai</div>
                    </div>
                    <div className="flex-1 p-6 space-y-4 overflow-hidden">
                      <div className="h-4 bg-white/5 rounded w-1/4"></div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-white/5 rounded-xl border border-white/10"></div>
                        <div className="h-24 bg-white/5 rounded-xl border border-white/10"></div>
                        <div className="h-24 bg-white/5 rounded-xl border border-white/10"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-white/10 rounded w-full"></div>
                        <div className="h-3 bg-white/10 rounded w-5/6"></div>
                        <div className="h-3 bg-white/10 rounded w-4/6"></div>
                      </div>
                      <div className="h-40 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center">
                        <div className="text-indigo-400/50 flex flex-col items-center gap-2">
                          <Zap size={32} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">AI Engine Running</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Supported Platforms */}
            <div className="mt-32 border-t border-white/5 pt-12 pb-24 px-12">
              <p className="text-center text-sm text-gray-600 mb-12 uppercase tracking-[0.3em] font-bold">
                {settings.serviceLanguage === 'ko' ? '아래 사이트에서 분석이 가능합니다' : 'Analysis available from these platforms'}
              </p>
              <div className="flex justify-center items-center gap-8">
                <div className="flex items-center gap-4 bg-white/5 px-8 py-4 rounded-2xl border border-white/10 hover:border-red-500/50 transition-all group">
                  <svg viewBox="0 0 24 24" className="w-12 h-12 text-red-500" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="text-2xl font-black text-white group-hover:text-red-400 transition-colors">YouTube</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {location.pathname === '/results' && (
          <div className="bg-zinc-950 min-h-screen">
            {isLoading ? (
              <div className="flex min-h-screen items-center justify-center">
                <AnimatedLoader status={statusMessage} language={settings.serviceLanguage} />
              </div>
            ) : (analysisResult && generatedAssets && currentVideo) ? (
              <AnalysisDisplay
                metadata={currentVideo}
                analysis={analysisResult}
                assets={generatedAssets}
                language={settings.serviceLanguage}
              />
            ) : (
              <div className="flex min-h-screen items-center justify-center text-gray-500">
                {/* Fallback if not loading and no data - usually handled by useEffect redirect, but just in case */}
                {settings.serviceLanguage === 'ko' ? '데이터가 없습니다.' : 'No data available.'}
              </div>
            )}
          </div>
        )}

        {/* Recent Page (History) */}
        {location.pathname === '/recent' && (
          <RecentPage
            language={settings.serviceLanguage}
            onViewAnalysis={handleViewFromHistory}
          />
        )}

        {/* Knowledge Base Page */}
        {location.pathname === '/knowledge' && (
          <KnowledgePage
            language={settings.serviceLanguage}
            onViewAnalysis={handleViewFromHistory}
          />
        )}

        {/* Assets Page */}
        {location.pathname === '/assets' && (
          <AssetsPage language={settings.serviceLanguage} />
        )}

        {/* Product Page */}
        {location.pathname === '/product' && (
          <ProductPage language={settings.serviceLanguage} />
        )}

        {/* About Page */}
        {location.pathname === '/about' && (
          <AboutPage language={settings.serviceLanguage} />
        )}

        {/* Pricing Page */}
        {location.pathname === '/pricing' && (
          <PricingPage language={settings.serviceLanguage} />
        )}

        {/* Login Page */}
        {location.pathname === '/login' && (
          <LoginPage
            language={settings.serviceLanguage}
            onLoginSuccess={() => navigate('/')}
            onNavigateToSignup={() => navigate('/signup')}
          />
        )}

        {/* Signup Page */}
        {location.pathname === '/signup' && (
          <SignupPage
            language={settings.serviceLanguage}
            onSignupSuccess={() => navigate('/')}
            onNavigateToLogin={() => navigate('/login')}
          />
        )}

        {/* Floating Help Button - Ramp Style */}
        <button
          onClick={() => setIsHelpOpen(true)}
          className="fixed bottom-8 right-8 w-12 h-12 ramp-button rounded-xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
          <Zap size={24} />
        </button>
      </main>
    </div>
  );
};

export default App;
