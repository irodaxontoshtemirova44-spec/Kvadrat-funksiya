import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { Question } from '../types';
import { GraphCanvas } from './GraphCanvas';
import { Mascot } from './Mascot';
import { parseStudentNumber, approxEqual, formatNum } from '../utils/math';
import { playClickSound, playSuccessSound, playErrorSound } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import { 
  HelpCircle, CheckCircle, XCircle, Lightbulb, 
  ArrowRight, RotateCcw, Sparkles 
} from 'lucide-react';

export const QuizSection: React.FC = () => {
  const { language, addXP, recordMistake } = useApp();
  const t = translations[language];

  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Quiz active state
  const [isQuizActive, setIsQuizActive] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Dynamic & Curated Question Bank across all 8 subtopics
  const questionPool: Question[] = [
    // Basics
    {
      id: 'q1',
      topic: 'basics',
      difficulty: 'easy',
      type: 'choice',
      prompt: {
        uz: "Quyidagi qaysi tenglama kvadrat funksiyani ifodalaydi?",
        ru: "Какое из уравнений задаёт квадратичную функцию?",
        en: "Which of the following equations defines a quadratic function?",
      },
      options: [
        { uz: "y = 2x² - 3x + 1", ru: "y = 2x² - 3x + 1", en: "y = 2x² - 3x + 1" },
        { uz: "y = 4x - 7", ru: "y = 4x - 7", en: "y = 4x - 7" },
        { uz: "y = 3/x²", ru: "y = 3/x²", en: "y = 3/x²" },
        { uz: "y = x³ + 2", ru: "y = x³ + 2", en: "y = x³ + 2" },
      ],
      correctAnswer: 0,
      hint: {
        uz: "Kvadrat funksiyaning umumiy ko'rinishi: y = ax² + bx + c (a ≠ 0).",
        ru: "Общий вид квадратичной функции: y = ax² + bx + c (a ≠ 0).",
        en: "General form of quadratic function is y = ax² + bx + c (a ≠ 0).",
      },
      explanation: {
        uz: "y = 2x² - 3x + 1 da a = 2 ≠ 0, demak u kvadrat funksiyadir.",
        ru: "В уравнении y = 2x² - 3x + 1 коэффициент a = 2 ≠ 0, это квадратичная функция.",
        en: "In y = 2x² - 3x + 1, coefficient a = 2 ≠ 0, making it a quadratic function.",
      },
    },
    // Vertex
    {
      id: 'q2',
      topic: 'vertex',
      difficulty: 'medium',
      type: 'number',
      prompt: {
        uz: "y = x² - 6x + 8 funksiyasi parabola uchining absissasi (x0) nechaga teng?",
        ru: "Чему равна абсцисса вершины (x0) параболы y = x² - 6x + 8?",
        en: "What is the x-coordinate of the vertex (x0) of y = x² - 6x + 8?",
      },
      correctAnswer: 3,
      tolerance: 0.1,
      hint: {
        uz: "x0 = -b / (2a) formulasidan foydalaning.",
        ru: "Используй формулу x0 = -b / (2a).",
        en: "Use formula x0 = -b / (2a).",
      },
      explanation: {
        uz: "a = 1, b = -6 bo'lgani uchun: x0 = -(-6) / (2 * 1) = 6 / 2 = 3.",
        ru: "Так как a = 1, b = -6: x0 = -(-6) / (2 · 1) = 6 / 2 = 3.",
        en: "Since a = 1, b = -6: x0 = -(-6) / (2 * 1) = 6 / 2 = 3.",
      },
    },
    // Shifts
    {
      id: 'q3',
      topic: 'shift',
      difficulty: 'easy',
      type: 'choice',
      prompt: {
        uz: "y = (x - 4)² + 5 funksiya grafigining uchi qaysi nuqtada joylashgan?",
        ru: "В какой точке находится вершина параболы y = (x - 4)² + 5?",
        en: "At which point is the vertex of y = (x - 4)² + 5 located?",
      },
      options: [
        { uz: "(4; 5)", ru: "(4; 5)", en: "(4; 5)" },
        { uz: "(-4; 5)", ru: "(-4; 5)", en: "(-4; 5)" },
        { uz: "(4; -5)", ru: "(4; -5)", en: "(4; -5)" },
        { uz: "(-4; -5)", ru: "(-4; -5)", en: "(-4; -5)" },
      ],
      correctAnswer: 0,
      hint: {
        uz: "y = a(x - m)² + n dagi uchi (m; n) bo'ladi.",
        ru: "В виде y = a(x - m)² + n координаты вершины равны (m; n).",
        en: "In vertex form y = a(x - m)² + n, the vertex is (m, n).",
      },
      explanation: {
        uz: "m = 4 va n = 5 bo'lgani uchun, uchi (4; 5) da joylashgan.",
        ru: "Так как m = 4 и n = 5, вершина находится в точке (4; 5).",
        en: "Because m = 4 and n = 5, the vertex is at (4, 5).",
      },
    },
    // Roots / Discriminant
    {
      id: 'q4',
      topic: 'discriminant',
      difficulty: 'medium',
      type: 'choice',
      prompt: {
        uz: "Agar y = ax² + bx + c da diskriminant D < 0 bo'lsa, parabola va Ox o'qi...",
        ru: "Если дискриминант D < 0, то парабола и ось Ox...",
        en: "If the discriminant D < 0, then the parabola and the x-axis...",
      },
      options: [
        { uz: "Kesishmaydi (haqiqiy ildizlar yo'q)", ru: "Не пересекаются (нет действительных корней)", en: "Do not intersect (no real roots)" },
        { uz: "Bitta nuqtada urinadi", ru: "Касаются в одной точке", en: "Touch at exactly one point" },
        { uz: "Ikkita nuqtada kesishadi", ru: "Пересекаются в двух точках", en: "Intersect at two points" },
        { uz: "Ustma-ust tushadi", ru: "Совпадают", en: "Coincide" },
      ],
      correctAnswer: 0,
      hint: {
        uz: "D < 0 da kvadrat tenglama haqiqiy ildizga ega emas.",
        ru: "При D < 0 квадратное уравнение не имеет действительных корней.",
        en: "When D < 0, a quadratic equation has no real solutions.",
      },
      explanation: {
        uz: "D < 0 bo'lsa, y = 0 tenglamaning yechimi yo'q, ya'ni grafik Ox o'qini kesmaydi.",
        ru: "При D < 0 нет корней, значит, парабола не пересекает ось Ox.",
        en: "When D < 0 there are no roots, meaning the curve never crosses the x-axis.",
      },
    },
    // Intervals
    {
      id: 'q5',
      topic: 'intervals',
      difficulty: 'hard',
      type: 'choice',
      prompt: {
        uz: "y = -2x² + 8x - 3 funksiya qaysi oraliqda O'SUVCHI hisoblanadi?",
        ru: "На каком промежутке функция y = -2x² + 8x - 3 ВОЗРАСТАЕТ?",
        en: "On which interval is the function y = -2x² + 8x - 3 INCREASING?",
      },
      options: [
        { uz: "(-∞; 2]", ru: "(-∞; 2]", en: "(-∞; 2]" },
        { uz: "[2; +∞)", ru: "[2; +∞)", en: "[2; +∞)" },
        { uz: "(-∞; +∞)", ru: "(-∞; +∞)", en: "(-∞; +∞)" },
        { uz: "[0; 4]", ru: "[0; 4]", en: "[0; 4]" },
      ],
      correctAnswer: 0,
      hint: {
        uz: "a = -2 < 0 bo'lgani uchun tarmoqlar pastga qaragan. Cho'qqi x0 = -8 / (2 * -2) = 2.",
        ru: "Так как a = -2 < 0, ветви направлены вниз. Вершина x0 = -8 / (2 · (-2)) = 2.",
        en: "Because a = -2 < 0, branches point down. Apex x0 = -8 / (2 * -2) = 2.",
      },
      explanation: {
        uz: "a < 0 bo'lganda funksiya cho'qqigacha o'sadi, ya'ni (-∞; 2] da o'suvchi.",
        ru: "При a < 0 функция возрастает до вершины, то есть на промежутке (-∞; 2].",
        en: "When a < 0, the curve climbs until the apex, so it is increasing on (-∞, 2].",
      },
    },
    // Domain & Range
    {
      id: 'q6',
      topic: 'domain_range',
      difficulty: 'medium',
      type: 'choice',
      prompt: {
        uz: "y = x² + 4 funksiyaning qiymatlar sohasi E(f) qanday?",
        ru: "Какова область значений E(f) функции y = x² + 4?",
        en: "What is the range E(f) of the function y = x² + 4?",
      },
      options: [
        { uz: "[4; +∞)", ru: "[4; +∞)", en: "[4; +∞)" },
        { uz: "(-∞; 4]", ru: "(-∞; 4]", en: "(-∞; 4]" },
        { uz: "(-∞; +∞)", ru: "(-∞; +∞)", en: "(-∞; +∞)" },
        { uz: "[0; +∞)", ru: "[0; +∞)", en: "[0; +∞)" },
      ],
      correctAnswer: 0,
      hint: {
        uz: "a = 1 > 0 bo'lgani uchun eng kichik qiymat y0 = 4 da erishiladi.",
        ru: "Так как a = 1 > 0, наименьшее значение функции равно y0 = 4.",
        en: "Since a = 1 > 0, the minimum value is reached at y0 = 4.",
      },
      explanation: {
        uz: "x² ≥ 0 bo'lgani uchun, y = x² + 4 ≥ 4. Qiymatlar sohasi: [4; +∞).",
        ru: "Так как x² ≥ 0, то x² + 4 ≥ 4. Область значений: [4; +∞).",
        en: "Since x² ≥ 0, we have x² + 4 ≥ 4. The range is [4, +∞).",
      },
    },
    // Parity
    {
      id: 'q7',
      topic: 'parity',
      difficulty: 'easy',
      type: 'choice',
      prompt: {
        uz: "Kvadrat funksiya qachon JUFT bo'ladi?",
        ru: "Когда квадратичная функция является ЧЁТНОЙ?",
        en: "When is a quadratic function EVEN?",
      },
      options: [
        { uz: "b = 0 bo'lganda (y = ax² + c)", ru: "Когда b = 0 (y = ax² + c)", en: "When b = 0 (y = ax² + c)" },
        { uz: "c = 0 bo'lganda", ru: "Когда c = 0", en: "When c = 0" },
        { uz: "a > 0 bo'lganda", ru: "Когда a > 0", en: "When a > 0" },
        { uz: "Hech qachon", ru: "Никогда", en: "Never" },
      ],
      correctAnswer: 0,
      hint: {
        uz: "Juft funksiya bo'lishi uchun f(-x) = f(x) bajarilishi lozim.",
        ru: "Для чётности требуется выполнение условия f(-x) = f(x).",
        en: "For parity to be even, f(-x) = f(x) must hold true.",
      },
      explanation: {
        uz: "f(-x) = a(-x)² + b(-x) + c = ax² - bx + c = f(x) bo'lishi uchun b = 0 bo'lishi shart.",
        ru: "f(-x) = ax² - bx + c совпадает с f(x) только тогда, когда b = 0.",
        en: "f(-x) = ax² - bx + c equals f(x) if and only if b = 0.",
      },
    },
    // Applications
    {
      id: 'q8',
      topic: 'applications',
      difficulty: 'hard',
      type: 'number',
      prompt: {
        uz: "Tosh vertikal yuqoriga h(t) = -5t² + 30t balandlikka otildi. U eng yuqori nuqtaga necha soniyada yetib boradi?",
        ru: "Камень брошен вертикально вверх по закону h(t) = -5t² + 30t. Через сколько секунд он достигнет максимальной высоты?",
        en: "A stone is thrown upward according to h(t) = -5t² + 30t. In how many seconds will it reach maximum height?",
      },
      correctAnswer: 3,
      tolerance: 0.1,
      hint: {
        uz: "Maksimal balandlik uchi t0 = -b / (2a) da bo'ladi.",
        ru: "Максимум достигается в вершине параболы t0 = -b / (2a).",
        en: "Maximum height occurs at the apex t0 = -b / (2a).",
      },
      explanation: {
        uz: "t0 = -30 / (2 * (-5)) = -30 / -10 = 3 soniya.",
        ru: "t0 = -30 / (2 · (-5)) = 3 секунды.",
        en: "t0 = -30 / (2 * -5) = 3 seconds.",
      },
    },
    // True / False
    {
      id: 'q9',
      topic: 'parity',
      difficulty: 'easy',
      type: 'choice',
      prompt: {
        uz: "To'g'ri yoki noto'g'ri: Kvadrat funksiya (a ≠ 0) TOQ bo'lishi mumkin.",
        ru: "Верно или неверно: Квадратичная функция (a ≠ 0) может быть НЕЧЁТНОЙ.",
        en: "True or False: A quadratic function (a ≠ 0) can be an ODD function.",
      },
      options: [
        { uz: "Noto'g'ri (hech qachon toq bo'la olmaydi)", ru: "Неверно (никогда не может быть нечётной)", en: "False (it can never be odd)" },
        { uz: "To'g'ri", ru: "Верно", en: "True" },
      ],
      correctAnswer: 0,
      hint: {
        uz: "Toq funksiya f(-x) = -f(x) shartini tekshirib ko'ring.",
        ru: "Проверь условие нечётности f(-x) = -f(x).",
        en: "Check the odd condition f(-x) = -f(x).",
      },
      explanation: {
        uz: "Kvadrat funksiya hech qachon toq bo'la olmaydi, chunki x² har doim juft darajadir.",
        ru: "Квадратичная функция никогда не бывает нечётной из-за наличия степени x².",
        en: "A quadratic function can never be odd due to the presence of the even power x².",
      },
    },
    // Roots
    {
      id: 'q10',
      topic: 'discriminant',
      difficulty: 'medium',
      type: 'number',
      prompt: {
        uz: "y = x² - 5x + 6 funksiyasining kichik ildizi (x1) nechaga teng?",
        ru: "Чему равен меньший корень (x1) функции y = x² - 5x + 6?",
        en: "What is the smaller root (x1) of y = x² - 5x + 6?",
      },
      correctAnswer: 2,
      tolerance: 0.1,
      hint: {
        uz: "Viyet teoremasidan foydalaning: x1 + x2 = 5, x1 * x2 = 6.",
        ru: "Используй теорему Виета: x1 + x2 = 5, x1 · x2 = 6.",
        en: "Use Vieta's formulas: x1 + x2 = 5, x1 * x2 = 6.",
      },
      explanation: {
        uz: "Ildizlar: 2 va 3. Kichigi 2 dir.",
        ru: "Корни равны 2 и 3. Меньший из них — 2.",
        en: "The roots are 2 and 3. The smaller root is 2.",
      },
    },
  ];

  // Filter questions based on selection
  const filteredQuestions = questionPool.filter(q => {
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
    return true;
  });

  const activeQuestions = filteredQuestions.length >= 5 ? filteredQuestions : questionPool;
  const currentQuestion = activeQuestions[currentIndex];

  const handleStartQuiz = () => {
    playClickSound();
    setCurrentIndex(0);
    setUserAnswer('');
    setShowHint(false);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
    setIsQuizActive(true);
  };

  const handleSubmitAnswer = () => {
    if (isAnswerSubmitted) return;

    let correct = false;
    if (currentQuestion.type === 'choice') {
      correct = parseInt(userAnswer, 10) === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'number') {
      const parsed = parseStudentNumber(userAnswer);
      if (parsed !== null) {
        const expected = Number(currentQuestion.correctAnswer);
        const tol = currentQuestion.tolerance || 0.1;
        correct = approxEqual(parsed, expected, tol);
      }
    }

    setIsCorrect(correct);
    setIsAnswerSubmitted(true);

    if (correct) {
      playSuccessSound();
      setQuizScore(s => s + 1);
    } else {
      playErrorSound();
      // Record in mistakes tracker
      recordMistake({
        questionText: currentQuestion.prompt[language],
        userAnswer: userAnswer || "Javob berilmadi",
        correctAnswer: String(currentQuestion.correctAnswer),
        explanation: currentQuestion.explanation[language],
        topic: currentQuestion.topic,
      });
    }
  };

  const handleNextQuestion = () => {
    playClickSound();
    if (currentIndex + 1 >= activeQuestions.length) {
      setQuizFinished(true);
      const earnedXP = quizScore * 10;
      addXP(earnedXP);
      if (quizScore >= activeQuestions.length * 0.7) {
        fireConfetti();
      }
    } else {
      setCurrentIndex(i => i + 1);
      setUserAnswer('');
      setShowHint(false);
      setIsAnswerSubmitted(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Quiz Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span className="text-2xl">📝</span>
            <span>{t.quizTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t.quizSubtitle}
          </p>
        </div>

        {/* Filters if not inside active quiz */}
        {!isQuizActive && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="all">Barcha mavzular (All)</option>
              <option value="basics">Kvadrat funksiya asosi</option>
              <option value="vertex">Uchining koordinatalari</option>
              <option value="shift">Grafiklarni siljitish</option>
              <option value="discriminant">Diskriminant va ildizlar</option>
              <option value="intervals">O'sish va kamayish</option>
              <option value="domain_range">Aniqlanish va qiymatlar sohasi</option>
              <option value="parity">Juft va toqlik</option>
              <option value="applications">Amaliy masalalar</option>
            </select>

            <button
              onClick={handleStartQuiz}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md active:scale-95 transition-all"
            >
              Testni boshlash
            </button>
          </div>
        )}
      </div>

      {/* Main Quiz Area */}
      {!isQuizActive ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <span className="text-5xl block">🎯</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Bilimingizni sinovdan o'tkazing
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Tanlangan mavzu bo'yicha 10 ta savol. Har bir to'g'ri javob uchun +10 XP beriladi. Xatolar avtomatik tarzda tahlil qilinadi.
          </p>
          <button
            onClick={handleStartQuiz}
            className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all"
          >
            Boshlash
          </button>
        </div>
      ) : quizFinished ? (
        // Result Screen
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <span className="text-5xl block">{quizScore >= activeQuestions.length * 0.7 ? '🎉' : '📚'}</span>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {t.quizResultTitle}
          </h2>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">To'g'ri javoblar:</span>
            <div className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
              {quizScore} / {activeQuestions.length}
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +{quizScore * 10} XP qo'shildi!
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleStartQuiz}
              className="flex-1 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Qayta urinish</span>
            </button>
            <button
              onClick={() => setIsQuizActive(false)}
              className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm"
            >
              Menyuga
            </button>
          </div>
        </div>
      ) : (
        // Active Question Card
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-5">
          
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>
              {t.questionNumber} {currentIndex + 1} / {activeQuestions.length}
            </span>
            <span className="text-sky-600 dark:text-sky-400">
              Ball: {quizScore}
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-500 h-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
            />
          </div>

          {/* Prompt */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
            {currentQuestion.prompt[language]}
          </h3>

          {/* Options / Input Form */}
          {currentQuestion.type === 'choice' && currentQuestion.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQuestion.options.map((opt, i) => {
                const selected = userAnswer === String(i);
                let btnStyle = 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300';

                if (isAnswerSubmitted) {
                  if (i === currentQuestion.correctAnswer) {
                    btnStyle = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                  } else if (selected) {
                    btnStyle = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-300 font-bold';
                  }
                } else if (selected) {
                  btnStyle = 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 font-bold';
                }

                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (!isAnswerSubmitted) {
                        playClickSound();
                        setUserAnswer(String(i));
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all ${btnStyle}`}
                  >
                    {opt[language]}
                  </button>
                );
              })}
            </div>
          )}

          {currentQuestion.type === 'number' && (
            <div className="space-y-2">
              <input
                type="text"
                value={userAnswer}
                disabled={isAnswerSubmitted}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Masalan: 3 yoki -0.5 yoki 1/2"
                className="w-full sm:w-64 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
              />
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => setShowHint(h => !h)}
              className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              <Lightbulb className="w-4 h-4" />
              <span>{t.hintBtn}</span>
            </button>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={userAnswer === ''}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                {t.checkAnswer}
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                <span>Keyingi savol</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Hint Dropdown */}
          {showHint && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              💡 {currentQuestion.hint[language]}
            </div>
          )}

          {/* Feedback & Explanation */}
          {isAnswerSubmitted && (
            <div className={`p-4 rounded-2xl border ${
              isCorrect 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300' 
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                {isCorrect ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-rose-500" />}
                <span>{isCorrect ? t.mascotCorrect : t.mascotWrong}</span>
              </div>
              <p className="text-xs leading-relaxed">
                <strong>{t.workedSolution}:</strong> {currentQuestion.explanation[language]}
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
