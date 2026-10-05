import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HomeSection } from './components/HomeSection';
import { LearnSection } from './components/LearnSection';
import { LabSection } from './components/LabSection';
import { PlaySection } from './components/PlaySection';
import { QuizSection } from './components/QuizSection';
import { FinalExamSection } from './components/FinalExamSection';
import { ProgressSection } from './components/ProgressSection';
import { translations } from './utils/i18n';

function MainContent() {
  const { currentTab, language } = useApp();
  const t = translations[language];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'home' && <HomeSection />}
        {currentTab === 'learn' && <LearnSection />}
        {currentTab === 'lab' && <LabSection />}
        {currentTab === 'play' && <PlaySection />}
        {currentTab === 'quiz' && <QuizSection />}
        {currentTab === 'exam' && <FinalExamSection />}
        {currentTab === 'progress' && <ProgressSection />}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md py-6 text-center text-xs text-slate-500 dark:text-slate-400 no-print transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sky-600 dark:text-sky-400">⚡ ParabolaMaster</span>
            <span>· 9-sinf algebra o'quv dasturi asosida yaratilgan</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span>UZ · RU · EN</span>
            <span>Offline ishlaydi ✓</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
