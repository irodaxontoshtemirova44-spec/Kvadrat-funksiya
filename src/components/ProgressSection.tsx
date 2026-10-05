import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { playClickSound, playSuccessSound } from '../utils/audio';
import { 
  Trophy, Award, Flame, Sparkles, CheckCircle2, 
  Trash2, Printer, Star, HelpCircle, BookOpen, AlertTriangle 
} from 'lucide-react';

export const ProgressSection: React.FC = () => {
  const { 
    language, 
    profile, 
    removeMistake, 
    resetProgress 
  } = useApp();
  const t = translations[language];

  const [activeTab, setActiveTab] = useState<'stats' | 'mistakes' | 'cheatsheet' | 'common' | 'reallife' | 'olympiad'>('stats');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 14 Achievement Badges
  const badgesList = [
    { id: 'badge_first_step', icon: '🚀', title: 'Ilk Qadam', desc: 'Portaldagi birinchi qadamni tashladingiz!' },
    { id: 'badge_3_lessons', icon: '🥉', title: 'Boshlang\'ich Muhandis', desc: '3 ta darsni muvaffaqiyatli yakunladingiz!' },
    { id: 'badge_7_lessons', icon: '🥈', title: 'Tajribali Tadqiqotchi', desc: '7 ta darsni to\'liq o\'zlashtirdingiz!' },
    { id: 'badge_all_lessons', icon: '🥇', title: 'Parabola Professori', desc: 'Barcha 11 ta darsni tugatdingiz!' },
    { id: 'badge_gamer_first', icon: '🎮', title: 'O\'yin Ishqibozi', desc: 'Arcade maydonida ilk o\'yinni yakunladingiz!' },
    { id: 'badge_star_collector', icon: '⭐', title: 'Yulduzlar Kolleksioneri', desc: 'O\'yinlarda 15 tadan ortiq yulduz to\'pladingiz!' },
    { id: 'badge_exam_master', icon: '📜', title: 'Imtihon A\'lochisi', desc: 'Yakuniy imtihondan 4 yoki 5 baho oldingiz!' },
    { id: 'badge_perfect_exam', icon: '👑', title: 'Mutlaq Chempion', desc: 'Yakuniy imtihondan eng yuqori 5 baho oldingiz!' },
    { id: 'badge_level_3', icon: '⚡', title: 'Tezkor Rivojlanish', desc: '3-darajaga yetib keldingiz!' },
    { id: 'badge_level_5', icon: '💎', title: 'Algebra Afsonasi', desc: '5-darajaga muvaffaqiyatli erishdingiz!' },
    { id: 'badge_xp_500', icon: '🔥', title: '500 XP Jamg\'armasi', desc: '500 dan ortiq tajriba ball to\'pladingiz!' },
    { id: 'badge_streak_3', icon: '📅', title: 'Qat\'iyatli O\'quvchi', desc: '3 kun ketma-ket shug\'ullandingiz!' },
  ];

  // Level Titles
  const getLevelTitle = (lvl: number) => {
    if (lvl === 1) return 'Parabola Yangi O\'quvchisi (Rookie)';
    if (lvl === 2) return 'Koordinata Tadqiqotchisi (Explorer)';
    if (lvl === 3) return 'Cho\'qqi Ovchisi (Vertex Hunter)';
    if (lvl === 4) return 'Grafik Ustasi (Graph Wizard)';
    return 'Algebra Afsonasi (Algebra Legend)';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Profile Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-600 to-purple-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
            {profile.avatar}
          </div>
          <div>
            <h1 className="text-2xl font-black">{profile.name}</h1>
            <div className="text-xs text-sky-200 font-semibold">{getLevelTitle(profile.level)}</div>
            <div className="flex items-center gap-3 mt-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-xl bg-white/20">Daraja: {profile.level}</span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-400 text-slate-900">{profile.xp} XP</span>
              <span className="px-2.5 py-1 rounded-xl bg-rose-500 text-white">🔥 {profile.streak} kun</span>
            </div>
          </div>
        </div>

        {/* Level Progress bar */}
        <div className="w-full md:w-64 space-y-1.5 text-xs">
          <div className="flex justify-between font-bold text-sky-100">
            <span>Keyingi darajagacha</span>
            <span>{profile.xp % 100} / 100 XP</span>
          </div>
          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${profile.xp % 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
        <button
          onClick={() => { playClickSound(); setActiveTab('stats'); }}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
        >
          🏆 {t.badgesEarned}
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('mistakes'); }}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'mistakes' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
        >
          ❌ {t.mistakesTracker} ({profile.mistakes.length})
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('cheatsheet'); }}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'cheatsheet' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
        >
          📜 {t.cheatSheetTitle}
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('common'); }}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'common' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
        >
          ⚠️ {t.commonMistakesTitle}
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('reallife'); }}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'reallife' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
        >
          🌍 {t.realLifeTitle}
        </button>
        <button
          onClick={() => { playClickSound(); setActiveTab('olympiad'); }}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'olympiad' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
        >
          ⭐ {t.olympiadTitle}
        </button>
      </div>

      {/* 1. BADGES VIEW */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badgesList.map(b => {
            const unlocked = profile.unlockedBadges.includes(b.id);
            return (
              <div
                key={b.id}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-3.5 ${
                  unlocked
                    ? 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-700/80 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50 grayscale'
                }`}
              >
                <div className="text-3xl flex-shrink-0">{b.icon}</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <span>{b.title}</span>
                    {unlocked && <span className="text-[10px] bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold">Olingan ✓</span>}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-0.5">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. MISTAKES TRACKER */}
      {activeTab === 'mistakes' && (
        <div className="space-y-4">
          {profile.mistakes.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 text-slate-500 space-y-2">
              <span className="text-4xl block">🎉</span>
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">{t.noMistakesYet}</h3>
              <p className="text-xs">{language === 'uz' ? "Testlarda yo'l qo'yilgan xatolar bu yerga yozib boriladi." : "Ошибки из тестов сохраняются здесь для повторения."}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {profile.mistakes.map(m => (
                <div key={m.id} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-950/60 shadow-xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                      {m.questionText}
                    </h4>
                    <button
                      onClick={() => {
                        playClickSound();
                        removeMistake(m.id);
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-700 dark:text-rose-300">
                      <strong>Sizning javobingiz:</strong> {m.userAnswer}
                    </div>
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-700 dark:text-emerald-300">
                      <strong>To'g'ri yechim:</strong> {m.explanation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. CHEAT SHEET (Printable Formulas) */}
      {activeTab === 'cheatsheet' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.cheatSheetTitle}</h2>
              <p className="text-xs text-slate-500">{t.cheatSheetDesc}</p>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Chop etish</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-sky-600 dark:text-sky-400 block text-sm">1. Asosiy Formulalar</span>
              <div>Umumiy ko'rinish: <strong>y = ax² + bx + c</strong> (a ≠ 0)</div>
              <div>Kanonik ko'rinish: <strong>y = a(x - m)² + n</strong></div>
              <div>Uchi: <strong>x0 = -b / (2a)</strong>,  <strong>y0 = (4ac - b²) / (4a)</strong></div>
              <div>Simmetriya o'qi: <strong>x = x0</strong></div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-pink-600 dark:text-pink-400 block text-sm">2. Diskriminant va Ildizlar</span>
              <div>Diskriminant: <strong>D = b² - 4ac</strong></div>
              <div>D &gt; 0: ikkita ildiz <strong>x1,2 = (-b ± √D) / (2a)</strong></div>
              <div>D = 0: bitta ildiz <strong>x = -b / (2a)</strong> (Ox ga urinadi)</div>
              <div>D &lt; 0: haqiqiy ildizlar yo'q (Ox ni kesmaydi)</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block text-sm">3. Sohasi va Oraliqlar</span>
              <div>Aniqlanish sohasi: <strong>D(f) = (-∞; +∞)</strong></div>
              <div>a &gt; 0: <strong>E(f) = [y0; +∞)</strong>, [x0; +∞) da o'sadi, (-∞; x0] da kamayadi</div>
              <div>a &lt; 0: <strong>E(f) = (-∞; y0]</strong>, (-∞; x0] da o'sadi, [x0; +∞) da kamayadi</div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <span className="font-bold text-purple-600 dark:text-purple-400 block text-sm">4. Juftlik Qoidalari</span>
              <div>Juft funksiya: <strong>b = 0</strong> (y = ax² + c), Oy ga nisbatan simmetrik</div>
              <div>Toq funksiya: kvadrat funksiya hech qachon toq bo'lmaydi!</div>
              <div>Na juft, na toq: <strong>b ≠ 0</strong> bo'lganda</div>
            </div>
          </div>
        </div>
      )}

      {/* 4. COMMON MISTAKES */}
      {activeTab === 'common' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.commonMistakesTitle}</h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800">
              <strong className="text-rose-700 dark:text-rose-300 block mb-1">1. Uchining formulasi x0 = -b/(2a) da minusni unutish</strong>
              <p className="text-slate-600 dark:text-slate-400">Ko'p o'quvchilar x0 = b/(2a) deb yozishadi. Masalan, y = x² - 4x + 3 da b = -4, demak x0 = -(-4) / 2 = +2 bo'ladi!</p>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800">
              <strong className="text-amber-800 dark:text-amber-300 block mb-1">2. O'sish/kamayish oralig'ini y bo'yicha yozish</strong>
              <p className="text-slate-600 dark:text-slate-400">Oraliqlar doimo X o'qi bo'yicha yoziladi! [x0; +∞) yoki (-∞; x0]. Qiymatlar sohasi esa Y bo'yicha yoziladi.</p>
            </div>

            <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 rounded-2xl border border-sky-200 dark:border-sky-800">
              <strong className="text-sky-800 dark:text-sky-300 block mb-1">3. Gorizontal siljish (x - m) dagi ishorani adashtirish</strong>
              <p className="text-slate-600 dark:text-slate-400">y = (x - 3)² grafigi o'ngga +3 ga siljiydi (chunki x = 3 da 0 ga aylanadi). y = (x + 3)² esa chapga siljiydi.</p>
            </div>

            <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800">
              <strong className="text-indigo-800 dark:text-indigo-300 block mb-1">4. y = ax² ni toq funksiya deb o'ylash</strong>
              <p className="text-slate-600 dark:text-slate-400">Kvadrat daraja har doim juftdir: (-x)² = x². Shuning uchun b = 0 bo'lsa u har doim JUFT bo'ladi, hech qachon toq emas.</p>
            </div>
          </div>
        </div>
      )}

      {/* 5. QUADRATICS IN REAL LIFE */}
      {activeTab === 'reallife' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <span className="text-3xl block">🏀</span>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Sportdagi Parabolalar</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Futbolda to'p tepilganda, basketbolda savatga otilganda yoki voleybolda to'p uzatilganda tortishish kuchi tufayli trayektoriya ideal parabola chizadi.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <span className="text-3xl block">📡</span>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Sun'iy Yo'ldosh Antennalari</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Parabolaning optik xossasi: parallel tushgan barcha nurlar (signallar) qaytgach bitta nuqtada — fokusda yig'iladi. Shuning uchun barcha kosmik antennalar parabolik shaklda yasaladi.
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <span className="text-3xl block">🌉</span>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Kamar Ko'priklar</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Parabolik kamarlar og'irlikni butun uzunlik bo'ylab tekis taqsimlaydi va ulkan bosimga bardosh beradi (masalan, Sidney porti ko'prigi).
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-2">
            <span className="text-3xl block">💡</span>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">Avtomobil Fanalari</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Fokusga lampochka qo'yilsa, parabolik reflektor yorug'likni yo'l bo'ylab kuchli parallel nur dastasiga aylantirib beradi.
            </p>
          </div>
        </div>
      )}

      {/* 6. OLYMPIAD CHALLENGES */}
      {activeTab === 'olympiad' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.olympiadTitle}</h2>
          
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <strong className="text-sky-600 dark:text-sky-400 block font-bold">1-Masala: Uchta nuqtadan o'tuvchi parabola</strong>
              <p className="text-slate-700 dark:text-slate-300">
                A(0; 3), B(1; 2) va C(2; 3) nuqtalardan o'tuvchi kvadrat funksiyaning tenglamasini toping.
              </p>
              <div className="p-2.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl text-sky-800 dark:text-sky-300">
                <strong>Yechim:</strong> c = 3 (A nuqtadan). a + b + 3 = 2 ⟹ a + b = -1. 4a + 2b + 3 = 3 ⟹ 2a + b = 0. Bundan a = 1, b = -2. Natija: <strong>y = x² - 2x + 3</strong>.
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <strong className="text-purple-600 dark:text-purple-400 block font-bold">2-Masala: Parametr k ga bog'liq urinma</strong>
              <p className="text-slate-700 dark:text-slate-300">
                y = x² + 2x + 5 parabolasi va y = 4x + k to'g'ri chizig'i bitta umumiy nuqtaga ega (urinadi). k ni toping.
              </p>
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-800 dark:text-purple-300">
                <strong>Yechim:</strong> x² + 2x + 5 = 4x + k ⟹ x² - 2x + (5 - k) = 0. Urinish sharti D = 0: D = 4 - 4(5 - k) = 4 - 20 + 4k = 4k - 16 = 0 ⟹ <strong>k = 4</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Progress Button */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        {showResetConfirm ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-rose-500 font-bold">{t.resetConfirm}</span>
            <button
              onClick={() => {
                resetProgress();
                setShowResetConfirm(false);
                playSuccessSound();
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
            >
              Ha, tozalash
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-xs font-bold"
            >
              Bekor qilish
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
          >
            {t.resetProgress}
          </button>
        )}
      </div>

    </div>
  );
};
