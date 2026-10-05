import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { NavTab, Language } from '../types';
import { playClickSound } from '../utils/audio';
import { 
  Sun, Moon, Volume2, VolumeX, Menu, X, 
  Home, BookOpen, Cpu, Gamepad2, HelpCircle, Award, User
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    language, setLanguage, 
    theme, toggleTheme, 
    soundEnabled, toggleSound, 
    currentTab, setCurrentTab, 
    profile 
  } = useApp();
  const t = translations[language];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'home', label: t.navHome, icon: <Home className="w-4 h-4" /> },
    { id: 'learn', label: t.navLearn, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'lab', label: t.navLab, icon: <Cpu className="w-4 h-4" /> },
    { id: 'play', label: t.navPlay, icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'quiz', label: t.navQuiz, icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'exam', label: t.navExam, icon: <Award className="w-4 h-4" /> },
    { id: 'progress', label: t.navProgress, icon: <User className="w-4 h-4" /> },
  ];

  const handleTabClick = (tab: NavTab) => {
    playClickSound();
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div 
            onClick={() => handleTabClick('home')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md transform group-hover:scale-105 transition-transform">
              <span className="font-bold text-lg font-heading">f(x)</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  {t.appName}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                  9-sinf
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-xs">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 dark:bg-slate-800/70 p-1 rounded-xl">
            {tabs.map((tab) => {
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    active
                      ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Controls: Lang, Theme, Sound, XP Pill */}
          <div className="flex items-center gap-2">
            
            {/* Student XP & Level pill */}
            <div 
              onClick={() => handleTabClick('progress')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs cursor-pointer hover:bg-amber-100 transition-colors"
              title={`${profile.xp} XP - ${t.level} ${profile.level}`}
            >
              <span className="text-sm">{profile.avatar}</span>
              <span className="font-bold text-amber-700 dark:text-amber-400">{profile.xp} XP</span>
              <span className="text-[10px] bg-amber-500 text-white font-bold px-1 rounded">L{profile.level}</span>
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-bold">
              {(['uz', 'ru', 'en'] as Language[]).map((lng) => (
                <button
                  key={lng}
                  onClick={() => {
                    playClickSound();
                    setLanguage(lng);
                  }}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    language === lng
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {lng.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                toggleSound();
                playClickSound();
              }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={soundEnabled ? t.soundOn : t.soundOff}
              aria-label="Sound Toggle"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                playClickSound();
                toggleTheme();
              }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? t.themeLight : t.themeDark}
              aria-label="Theme Toggle"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Mobile Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 shadow-lg">
          {tabs.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-colors ${
                  active
                    ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
