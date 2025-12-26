import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  FolderKanban,
  Settings,
  PlusCircle,
  Video,
  Zap,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { getTranslations, Language } from '../translations';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  onSettingsClick?: () => void;
  onHelpClick?: () => void;
  language?: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ onSettingsClick, onHelpClick, language = 'ko' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const t = getTranslations(language as Language);

  const menuItems = [
    { id: '/', label: t.sidebarHome, icon: LayoutDashboard },
    { id: '/recent', label: t.sidebarRecent, icon: History },
    { id: '/knowledge', label: t.sidebarKnowledge, icon: FolderKanban },
    { id: '/assets', label: t.sidebarAssets, icon: Video },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' || location.pathname === '/results';
    return location.pathname === path;
  };

  return (
    <aside className="w-64 h-screen border-r border-white/5 bg-black flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8">
        <div
          className="flex items-center gap-3 mb-10 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <div className="w-9 h-9 bg-white text-black rounded-lg flex items-center justify-center font-black text-xl italic">V</div>
          <h1 className="text-lg font-bold tracking-tight">V-Core</h1>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive(item.id)
                ? 'bg-white/5 text-white font-bold'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
                }`}
            >
              <item.icon size={18} className={isActive(item.id) ? 'text-lime-400' : 'group-hover:text-lime-400 transition-colors'} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-8 space-y-1">
        <button
          onClick={onHelpClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <HelpCircle size={18} />
          {language === 'ko' ? '도움말' : 'Help Center'}
        </button>
        <button
          onClick={onSettingsClick}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
        >
          <Settings size={18} />
          {t.settingsTitle}
        </button>

        <div className="pt-4 mt-4 border-t border-white/5">
          {user ? (
            <div
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-lime-400 to-blue-500 flex items-center justify-center text-black font-bold">
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-bold truncate">{user.email?.split('@')[0]}</p>
                <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest font-bold">{language === 'ko' ? '무료 플랜' : 'Free Plan'}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  signOut();
                }}
                className="p-1 hover:text-white text-gray-500 rounded-full hover:bg-white/10 transition-colors"
                title={language === 'ko' ? '로그아웃' : 'Sign Out'}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 p-3 bg-lime-400 text-black rounded-xl font-bold hover:bg-lime-300 transition-colors"
            >
              {language === 'ko' ? '로그인' : 'Sign In'}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
