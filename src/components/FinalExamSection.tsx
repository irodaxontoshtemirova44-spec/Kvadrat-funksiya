import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { Question, ExamResult } from '../types';
import { parseStudentNumber, approxEqual, formatNum } from '../utils/math';
import { playClickSound, playSuccessSound, playWinFanfare } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import { 
  Award, Clock, CheckCircle2, AlertTriangle, 
  Printer, ArrowRight, RotateCcw, ChevronLeft, ChevronRight 
} from 'lucide-react';

export const FinalExamSection: React.FC = () => {
  const { language, profile, saveExamResult, addXP } = useApp();
  const t = translations[language];

  const [examState, setExamState] = useState<'intro' | 'testing' | 'result'>('intro');
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [timeLeftSec, setTimeLeftSec] = useState<number>(1800); // 30 minutes
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // 25 Comprehensive Exam Questions
  const examQuestions: Question[] = [
    {
      id: 'e1',
      topic: 'basics',
      difficulty: 'easy',
      type: 'choice',
      prompt: {
        uz: "1. Kvadrat funksiyaning umumiy ko'rinishi qaysi?",
        ru: "1. Каков общий вид квадратичной функции?",
        en: "1. What is the standard form of a quadratic function?",
      },
      options: [
        { uz: "y = ax² + bx + c (a ≠ 0)", ru: "y = ax² + bx + c (a ≠ 0)", en: "y = ax² + bx + c (a ≠ 0)" },
        { uz: "y = kx + b", ru: "y = kx + b", en: "y = kx + b" },
        { uz: "y = ax³ + b", ru: "y = ax³ + b", en: "y = ax³ + b" },
        { uz: "y = k/x", ru: "y = k/x", en: "y = k/x" },
      ],
      correctAnswer: 0,
      hint: { uz: "x² ning oldidagi koeffitsiyent 0 bo'lmasligi lozim.", ru: "Коэффициент при x² не равен 0.", en: "Coefficient of x² must not be 0." },
      explanation: { uz: "Kvadrat funksiya: y = ax² + bx + c, bu yerda a ≠ 0.", ru: "Квадратичная функция: y = ax² + bx + c (a ≠ 0).", en: "Standard quadratic form: y = ax² + bx + c (a ≠ 0)." },
    },
    {
      id: 'e2',
      topic: 'vertex',
      difficulty: 'easy',
      type: 'number',
      prompt: {
        uz: "2. y = x² - 4x + 7 funksiyasi parabola uchining absissasi x0 nechaga teng?",
        ru: "2. Чему равна абсцисса вершины x0 параболы y = x² - 4x + 7?",
        en: "2. What is the vertex x-coordinate x0 of y = x² - 4x + 7?",
      },
      correctAnswer: 2,
      tolerance: 0.1,
      hint: { uz: "x0 = -b / (2a)", ru: "x0 = -b / (2a)", en: "x0 = -b / (2a)" },
      explanation: { uz: "x0 = -(-4) / (2 * 1) = 4 / 2 = 2.", ru: "x0 = -(-4) / 2 = 2.", en: "x0 = -(-4) / 2 = 2." },
    },
    {
      id: 'e3',
      topic: 'vertex',
      difficulty: 'medium',
      type: 'number',
      prompt: {
        uz: "3. y = x² - 4x + 7 funksiyasi parabola uchining ordinatasi y0 nechaga teng?",
        ru: "3. Чему равна ордината вершины y0 параболы y = x² - 4x + 7?",
        en: "3. What is the vertex y-coordinate y0 of y = x² - 4x + 7?",
      },
      correctAnswer: 3,
      tolerance: 0.1,
      hint: { uz: "x0 = 2 ni funksiyaga qo'ying: y0 = 2² - 4*2 + 7.", ru: "Подставь x0 = 2 в формулу.", en: "Plug x0 = 2 into the function." },
      explanation: { uz: "y0 = 4 - 8 + 7 = 3.", ru: "y0 = 4 - 8 + 7 = 3.", en: "y0 = 4 - 8 + 7 = 3." },
    },
    {
      id: 'e4',
      topic: 'shift',
      difficulty: 'easy',
      type: 'choice',
      prompt: {
        uz: "4. y = (x + 3)² - 2 funksiyaning uchi qaysi nuqtada joylashgan?",
        ru: "4. Где находится вершина параболы y = (x + 3)² - 2?",
        en: "4. Where is the vertex of y = (x + 3)² - 2 located?",
      },
      options: [
        { uz: "(-3; -2)", ru: "(-3; -2)", en: "(-3; -2)" },
        { uz: "(3; -2)", ru: "(3; -2)", en: "(3; -2)" },
        { uz: "(-3; 2)", ru: "(-3; 2)", en: "(-3; 2)" },
        { uz: "(3; 2)", ru: "(3; 2)", en: "(3; 2)" },
      ],
      correctAnswer: 0,
      hint: { uz: "y = a(x - m)² + n dagi uchi (m; n).", ru: "y = a(x - m)² + n дает вершину (m; n).", en: "y = a(x - m)² + n gives vertex (m, n)." },
      explanation: { uz: "m = -3, n = -2 bo'lgani uchun uchi (-3; -2) nuqtada.", ru: "Вершина в точке (-3; -2).", en: "Vertex at (-3, -2)." },
    },
    {
      id: 'e5',
      topic: 'shift',
      difficulty: 'medium',
      type: 'choice',
      prompt: {
        uz: "5. y = x² grafigini Ox o'qi bo'ylab 5 birlik o'ngga sursak, qaysi formula hosil bo'ladi?",
        ru: "5. Какой график получится при сдвиге y = x² вправо на 5 единиц?",
        en: "5. Which equation results from shifting y = x² right by 5 units?",
      },
      options: [
        { uz: "y = (x - 5)²", ru: "y = (x - 5)²", en: "y = (x - 5)²" },
        { uz: "y = (x + 5)²", ru: "y = (x + 5)²", en: "y = (x + 5)²" },
        { uz: "y = x² + 5", ru: "y = x² + 5", en: "y = x² + 5" },
        { uz: "y = x² - 5", ru: "y = x² - 5", en: "y = x² - 5" },
      ],
      correctAnswer: 0,
      hint: { uz: "O'ngga surishda (x - m) bo'ladi.", ru: "Сдвиг вправо — это (x - m).", en: "Shift right is (x - m)." },
      explanation: { uz: "O'ngga siljish: y = (x - 5)².", ru: "Сдвиг вправо: y = (x - 5)².", en: "Shift right: y = (x - 5)²." },
    },
    {
      id: 'e6',
      topic: 'discriminant',
      difficulty: 'medium',
      type: 'number',
      prompt: {
        uz: "6. y = x² - 6x + 5 funksiyasi diskriminanti D nechaga teng?",
        ru: "6. Чему равен дискриминант D для y = x² - 6x + 5?",
        en: "6. What is the discriminant D of y = x² - 6x + 5?",
      },
      correctAnswer: 16,
      tolerance: 0.1,
      hint: { uz: "D = b² - 4ac", ru: "D = b² - 4ac", en: "D = b² - 4ac" },
      explanation: { uz: "D = (-6)² - 4 * 1 * 5 = 36 - 20 = 16.", ru: "D = 36 - 20 = 16.", en: "D = 36 - 20 = 16." },
    },
    {
      id: 'e7',
      topic: 'discriminant',
      difficulty: 'medium',
      type: 'number',
      prompt: {
        uz: "7. y = x² - 6x + 5 funksiyasining katta ildizi x2 nechaga teng?",
        ru: "7. Чему равен больший корень функции y = x² - 6x + 5?",
        en: "7. What is the larger root of y = x² - 6x + 5?",
      },
      correctAnswer: 5,
      tolerance: 0.1,
      hint: { uz: "Ildizlar: (6 ± √16) / 2.", ru: "Корни: (6 ± 4) / 2.", en: "Roots: (6 ± 4) / 2." },
      explanation: { uz: "Ildizlar 1 va 5. Kattasi 5.", ru: "Корни 1 и 5. Больший корень равен 5.", en: "Roots are 1 and 5. The larger root is 5." },
    },
    {
      id: 'e8',
      topic: 'intervals',
      difficulty: 'easy',
      type: 'choice',
      prompt: {
        uz: "8. y = 3x² funksiya qaysi oraliqda O'SUVCHI?",
        ru: "8. На каком промежутке функция y = 3x² ВОЗРАСТАЕТ?",
        en: "8. On which interval is y = 3x² INCREASING?",
      },
      options: [
        { uz: "[0; +∞)", ru: "[0; +∞)", en: "[0; +∞)" },
        { uz: "(-∞; 0]", ru: "(-∞; 0]", en: "(-∞; 0]" },
        { uz: "(-∞; +∞)", ru: "(-∞; +∞)", en: "(-∞; +∞)" },
        { uz: "[-3; 3]", ru: "[-3; 3]", en: "[-3; 3]" },
      ],
      correctAnswer: 0,
      hint: { uz: "a = 3 > 0 bo'lgani uchun, uchi (0; 0) dan o'ng tomonda o'sadi.", ru: "Ветви вверх, возрастает справа от вершины.", en: "Opens upward, increases to the right of origin." },
      explanation: { uz: "a > 0 da funksiya [x0; +∞) da o'sadi, ya'ni [0; +∞).", ru: "Возрастает на [0; +∞).", en: "Increases on [0, +∞)." },
    },
    {
      id: 'e9',
      topic: 'intervals',
      difficulty: 'medium',
      type: 'choice',
      prompt: {
        uz: "9. y = -x² + 4x funksiya qaysi oraliqda KAMAYUVCHI?",
        ru: "9. На каком промежутке функция y = -x² + 4x УБЫВАЕТ?",
        en: "9. On which interval is y = -x² + 4x DECREASING?",
      },
      options: [
        { uz: "[2; +∞)", ru: "[2; +∞)", en: "[2; +∞)" },
        { uz: "(-∞; 2]", ru: "(-∞; 2]", en: "(-∞; 2]" },
        { uz: "(-∞; +∞)", ru: "(-∞; +∞)", en: "(-∞; +∞)" },
        { uz: "[0; 4]", ru: "[0; 4]", en: "[0; 4]" },
      ],
      correctAnswer: 0,
      hint: { uz: "a = -1 < 0, uchi x0 = -4 / (2 * -1) = 2. Cho'qqidan keyin pastga tushadi.", ru: "Ветви вниз, убывает после вершины x0 = 2.", en: "Branches open down, decreases after x0 = 2." },
      explanation: { uz: "Cho'qqi x=2 dan keyin kamayadi, ya'ni [2; +∞).", ru: "Убывает на [2; +∞).", en: "Decreasing on [2, +∞)." },
    },
    {
      id: 'e10',
      topic: 'domain_range',
      difficulty: 'easy',
      type: 'choice',
      prompt: {
        uz: "10. Kvadrat funksiyaning aniqlanish sohasi D(f) har doim qanday?",
        ru: "10. Какова всегда область определения D(f) квадратичной функции?",
        en: "10. What is always the domain D(f) of a quadratic function?",
      },
      options: [
        { uz: "Barcha haqiqiy sonlar (-∞; +∞)", ru: "Все действительные числа (-∞; +∞)", en: "All real numbers (-∞; +∞)" },
        { uz: "[0; +∞)", ru: "[0; +∞)", en: "[0; +∞)" },
        { uz: "(-∞; 0]", ru: "(-∞; 0]", en: "(-∞; 0]" },
        { uz: "[-1; 1]", ru: "[-1; 1]", en: "[-1; 1]" },
      ],
      correctAnswer: 0,
      hint: { uz: "Argument x o'rniga istalgan sonni qo'yish mumkin.", ru: "Вместо x можно подставить любое число.", en: "You can evaluate at any x without restriction." },
      explanation: { uz: "Kvadrat funksiyada bo'lish yoki ildiz osti yo'q, D(f) = (-∞; +∞).", ru: "D(f) = (-∞; +∞).", en: "D(f) = (-∞; +∞)." },
    },
    {
      id: 'e11',
      topic: 'domain_range',
      difficulty: 'medium',
      type: 'choice',
      prompt: {
        uz: "11. y = -x² + 9 funksiyaning qiymatlar sohasi E(f) qanday?",
        ru: "11. Какова область значений E(f) функции y = -x² + 9?",
        en: "11. What is the range E(f) of y = -x² + 9?",
      },
      options: [
        { uz: "(-∞; 9]", ru: "(-∞; 9]", en: "(-∞; 9]" },
        { uz: "[9; +∞)", ru: "[9; +∞)", en: "[9; +∞)" },
        { uz: "(-∞; +∞)", ru: "(-∞; +∞)", en: "(-∞; +∞)" },
        { uz: "[-3; 3]", ru: "[-3; 3]", en: "[-3; 3]" },
      ],
      correctAnswer: 0,
      hint: { uz: "a = -1 < 0 bo'lgani uchun eng katta qiymat y0 = 9.", ru: "Ветви вниз, максимум равен 9.", en: "Branches open down, maximum is 9." },
      explanation: { uz: "-x² ≤ 0 bo'lgani uchun y ≤ 9. E(f) = (-∞; 9].", ru: "E(f) = (-∞; 9].", en: "E(f) = (-∞; 9]." },
    },
    {
      id: 'e12',
      topic: 'parity',
      difficulty: 'easy',
      type: 'choice',
      prompt: {
        uz: "12. Quyidagi funksiyalardan qaysi biri JUFT hisoblanadi?",
        ru: "12. Какая из следующих функций является ЧЁТНОЙ?",
        en: "12. Which of the following functions is EVEN?",
      },
      options: [
        { uz: "y = 4x² - 7", ru: "y = 4x² - 7", en: "y = 4x² - 7" },
        { uz: "y = 2x² + 3x", ru: "y = 2x² + 3x", en: "y = 2x² + 3x" },
        { uz: "y = (x - 1)²", ru: "y = (x - 1)²", en: "y = (x - 1)²" },
        { uz: "y = x³", ru: "y = x³", en: "y = x³" },
      ],
      correctAnswer: 0,
      hint: { uz: "b = 0 bo'lganda funksiya juft bo'ladi.", ru: "При b = 0 функция чётная.", en: "When b = 0, quadratic is even." },
      explanation: { uz: "y = 4x² - 7 da b = 0, shuning uchun f(-x) = f(x).", ru: "Так как b = 0, f(-x) = f(x).", en: "Because b = 0, f(-x) = f(x)." },
    },
    {
      id: 'e13',
      topic: 'parity',
      difficulty: 'medium',
      type: 'choice',
      prompt: {
        uz: "13. Juft funksiyaning grafigi qaysi o'qqa nisbatan simmetrik?",
        ru: "13. Относительно какой оси симметричен график чётной функции?",
        en: "13. Across which axis is an even function's graph symmetrical?",
      },
      options: [
        { uz: "Oy o'qi (ordinata o'qi)", ru: "Ось ординат Oy", en: "Y-axis" },
        { uz: "Ox o'qi (absissa o'qi)", ru: "Ось абсцисс Ox", en: "X-axis" },
        { uz: "y = x to'g'ri chizig'i", ru: "Прямая y = x", en: "Line y = x" },
        { uz: "Simmetriyaga ega emas", ru: "Не имеет симметрии", en: "Has no symmetry" },
      ],
      correctAnswer: 0,
      hint: { uz: "f(-x) = f(x) simmetriyasi.", ru: "Симметрия f(-x) = f(x).", en: "Symmetry f(-x) = f(x)." },
      explanation: { uz: "Juft funksiyalar har doim Oy o'qiga nisbatan simmetrikdir.", ru: "Чётная функция симметрична относительно оси Oy.", en: "Even functions are always symmetrical across the y-axis." },
    },
    {
      id: 'e14',
      topic: 'applications',
      difficulty: 'hard',
      type: 'number',
      prompt: {
        uz: "14. Jism h(t) = -5t² + 40t tenglama bo'yicha yuqoriga otildi. Uning eng katta ko'tarilish balandligi necha metr?",
        ru: "14. Тело брошено вверх по закону h(t) = -5t² + 40t. Какова максимальная высота подъёма в метрах?",
        en: "14. A projectile trajectory is h(t) = -5t² + 40t. What is its maximum height in meters?",
      },
      correctAnswer: 80,
      tolerance: 0.5,
      hint: { uz: "Avval t0 = -b/(2a) = 4 ni toping, so'ng h(4) ni hisoblang.", ru: "Сначала найди t0 = 4, затем h(4).", en: "Find t0 = 4, then evaluate h(4)." },
      explanation: { uz: "t0 = -40 / (2 * -5) = 4 soniya. h(4) = -5(16) + 40(4) = -80 + 160 = 80 metr.", ru: "h(4) = -80 + 160 = 80 м.", en: "h(4) = -80 + 160 = 80 meters." },
    },
    {
      id: 'e15',
      topic: 'basics',
      difficulty: 'easy',
      type: 'choice',
      prompt: {
        uz: "15. Agar a < 0 bo'lsa, parabola tarmoqlari qayerga qaragan?",
        ru: "15. Куда направлены ветви параболы при a < 0?",
        en: "15. Which direction do parabola branches open when a < 0?",
      },
      options: [
        { uz: "Pastga", ru: "Вниз", en: "Downward" },
        { uz: "Yuqoriga", ru: "Вверх", en: "Upward" },
        { uz: "O'ngga", ru: "Вправо", en: "Right" },
        { uz: "Chapga", ru: "Влево", en: "Left" },
      ],
      correctAnswer: 0,
      hint: { uz: "Manfiy a bo'lsa tepalik (gumbaz) hosil bo'ladi.", ru: "Отрицательный знак a дает купол.", en: "Negative a curves downward like a hill." },
      explanation: { uz: "a < 0 bo'lsa parabola tarmoqlari pastga yo'nalgan bo'ladi.", ru: "При a < 0 ветви направлены вниз.", en: "When a < 0, branches open downward." },
    },
    {
      id: 'e16',
      topic: 'vertex',
      difficulty: 'hard',
      type: 'choice',
      prompt: {
        uz: "16. y = 2x² - 8x + 11 funksiyasini kanonik ko'rinishga keltiring:",
        ru: "16. Приведи y = 2x² - 8x + 11 к каноническому виду:",
        en: "16. Convert y = 2x² - 8x + 11 into vertex form:",
      },
      options: [
        { uz: "y = 2(x - 2)² + 3", ru: "y = 2(x - 2)² + 3", en: "y = 2(x - 2)² + 3" },
        { uz: "y = 2(x + 2)² + 3", ru: "y = 2(x + 2)² + 3", en: "y = 2(x + 2)² + 3" },
        { uz: "y = 2(x - 4)² + 11", ru: "y = 2(x - 4)² + 11", en: "y = 2(x - 4)² + 11" },
        { uz: "y = (x - 2)² + 3", ru: "y = (x - 2)² + 3", en: "y = (x - 2)² + 3" },
      ],
      correctAnswer: 0,
      hint: { uz: "x0 = 8 / (2*2) = 2, y0 = 2(4) - 16 + 11 = 3.", ru: "x0 = 2, y0 = 3.", en: "x0 = 2, y0 = 3." },
      explanation: { uz: "y = 2(x² - 4x + 4) + 11 - 8 = 2(x - 2)² + 3.", ru: "y = 2(x - 2)² + 3.", en: "y = 2(x - 2)² + 3." },
    },
    {
      id: 'e17',
      topic: 'discriminant',
      difficulty: 'easy',
      type: 'number',
      prompt: {
        uz: "17. y = x² - 4 funksiyasining Oy o'qi bilan kesishish nuqtasi ordinatasi c nechaga teng?",
        ru: "17. Чему равна ордината точки пересечения y = x² - 4 с осью Oy?",
        en: "17. What is the y-intercept of y = x² - 4?",
      },
      correctAnswer: -4,
      tolerance: 0.1,
      hint: { uz: "x = 0 qo'ying.", ru: "Подставь x = 0.", en: "Evaluate at x = 0." },
      explanation: { uz: "x = 0 da y = 0 - 4 = -4.", ru: "При x = 0 y = -4.", en: "At x = 0, y = -4." },
    },
    {
      id: 'e18',
      topic: 'discriminant',
      difficulty: 'medium',
      type: 'choice',
      prompt: {
        uz: "18. Agar parabola Ox o'qiga urinib o'tsa (bitta umumiy nuqtaga ega bo'lsa), diskriminant D qanday bo'ladi?",
        ru: "18. Если парабола касается оси Ox, каков дискриминант D?",
        en: "18. If a parabola is tangent to the x-axis, what is discriminant D?",
      },
      options: [
        { uz: "D = 0", ru: "D = 0", en: "D = 0" },
        { uz: "D > 0", ru: "D > 0", en: "D > 0" },
        { uz: "D < 0", ru: "D < 0", en: "D < 0" },
        { uz: "D = 1", ru: "D = 1", en: "D = 1" },
      ],
      correctAnswer: 0,
      hint: { uz: "Bitta ildizga ega bo'lish sharti.", ru: "Условие одного корня.", en: "Condition for a single repeated root." },
      explanation: { uz: "D = 0 bo'lganda yagona ildiz bo'ladi va parabola uchi Ox o'qiga urinadi.", ru: "При D = 0 график касается оси Ox.", en: "When D = 0, the vertex touches the x-axis." },
    },
    {
      id: 'e19',
      topic: 'intervals',
      difficulty: 'medium',
      type: 'choice',
      prompt: {
        uz: "19. y = (x - 3)² + 1 funksiya qaysi oraliqda KAMAYADI?",
        ru: "19. На каком промежутке функция y = (x - 3)² + 1 УБЫВАЕТ?",
        en: "19. On which interval does y = (x - 3)² + 1 DECREASE?",
      },
      options: [
        { uz: "(-∞; 3]", ru: "(-∞; 3]", en: "(-∞; 3]" },
        { uz: "[3; +∞)", ru: "[3; +∞)", en: "[3; +∞)" },
        { uz: "(-∞; 1]", ru: "(-∞; 1]", en: "(-∞; 1]" },
        { uz: "[1; +∞)", ru: "[1; +∞)", en: "[1; +∞)" },
      ],
      correctAnswer: 0,
      hint: { uz: "Tarmoqlar yuqoriga qaragan, uchi x0 = 3.", ru: "Ветви вверх, вершина x0 = 3.", en: "Opens up, vertex x0 = 3." },
      explanation: { uz: "Uchigacha tushadi, ya'ni (-∞; 3] oraliqda kamayadi.", ru: "Убывает на (-∞; 3].", en: "Decreasing on (-∞, 3]." },
    },
    {
      id: 'e20',
      topic: 'parity',
      difficulty: 'hard',
      type: 'choice',
      prompt: {
        uz: "20. y = 3x² + 5x funksiyasining juft/toqligi qanday?",
        ru: "20. Какова чётность функции y = 3x² + 5x?",
        en: "20. What is the parity of y = 3x² + 5x?",
      },
      options: [
        { uz: "Na juft, na toq (umumiy ko'rinishdagi)", ru: "Ни чётная, ни нечётная", en: "Neither even nor odd" },
        { uz: "Juft", ru: "Чётная", en: "Even" },
        { uz: "Toq", ru: "Нечётная", en: "Odd" },
        { uz: "Ham juft, ham toq", ru: "И чётная, и нечётная", en: "Both even and odd" },
      ],
      correctAnswer: 0,
      hint: { uz: "b = 5 ≠ 0 bo'lgani uchun tekshiring.", ru: "Так как b ≠ 0.", en: "Check because b ≠ 0." },
      explanation: { uz: "f(-x) = 3x² - 5x. U f(x) ga ham, -f(x) ga ham teng emas. Demak na juft, na toq.", ru: "Функция ни чётная, ни нечётная.", en: "Neither even nor odd." },
    },
    {
      id: 'e21',
      topic: 'applications',
      difficulty: 'hard',
      type: 'choice',
      prompt: {
        uz: "21. To'g'ri to'rtburchak perimetri 20 sm. Uning yuzi maksimal bo'lishi uchun tomonlari qanday bo'lishi kerak?",
        ru: "21. Периметр прямоугольника 20 см. Каковы стороны для максимальной площади?",
        en: "21. Perimeter of a rectangle is 20 cm. What side lengths yield maximum area?",
      },
      options: [
        { uz: "5 sm va 5 sm (Kvadrat)", ru: "5 см и 5 см (Квадрат)", en: "5 cm and 5 cm (Square)" },
        { uz: "4 sm va 6 sm", ru: "4 см и 6 см", en: "4 cm and 6 cm" },
        { uz: "3 sm va 7 sm", ru: "3 см и 7 см", en: "3 cm and 7 см" },
        { uz: "2 sm va 8 sm", ru: "2 см и 8 см", en: "2 cm and 8 cm" },
      ],
      correctAnswer: 0,
      hint: { uz: "S(x) = x(10 - x) = -x² + 10x ning uchini toping.", ru: "Найди вершину параболы S(x) = -x² + 10x.", en: "Find vertex of S(x) = -x² + 10x." },
      explanation: { uz: "x0 = -10 / (2 * -1) = 5 sm. Maksimal yuza kvadratda bo'ladi: 5 x 5 = 25 sm².", ru: "Максимум у квадрата 5x5.", en: "Maximum occurs at square 5x5." },
    },
    {
      id: 'e22',
      topic: 'vertex',
      difficulty: 'easy',
      type: 'choice',
      prompt: {
        uz: "22. Parabola simmetriya o'qi tenglamasi har doim qaysi ko'rinishda bo'ladi?",
        ru: "22. Как всегда записывается уравнение оси симметрии параболы?",
        en: "22. How is the equation of the axis of symmetry always written?",
      },
      options: [
        { uz: "x = -b / (2a)", ru: "x = -b / (2a)", en: "x = -b / (2a)" },
        { uz: "y = -b / (2a)", ru: "y = -b / (2a)", en: "y = -b / (2a)" },
        { uz: "x = c", ru: "x = c", en: "x = c" },
        { uz: "y = 0", ru: "y = 0", en: "y = 0" },
      ],
      correctAnswer: 0,
      hint: { uz: "Simmetriya o'qi vertikal to'g'ri chiziqdir.", ru: "Ось симметрии вертикальна.", en: "Axis of symmetry is a vertical line." },
      explanation: { uz: "Simmetriya o'qi vertikal bo'lib, uning tenglamasi x = x0 = -b/(2a).", ru: "Прямая x = -b/(2a).", en: "Line x = -b/(2a)." },
    },
    {
      id: 'e23',
      topic: 'discriminant',
      difficulty: 'hard',
      type: 'number',
      prompt: {
        uz: "23. y = x² - 2x + k funksiyasi Ox o'qiga urinishi uchun k nechaga teng bo'lishi kerak?",
        ru: "23. При каком k парабола y = x² - 2x + k касается оси Ox?",
        en: "23. For what value of k is y = x² - 2x + k tangent to the x-axis?",
      },
      correctAnswer: 1,
      tolerance: 0.1,
      hint: { uz: "D = b² - 4ac = 0 bo'lishi kerak: 4 - 4k = 0.", ru: "D = 4 - 4k = 0.", en: "D = 4 - 4k = 0." },
      explanation: { uz: "4 - 4k = 0 ⟹ 4k = 4 ⟹ k = 1.", ru: "4 - 4k = 0 ⟹ k = 1.", en: "4 - 4k = 0 ⟹ k = 1." },
    },
    {
      id: 'e24',
      topic: 'domain_range',
      difficulty: 'hard',
      type: 'number',
      prompt: {
        uz: "24. y = 3(x - 1)² - 7 funksiyasining eng kichik qiymati nechaga teng?",
        ru: "24. Чему равно наименьшее значение функции y = 3(x - 1)² - 7?",
        en: "24. What is the minimum value of y = 3(x - 1)² - 7?",
      },
      correctAnswer: -7,
      tolerance: 0.1,
      hint: { uz: "Kvadrat qism 0 bo'lganda eng kichik qiymat hosil bo'ladi.", ru: "Минимум равен n.", en: "Minimum equals n." },
      explanation: { uz: "x = 1 da y = 3(0) - 7 = -7.", ru: "Минимум равен -7.", en: "Minimum is -7." },
    },
    {
      id: 'e25',
      topic: 'applications',
      difficulty: 'medium',
      type: 'choice',
      prompt: {
        uz: "25. Shahar ko'prigining parabolik kamari y = -0.1x² + 10 tenglama bilan berilgan. Ko'prikning eng baland nuqtasi daryo sathidan necha metr baland?",
        ru: "25. Арка моста задана как y = -0.1x² + 10. Какова максимальная высота арки над водой?",
        en: "25. A bridge arch is modeled by y = -0.1x² + 10. What is its maximum clearance above the river?",
      },
      options: [
        { uz: "10 metr", ru: "10 метров", en: "10 meters" },
        { uz: "100 metr", ru: "100 метров", en: "100 meters" },
        { uz: "5 metr", ru: "5 метров", en: "5 meters" },
        { uz: "0.1 metr", ru: "0.1 метра", en: "0.1 meters" },
      ],
      correctAnswer: 0,
      hint: { uz: "x = 0 bo'lganda cho'qqi bo'ladi.", ru: "При x = 0 вершина равна 10.", en: "At x = 0, height is 10." },
      explanation: { uz: "x = 0 da y0 = 10 metr.", ru: "Высота равна 10 м.", en: "Clearance is 10 meters." },
    },
  ];

  // Timer countdown
  useEffect(() => {
    if (examState !== 'testing') return;
    const timer = setInterval(() => {
      setTimeLeftSec(prev => {
        if (prev <= 1) {
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [examState]);

  const startExam = () => {
    playClickSound();
    setExamState('testing');
    setCurrentIdx(0);
    setAnswers({});
    setFlagged({});
    setTimeLeftSec(1800);
  };

  const handleSelectAnswer = (ans: string) => {
    playClickSound();
    setAnswers(prev => ({ ...prev, [currentIdx]: ans }));
  };

  const toggleFlag = (idx: number) => {
    setFlagged(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const finishExam = () => {
    let correctCount = 0;
    const topicBreakdown: Record<string, { correct: number; total: number }> = {
      basics: { correct: 0, total: 0 },
      vertex: { correct: 0, total: 0 },
      shift: { correct: 0, total: 0 },
      discriminant: { correct: 0, total: 0 },
      intervals: { correct: 0, total: 0 },
      domain_range: { correct: 0, total: 0 },
      parity: { correct: 0, total: 0 },
      applications: { correct: 0, total: 0 },
    };

    examQuestions.forEach((q, idx) => {
      const userAns = answers[idx];
      const topicKey = q.topic;
      if (!topicBreakdown[topicKey]) {
        topicBreakdown[topicKey] = { correct: 0, total: 0 };
      }
      topicBreakdown[topicKey].total += 1;

      let isQCorrect = false;
      if (q.type === 'choice') {
        if (userAns !== undefined && parseInt(userAns, 10) === q.correctAnswer) {
          isQCorrect = true;
        }
      } else if (q.type === 'number') {
        const parsed = parseStudentNumber(userAns);
        if (parsed !== null && approxEqual(parsed, Number(q.correctAnswer), q.tolerance || 0.1)) {
          isQCorrect = true;
        }
      }

      if (isQCorrect) {
        correctCount++;
        topicBreakdown[topicKey].correct += 1;
      }
    });

    const percentage = Math.round((correctCount / examQuestions.length) * 100);

    // 5-point scale:
    // 5: >= 90%
    // 4: 75% - 89%
    // 3: 55% - 74%
    // 2: < 55%
    let grade = 2;
    if (percentage >= 90) grade = 5;
    else if (percentage >= 75) grade = 4;
    else if (percentage >= 55) grade = 3;

    // Recommended lessons based on low topic scores
    const recommendedLessons: string[] = [];
    Object.entries(topicBreakdown).forEach(([topic, stat]) => {
      if (stat.total > 0 && stat.correct / stat.total < 0.6) {
        if (topic === 'basics') recommendedLessons.push('1-dars: Kvadrat funksiya nima?');
        if (topic === 'vertex') recommendedLessons.push('6-dars: Parabolani 7 qadamda chizish');
        if (topic === 'shift') recommendedLessons.push('4-dars: O\'qlar bo\'ylab siljishlar');
        if (topic === 'discriminant') recommendedLessons.push('6-dars: Ildizlar va diskriminant');
        if (topic === 'intervals') recommendedLessons.push('8-dars: O\'sish va kamayish oraliqlari');
        if (topic === 'domain_range') recommendedLessons.push('7-dars: Aniqlanish va qiymatlar sohasi');
        if (topic === 'parity') recommendedLessons.push('9-dars: Juft va toq funksiyalar');
        if (topic === 'applications') recommendedLessons.push('11-dars: Amaliy hayotiy masalalar');
      }
    });

    const resultObj: ExamResult = {
      score: correctCount,
      total: examQuestions.length,
      percentage,
      grade,
      date: new Date().toLocaleDateString(),
      topicBreakdown,
      recommendedLessons: Array.from(new Set(recommendedLessons)),
    };

    setExamResult(resultObj);
    saveExamResult(resultObj);
    addXP(correctCount * 15 + (grade >= 4 ? 100 : 30));
    setExamState('result');

    if (grade >= 4) {
      playWinFanfare();
      fireConfetti(0.5, 0.4, 80);
    } else {
      playSuccessSound();
    }
  };

  const minutes = Math.floor(timeLeftSec / 60);
  const seconds = timeLeftSec % 60;
  const currentQ = examQuestions[currentIdx];

  return (
    <div className="space-y-6">
      
      {/* Intro State */}
      {examState === 'intro' && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs text-center max-w-xl mx-auto space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto text-3xl shadow-lg">
            <Award className="w-8 h-8" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {t.examTitle}
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {t.examTimeNote}
          </p>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-600 dark:text-sky-400">⏱ Vaqt:</span> 30 daqiqa (ixtiyoriy tezlikda)
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-600 dark:text-sky-400">📊 Baholash:</span> 5 ballik rasmiy baholash mezoni
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sky-600 dark:text-sky-400">📜 Sertifikat:</span> Natijaga qarab chop etiladigan diplom beriladi
            </div>
          </div>

          <button
            onClick={startExam}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-extrabold text-base shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
          >
            {t.startExam}
          </button>
        </div>
      )}

      {/* Active Exam State */}
      {examState === 'testing' && (
        <div className="space-y-4">
          
          {/* Status Bar */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                Savol {currentIdx + 1} / {examQuestions.length}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-xl">
              <Clock className="w-4 h-4" />
              <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
            </div>

            <button
              onClick={finishExam}
              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-all"
            >
              {t.finishExam}
            </button>
          </div>

          {/* Question Palette (1 to 25 buttons) */}
          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-x-auto scrollbar-thin">
            <div className="flex gap-1.5 min-w-max">
              {examQuestions.map((_, i) => {
                const isAnswered = answers[i] !== undefined && answers[i] !== '';
                const isCurrent = currentIdx === i;
                const isFl = flagged[i];

                return (
                  <button
                    key={i}
                    onClick={() => {
                      playClickSound();
                      setCurrentIdx(i);
                    }}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all relative ${
                      isCurrent
                        ? 'bg-sky-500 text-white shadow-sm ring-2 ring-sky-300'
                        : isAnswered
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {i + 1}
                    {isFl && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Question View */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Mavzu: {currentQ.topic}
              </span>
              <button
                onClick={() => toggleFlag(currentIdx)}
                className={`text-xs font-semibold px-2 py-1 rounded-lg border ${
                  flagged[currentIdx] ? 'bg-amber-50 border-amber-400 text-amber-700' : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                🚩 Belgilab qo'yish
              </button>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {currentQ.prompt[language]}
            </h3>

            {/* Multiple Choice Format */}
            {currentQ.type === 'choice' && currentQ.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {currentQ.options.map((opt, i) => {
                  const selected = answers[currentIdx] === String(i);
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectAnswer(String(i))}
                      className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm font-semibold transition-all ${
                        selected
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300 font-bold shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      {opt[language]}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Numeric Format */}
            {currentQ.type === 'number' && (
              <div className="pt-2">
                <input
                  type="text"
                  value={answers[currentIdx] || ''}
                  onChange={(e) => handleSelectAnswer(e.target.value)}
                  placeholder="Javobni kiriting (masalan: 5 yoki -2 yoki 0.5)..."
                  className="w-full sm:w-80 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold outline-none focus:border-sky-500"
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Oldingi</span>
              </button>

              <button
                onClick={() => {
                  if (currentIdx + 1 >= examQuestions.length) {
                    finishExam();
                  } else {
                    setCurrentIdx(i => i + 1);
                  }
                }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md transition-colors"
              >
                <span>{currentIdx + 1 >= examQuestions.length ? 'Imtihonni yakunlash' : 'Keyingi'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result State & Printable Certificate */}
      {examState === 'result' && examResult && (
        <div className="space-y-6">
          
          {/* Printable Certificate Area */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-sky-50 border-4 border-amber-400 text-slate-900 shadow-2xl relative overflow-hidden print-only">
            
            {/* Certificate Header Stamp */}
            <div className="flex flex-col items-center text-center space-y-2 mb-6">
              <div className="w-16 h-16 rounded-full bg-amber-500 text-white flex items-center justify-center text-3xl font-extrabold shadow-md">
                ★
              </div>
              <span className="text-xs uppercase tracking-widest font-extrabold text-amber-700">
                Rasmiy Bilim Sertifikati
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900">
                MUVAFFAQINOMA
              </h2>
              <p className="text-xs text-slate-500">
                Ushbu sertifikat algebra kursi bo'yicha mustaqil topshirilgan imtihon asosida beriladi
              </p>
            </div>

            {/* Recipient Info */}
            <div className="text-center space-y-3 my-6 py-4 border-y border-amber-200">
              <span className="text-xs text-slate-500 block">Taqdirlanadi:</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-indigo-700 tracking-tight">
                {profile.name}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
                9-sinf algebra kursi: <strong>"Kvadrat funksiya, grafiklar, oraliqlar va juft/toqlik"</strong> bo'limi bo'yicha yakuniy imtihonni muvaffaqiyatli yakunladi.
              </p>
            </div>

            {/* Score & Grade Seal */}
            <div className="flex items-center justify-around text-center my-6">
              <div>
                <span className="text-xs text-slate-500 block">To'plangan ball</span>
                <strong className="text-xl font-bold text-sky-600">{examResult.score} / {examResult.total}</strong>
                <span className="text-xs block text-slate-400">({examResult.percentage}%)</span>
              </div>

              <div className="w-20 h-20 rounded-full border-4 border-amber-500 flex flex-col items-center justify-center bg-amber-100 shadow-inner">
                <span className="text-[10px] font-bold text-amber-800">BAHO</span>
                <strong className="text-3xl font-black text-amber-900 leading-none">{examResult.grade}</strong>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Sana</span>
                <strong className="text-sm font-bold text-slate-800">{examResult.date}</strong>
                <span className="text-xs block text-emerald-600 font-semibold">Tasdiqlangan ✓</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-center pt-6 text-xs text-slate-500 border-t border-amber-100">
              <div>
                <div className="font-mono text-indigo-600 font-bold">ParabolaMaster Portal</div>
                <span>Avtomatlashtirilgan baholash tizimi</span>
              </div>
              <div className="text-right">
                <div className="italic font-serif text-slate-700">Parabolik AI & O'qituvchi</div>
                <span>Imzo va muhr</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 no-print">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printCertificate}</span>
            </button>

            <button
              onClick={startExam}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Imtihonni qaytadan topshirish</span>
            </button>
          </div>

          {/* Topic-by-topic diagnostic breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-4 no-print">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              {t.strengthsWeaknesses}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(examResult.topicBreakdown).map(([topic, stat]) => {
                const pct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
                return (
                  <div key={topic} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                    <div className="flex justify-between font-bold">
                      <span className="capitalize">{topic.replace('_', ' ')}</span>
                      <span className={pct >= 70 ? 'text-emerald-500' : 'text-rose-500'}>
                        {stat.correct} / {stat.total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${pct >= 70 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommendations */}
            {examResult.recommendedLessons.length > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs space-y-2">
                <span className="font-bold text-amber-800 dark:text-amber-300 block">
                  {t.recommendedLessons}
                </span>
                <ul className="list-disc list-inside space-y-1 text-amber-900 dark:text-amber-200">
                  {examResult.recommendedLessons.map((les, i) => (
                    <li key={i}>{les}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
