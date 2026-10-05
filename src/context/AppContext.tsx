import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, NavTab, Theme, UserProfile, MistakeItem, ExamResult } from '../types';
import { setSoundMuted, playSuccessSound, playCoinSound } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  addXP: (amount: number) => void;
  completeLesson: (lessonId: string) => void;
  saveGameScore: (gameId: string, score: number, stars: number) => void;
  recordMistake: (mistake: Omit<MistakeItem, 'id' | 'date'>) => void;
  removeMistake: (id: string) => void;
  saveExamResult: (result: ExamResult) => void;
  resetProgress: () => void;
  claimDailyChallenge: () => void;
  hasClaimedDailyToday: boolean;
}

const STORAGE_KEY = 'parabola_master_profile_v2';
const LANG_KEY = 'parabola_master_lang_v2';
const THEME_KEY = 'parabola_master_theme_v2';
const SOUND_KEY = 'parabola_master_sound_v2';

const defaultProfile: UserProfile = {
  name: "Yosh Muhandis",
  avatar: "🚀",
  xp: 0,
  level: 1,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessons: ['lesson_1'],
  unlockedBadges: ['badge_first_step'],
  mistakes: [],
  gameScores: {},
  quizHistory: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return (saved === 'ru' || saved === 'en' || saved === 'uz') ? saved : 'uz';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [soundEnabled, setSoundState] = useState<boolean>(() => {
    const saved = localStorage.getItem(SOUND_KEY);
    return saved !== null ? saved === 'true' : true;
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('home');

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultProfile, ...parsed };
      }
    } catch {
      // ignore
    }
    return defaultProfile;
  });

  // Check daily streak on load
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate !== today) {
      const last = new Date(profile.lastActiveDate);
      const now = new Date(today);
      const diffDays = Math.round((now.getTime() - last.getTime()) / (1000 * 3600 * 24));
      
      setProfile(prev => {
        const newStreak = diffDays === 1 ? prev.streak + 1 : 1;
        return {
          ...prev,
          streak: newStreak,
          lastActiveDate: today,
        };
      });
    }
  }, []);

  // Save profile changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  }, [profile]);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Sync sound
  useEffect(() => {
    setSoundMuted(!soundEnabled);
    localStorage.setItem(SOUND_KEY, String(soundEnabled));
  }, [soundEnabled]);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem(LANG_KEY, lang);
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSound = () => {
    setSoundState(prev => !prev);
  };

  const addXP = (amount: number) => {
    playCoinSound();
    setProfile(prev => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      
      const newBadges = [...prev.unlockedBadges];
      if (newLevel >= 3 && !newBadges.includes('badge_level_3')) {
        newBadges.push('badge_level_3');
      }
      if (newLevel >= 5 && !newBadges.includes('badge_level_5')) {
        newBadges.push('badge_level_5');
      }
      if (newXp >= 500 && !newBadges.includes('badge_xp_500')) {
        newBadges.push('badge_xp_500');
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        unlockedBadges: newBadges,
      };
    });
  };

  const completeLesson = (lessonId: string) => {
    setProfile(prev => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      playSuccessSound();
      fireConfetti(0.5, 0.4, 40);
      const newCompleted = [...prev.completedLessons, lessonId];
      const newBadges = [...prev.unlockedBadges];
      if (newCompleted.length >= 3 && !newBadges.includes('badge_3_lessons')) {
        newBadges.push('badge_3_lessons');
      }
      if (newCompleted.length >= 7 && !newBadges.includes('badge_7_lessons')) {
        newBadges.push('badge_7_lessons');
      }
      if (newCompleted.length >= 11 && !newBadges.includes('badge_all_lessons')) {
        newBadges.push('badge_all_lessons');
      }
      return {
        ...prev,
        xp: prev.xp + 50,
        completedLessons: newCompleted,
        unlockedBadges: newBadges,
      };
    });
  };

  const saveGameScore = (gameId: string, score: number, stars: number) => {
    setProfile(prev => {
      const existing = prev.gameScores[gameId] || { highScore: 0, stars: 0 };
      const newScores = {
        ...prev.gameScores,
        [gameId]: {
          highScore: Math.max(existing.highScore, score),
          stars: Math.max(existing.stars, stars),
        },
      };
      const totalStars = Object.values(newScores).reduce((sum, g) => sum + g.stars, 0);
      const newBadges = [...prev.unlockedBadges];
      if (!newBadges.includes('badge_gamer_first')) {
        newBadges.push('badge_gamer_first');
      }
      if (totalStars >= 15 && !newBadges.includes('badge_star_collector')) {
        newBadges.push('badge_star_collector');
      }
      return {
        ...prev,
        gameScores: newScores,
        unlockedBadges: newBadges,
      };
    });
  };

  const recordMistake = (mistake: Omit<MistakeItem, 'id' | 'date'>) => {
    setProfile(prev => {
      const item: MistakeItem = {
        ...mistake,
        id: 'mistake_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
        date: new Date().toISOString(),
      };
      return {
        ...prev,
        mistakes: [item, ...prev.mistakes.slice(0, 49)], // keep last 50
      };
    });
  };

  const removeMistake = (id: string) => {
    setProfile(prev => ({
      ...prev,
      mistakes: prev.mistakes.filter(m => m.id !== id),
    }));
  };

  const saveExamResult = (result: ExamResult) => {
    setProfile(prev => {
      const newBadges = [...prev.unlockedBadges];
      if (result.grade >= 4 && !newBadges.includes('badge_exam_master')) {
        newBadges.push('badge_exam_master');
      }
      if (result.grade === 5 && !newBadges.includes('badge_perfect_exam')) {
        newBadges.push('badge_perfect_exam');
      }
      return {
        ...prev,
        examResult: result,
        unlockedBadges: newBadges,
      };
    });
  };

  const resetProgress = () => {
    setProfile({
      ...defaultProfile,
      name: profile.name,
      avatar: profile.avatar,
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const [hasClaimedDailyToday, setHasClaimedDailyToday] = useState(false);

  const claimDailyChallenge = () => {
    if (hasClaimedDailyToday) return;
    setHasClaimedDailyToday(true);
    addXP(30);
    fireConfetti();
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        soundEnabled,
        toggleSound,
        currentTab,
        setCurrentTab,
        profile,
        setProfile,
        addXP,
        completeLesson,
        saveGameScore,
        recordMistake,
        removeMistake,
        saveExamResult,
        resetProgress,
        claimDailyChallenge,
        hasClaimedDailyToday,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
