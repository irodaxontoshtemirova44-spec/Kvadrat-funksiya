import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { Mascot } from './Mascot';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { Sparkles, Trophy, Flame, CheckCircle, Lock, ArrowRight, Star } from 'lucide-react';

const AVATARS = ['🚀', '🦉', '⚡', '🎯', '🧪', '📐', '🤖', '🌟'];

export const HomeSection: React.FC = () => {
  const { 
    language, 
    setCurrentTab, 
    profile, 
    setProfile, 
    claimDailyChallenge, 
    hasClaimedDailyToday 
  } = useApp();
  const t = translations[language];

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  const saveName = () => {
    if (nameInput.trim()) {
      setProfile(prev => ({ ...prev, name: nameInput.trim() }));
      setEditingName(false);
      playSuccessSound();
    }
  };

  const selectAvatar = (av: string) => {
    playClickSound();
    setProfile(prev => ({ ...prev, avatar: av }));
  };

  // 11 Roadmap stages
  const roadmapStages = [
    { id: 'lesson_1', title: { uz: "1. Kvadrat funksiya nima?", ru: "1. Что такое квадратичная функция?", en: "1. What is a Quadratic Function?" }, icon: "🏀" },
    { id: 'lesson_2', title: { uz: "2. Eng sodda parabola y = x²", ru: "2. Простейшая парабола y = x²", en: "2. Simplest Parabola y = x²" }, icon: "⛲" },
    { id: 'lesson_3', title: { uz: "3. Koeffitsiyent a ning roli", ru: "3. Влияние коэффициента a", en: "3. Effect of Coefficient a" }, icon: "📡" },
    { id: 'lesson_4', title: { uz: "4. O'qlar bo'ylab siljishlar", ru: "4. Сдвиги по осям x и y", en: "4. Shifts Along Axes" }, icon: "🌉" },
    { id: 'lesson_5', title: { uz: "5. Cho'qqi ko'rinishi: a(x-m)²+n", ru: "5. Канонический вид a(x-m)²+n", en: "5. Vertex Form: a(x-m)²+n" }, icon: "🛸" },
    { id: 'lesson_6', title: { uz: "6. Bosqichma-bosqich chizish", ru: "6. Построение по шагам", en: "6. Graphing Wizard Step-by-Step" }, icon: "🧙‍♂️" },
    { id: 'lesson_7', title: { uz: "7. Aniqlanish va qiymatlar sohasi", ru: "7. Область определения и значений", en: "7. Domain and Range" }, icon: "🎢" },
    { id: 'lesson_8', title: { uz: "8. O'sish va kamayish oraliqlari", ru: "8. Промежутки возрастания и убывания", en: "8. Increasing and Decreasing" }, icon: "📈" },
    { id: 'lesson_9', title: { uz: "9. Juft va toq funksiyalar", ru: "9. Чётные и нечётные функции", en: "9. Even and Odd Functions" }, icon: "🪞" },
    { id: 'lesson_10', title: { uz: "10. Eng katta/kichik qiymat va ishora", ru: "10. Экстремумы и знаки функции", en: "10. Max/Min Values & Sign" }, icon: "☀️" },
    { id: 'lesson_11', title: { uz: "11. Amaliy hayotiy masalalar", ru: "11. Прикладные задачи из жизни", en: "11. Real-World Applications" }, icon: "🏗️" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Hero Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-600 text-white p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            
            {/* Greeting with student name & avatar */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="text-3xl p-1 bg-white/20 rounded-2xl backdrop-blur-xs">
                {profile.avatar}
              </span>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="px-3 py-1 text-sm bg-white text-slate-900 rounded-xl font-bold outline-none"
                    maxLength={20}
                  />
                  <button
                    onClick={saveName}
                    className="px-3 py-1 text-xs font-bold bg-amber-400 text-slate-900 rounded-xl hover:bg-amber-300 transition-colors"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditingName(true)}
                  className="text-lg sm:text-2xl font-bold flex items-center gap-2 hover:underline cursor-pointer"
                  title="Ismni o'zgartirish"
                >
                  <span>{profile.name}</span>
                  <span className="text-xs text-sky-200">✎</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              {t.welcomeTitle}
            </h1>
            <p className="text-sm sm:text-base text-sky-100 font-medium">
              {t.welcomeSubtitle}
            </p>

            {/* Quick action buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => {
                  playClickSound();
                  setCurrentTab('learn');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-sky-50 active:scale-95 transition-all"
              >
                <span>{t.startLearning}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playClickSound();
                  setCurrentTab('lab');
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-sm transition-all"
              >
                <span>{t.navLab}</span>
              </button>
            </div>
          </div>

          {/* Interactive Mascot widget */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <Mascot mood="idle" />
          </div>
        </div>

        {/* Avatar Selection Row */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center justify-center md:justify-start gap-2">
          <span className="text-xs text-sky-200 font-semibold">{t.chooseAvatar}</span>
          {AVATARS.map((av) => (
            <button
              key={av}
              onClick={() => selectAvatar(av)}
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-transform ${
                profile.avatar === av
                  ? 'bg-white shadow-md scale-110'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {av}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Jami Tajriba</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{profile.xp} XP</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.level}</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{profile.level}-daraja</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ketma-ketlik</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{profile.streak} {t.streakDays}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.navLearn}</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {profile.completedLessons.length} / 11
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenge Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-sm flex-shrink-0">
            ⚡
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center justify-center sm:justify-start gap-1.5">
              <span>{t.dailyChallenge}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                +30 XP
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {language === 'uz' && "Bugungi qoidani eslang: a > 0 bo'lsa parabola tarmoqlari qayerga qaragan? (Yuqoriga!)"}
              {language === 'ru' && "Вспомни правило дня: если a > 0, куда направлены ветви параболы? (Вверх!)"}
              {language === 'en' && "Today's quick check: if a > 0, where do parabola branches open? (Upward!)"}
            </p>
          </div>
        </div>

        <button
          onClick={claimDailyChallenge}
          disabled={hasClaimedDailyToday}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
            hasClaimedDailyToday
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-600 text-white shadow-md active:scale-95'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{hasClaimedDailyToday ? t.dailyDone : t.startDaily}</span>
        </button>
      </div>

      {/* Gamified Learning Roadmap */}
      <div className="rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              {t.learningMapTitle}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {profile.completedLessons.length} / 11 {t.levelCompleted}
            </p>
          </div>

          <button
            onClick={() => {
              playClickSound();
              setCurrentTab('learn');
            }}
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>{t.startLearning}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Level Path Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roadmapStages.map((stage, idx) => {
            const isCompleted = profile.completedLessons.includes(stage.id);
            const isPreviousCompleted = idx === 0 || profile.completedLessons.includes(roadmapStages[idx - 1].id);
            const isUnlocked = isCompleted || isPreviousCompleted;

            return (
              <div
                key={stage.id}
                onClick={() => {
                  if (isUnlocked) {
                    playClickSound();
                    setCurrentTab('learn');
                  }
                }}
                className={`relative p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isCompleted
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 cursor-pointer hover:border-emerald-400'
                    : isUnlocked
                    ? 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-200 dark:border-sky-800/60 cursor-pointer hover:border-sky-400'
                    : 'bg-slate-100/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-2xl flex-shrink-0">{stage.icon}</div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {stage.title[language]}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {isCompleted ? t.levelCompleted : isUnlocked ? t.levelUnlocked : t.levelLocked}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0 ml-2">
                  {isCompleted ? (
                    <div className="flex items-center text-amber-500">
                      <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                  ) : isUnlocked ? (
                    <span className="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      ▶
                    </span>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
