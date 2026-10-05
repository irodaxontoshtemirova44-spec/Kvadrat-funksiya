import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { GraphCanvas } from './GraphCanvas';
import { Mascot } from './Mascot';
import { QuadraticParams } from '../types';
import { analyzeParabola, formatNum } from '../utils/math';
import { playClickSound, playSuccessSound, playErrorSound } from '../utils/audio';
import { 
  CheckCircle, ArrowLeft, ArrowRight, Lightbulb, 
  HelpCircle, ChevronRight, Check
} from 'lucide-react';

interface LessonData {
  id: string;
  icon: string;
  caseTitle: { uz: string; ru: string; en: string };
  caseProblem: { uz: string; ru: string; en: string };
  intro: { uz: string; ru: string; en: string };
  theoryPoints: { uz: string[]; ru: string[]; en: string[] };
  rememberFormula: string;
  rememberText: { uz: string; ru: string; en: string };
  taskQuestion: { uz: string; ru: string; en: string };
  taskType: 'sliders' | 'choice' | 'parity_test' | 'wizard';
  defaultParams: QuadraticParams;
  targetCheck?: (params: QuadraticParams) => boolean;
  choices?: { uz: string; ru: string; en: string }[];
  correctChoiceIndex?: number;
}

export const LearnSection: React.FC = () => {
  const { language, completeLesson, profile } = useApp();
  const t = translations[language];

  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [currentParams, setCurrentParams] = useState<QuadraticParams>({ a: 1, b: 0, c: 0 });
  const [taskFeedback, setTaskFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

  // For Lesson 6 Graphing Wizard
  const [wizardStep, setWizardStep] = useState(1);

  // For Lesson 9 Parity Tester
  const [testInputX, setTestInputX] = useState<number>(2);

  // 11 Comprehensive Lessons
  const lessons: LessonData[] = [
    {
      id: 'lesson_1',
      icon: '🏀',
      caseTitle: {
        uz: "1-Keys: Basketbol to'pining mukammal parvozi",
        ru: "Кейс 1: Идеальный полёт баскетбольного мяча",
        en: "Case 1: The Perfect Basketball Arc",
      },
      caseProblem: {
        uz: "Siz maktab basketbol jamoasi murabbiyisiz. To'p qo'ldan chiqib, havoda ko'tariladi va savat tomon pastga yo'naladi. Nega to'p to'g'ri chiziq bo'yicha emas, aynan silliq egri chiziq bo'yicha uchadi?",
        ru: "Ты тренер баскетбольной команды. Мяч взлетает из рук игрока, достигает высшей точки и опускается в кольцо. Почему траектория мяча — это не прямая, а плавная кривая линия?",
        en: "You are coaching the basketball team. A ball arcs up, reaches a peak, and drops cleanly into the net. Why does it follow a graceful curve rather than a straight line?",
      },
      intro: {
        uz: "Gravitatsiya ta'sirida otilgan har qanday jism havoda parabola bo'yicha harakatlanadi. Bu harakat kvadrat funksiya bilan ifodalanadi!",
        ru: "Под действием гравитации любое брошенное тело движется по параболе. Это описывается квадратичной функцией!",
        en: "Under gravity, any projectile flies along a parabola. This motion is modeled by a quadratic function!",
      },
      theoryPoints: {
        uz: [
          "Kvadrat funksiya: y = ax² + bx + c ko'rinishidagi funksiya (bu yerda a ≠ 0, b va c ixtiyoriy sonlar).",
          "Agar a = 0 bo'lsa, x² yo'qolib, chiziqli funksiya y = bx + c ga aylanadi! Shuning uchun a hech qachon 0 bo'lmasligi shart.",
          "Grafigi — PARABOLA deb ataladigan silliq egri chiziq.",
          "Misollar: y = 2x², y = -x² + 4, y = 3x² - 5x + 1.",
        ],
        ru: [
          "Квадратичная функция — функция вида y = ax² + bx + c, где a ≠ 0, а b и c — любые действительные числа.",
          "Если a = 0, то член x² исчезает и функция превращается в линейную (y = bx + c)! Поэтому обязательное условие: a ≠ 0.",
          "Графиком квадратичной функции является ПАРАБОЛА.",
          "Примеры: y = 2x², y = -x² + 4, y = 3x² - 5x + 1.",
        ],
        en: [
          "A quadratic function has the form y = ax² + bx + c, where a ≠ 0 and b, c are real numbers.",
          "If a = 0, the x² term vanishes, leaving a linear function y = bx + c! Hence, a ≠ 0 is mandatory.",
          "Its graph is a symmetrical U-shaped curve called a PARABOLA.",
          "Examples: y = 2x², y = -x² + 4, y = 3x² - 5x + 1.",
        ],
      },
      rememberFormula: "y = ax² + bx + c  (a ≠ 0)",
      rememberText: {
        uz: "Kvadrat funksiyada har doim x² qatnashishi va uning oldidagi son a ≠ 0 bo'lishi shart!",
        ru: "В квадратичной функции всегда присутствует x² и коэффициент a строго не равен нулю!",
        en: "A quadratic function must contain an x² term with coefficient a ≠ 0!",
      },
      taskQuestion: {
        uz: "Savol: Quyidagi funksiyalardan qaysi biri KVADRAT funksiya hisoblanadi?",
        ru: "Вопрос: Какая из следующих функций является КВАДРАТИЧНОЙ?",
        en: "Question: Which of the following is a QUADRATIC function?",
      },
      taskType: 'choice',
      defaultParams: { a: -0.5, b: 2, c: 1.5 },
      choices: [
        { uz: "y = 3x + 5", ru: "y = 3x + 5", en: "y = 3x + 5" },
        { uz: "y = 2x² - 4x + 1", ru: "y = 2x² - 4x + 1", en: "y = 2x² - 4x + 1" },
        { uz: "y = x³ - 2x", ru: "y = x³ - 2x", en: "y = x³ - 2x" },
        { uz: "y = 5 / x²", ru: "y = 5 / x²", en: "y = 5 / x²" },
      ],
      correctChoiceIndex: 1,
    },

    {
      id: 'lesson_2',
      icon: '⛲',
      caseTitle: {
        uz: "2-Keys: Musiqa favvorasining suv oqimi",
        ru: "Кейс 2: Струя музыкального фонтана",
        en: "Case 2: The Musical Water Fountain",
      },
      caseProblem: {
        uz: "Shahar markazidagi favvora vertikal yuqoriga suv purkaydi. Suv markaziy nuqtadan boshlanib, har ikki tomonga bir xil simmetrik tushadi. Eng sodda parabolani qanday yasash mumkin?",
        ru: "Фонтан бьёт струёй из центра. Водяные капли разлетаются в обе стороны абсолютно симметрично. Как построить базовую параболу?",
        en: "A park fountain shoots water jets upward. The streams curve symmetrically on both sides. How do we plot the foundational parabola?",
      },
      intro: {
        uz: "Eng sodda kvadrat funksiya: y = x² (b = 0 va c = 0 bo'lganda). U barcha qolgan parabolalarning 'otasi' hisoblanadi!",
        ru: "Простейшая квадратичная функция — это y = x² (где b = 0 и c = 0). Она служит основой для всех остальных парабол!",
        en: "The simplest quadratic function is y = x² (where b = 0 and c = 0). It is the parent curve for all parabolas!",
      },
      theoryPoints: {
        uz: [
          "y = x² funksiyasida: x=0 da y=0. Parabola uchi koordinatalar boshi (0, 0) da joylashgan.",
          "Simmetriya o'qi — Oy o'qi (x = 0 to'g'ri chizig'i).",
          "Qiymatlar jadvali: x=-2 bo'lsa y=4; x=-1 da y=1; x=0 da y=0; x=1 da y=1; x=2 da y=4.",
          "Manfiy sonning kvadrati ham musbat bo'lgani uchun grafik hech qachon Oy o'qining pastki qismiga o'tmaydi (y ≥ 0).",
        ],
        ru: [
          "Для y = x²: при x=0 получаем y=0. Вершина параболы находится в начале координат (0, 0).",
          "Ось симметрии — ось ординат Oy (прямая x = 0).",
          "Таблица значений: x=-2 → y=4; x=-1 → y=1; x=0 → y=0; x=1 → y=1; x=2 → y=4.",
          "Так как квадрат любого числа неотрицателен, график лежит не ниже оси Ox (y ≥ 0).",
        ],
        en: [
          "For y = x²: at x=0, y=0. The vertex is at the origin (0, 0).",
          "The axis of symmetry is the y-axis (the line x = 0).",
          "Table of values: x=-2 → y=4; x=-1 → y=1; x=0 → y=0; x=1 → y=1; x=2 → y=4.",
          "Because any real number squared is non-negative, the curve never dips below the x-axis (y ≥ 0).",
        ],
      },
      rememberFormula: "y = x²  (Uchi: (0, 0), Simmetriya o'qi: x = 0)",
      rememberText: {
        uz: "y = x² parabolasi uchi (0; 0) da bo'lib, tarmoqlari yuqoriga qaragan va Oy o'qiga nisbatan simmetrikdir!",
        ru: "Парабола y = x² имеет вершину в точке (0; 0), ветви направлены вверх, и она симметрична относительно оси Oy!",
        en: "The parabola y = x² has its vertex at (0, 0), branches opening upward, symmetrical across the y-axis!",
      },
      taskQuestion: {
        uz: "Topshiriq: Slayderlarni moslab, y = x² asosiy parabolasini hosil qiling (a=1, b=0, c=0).",
        ru: "Задание: Настрой ползунки так, чтобы получилась базовая парабола y = x² (a=1, b=0, c=0).",
        en: "Task: Adjust the sliders to form the parent parabola y = x² (a=1, b=0, c=0).",
      },
      taskType: 'sliders',
      defaultParams: { a: 2, b: 0, c: 0 },
      targetCheck: (p) => Math.abs(p.a - 1) < 0.15 && Math.abs(p.b) < 0.15 && Math.abs(p.c) < 0.15,
    },

    {
      id: 'lesson_3',
      icon: '📡',
      caseTitle: {
        uz: "3-Keys: Sun'iy yo'ldosh antennasining fokuslanishi",
        ru: "Кейс 3: Фокусировка спутниковой антенны",
        en: "Case 3: Satellite Dish Geometry",
      },
      caseProblem: {
        uz: "Aloqa muhandislari parabolik antennaning qiyaligini o'zgartirmoqda. Ba'zan antenna keng va yassi, ba'zan esa tor va chuqur bo'lishi kerak. Bu shaklni qaysi son boshqaradi?",
        ru: "Инженеры связи настраивают антенну: в одних случаях нужна широкая мелкая чаша, в других — узкая и глубокая. Какой параметр за это отвечает?",
        en: "Antenna engineers modify dish curvature: wide and shallow dishes capture broad signals, narrow dishes focus sharp beams. Which parameter controls this?",
      },
      intro: {
        uz: "y = ax² dagi 'a' koeffitsiyenti parabolaning tarmoqlari qayerga qaraganini va uning keng/torligini belgilaydi!",
        ru: "Коэффициент 'a' в формуле y = ax² определяет направление ветвей параболы и степень её сжатия или растяжения!",
        en: "The coefficient 'a' determines both which way the parabola opens and how wide or narrow it appears!",
      },
      theoryPoints: {
        uz: [
          "Agar a > 0 bo'lsa: parabola tarmoqlari YUQORIGA qaragan (chashka kabi). Uchi eng quyi (minimum) nuqta.",
          "Agar a < 0 bo'lsa: parabola tarmoqlari PASTGA qaragan (gumbaz kabi). Uchi eng yuqori (maksimum) nuqta.",
          "Agar |a| > 1 bo'lsa: parabola Oy o'qi bo'yicha cho'ziladi (torayadi).",
          "Agar 0 < |a| < 1 bo'lsa: parabola yoyilib, kengayadi.",
        ],
        ru: [
          "Если a > 0: ветви направлены ВВЕРХ. Вершина — точка минимума.",
          "Если a < 0: ветви направлены ВНИЗ. Вершина — точка максимума.",
          "Если |a| > 1: парабола растягивается вдоль оси Oy (становится уже).",
          "Если 0 < |a| < 1: парабола сжимается к оси Ox (становится шире).",
        ],
        en: [
          "If a > 0: branches open UPWARD. The vertex is the minimum point.",
          "If a < 0: branches open DOWNWARD. The vertex is the maximum point.",
          "If |a| > 1: the curve stretches vertically (becomes narrower/steeper).",
          "If 0 < |a| < 1: the curve compresses vertically (becomes wider/flatter).",
        ],
      },
      rememberFormula: "a > 0 ⟹ Yuqoriga (min) | a < 0 ⟹ Pastga (max)",
      rememberText: {
        uz: "a ning ishorasi yo'nalishni, moduli |a| esa parabolaning qanchalik tik yoki kengligini ko'rsatadi!",
        ru: "Знак 'a' задаёт направление ветвей, а модуль |a| — ширину и крутизну параболы!",
        en: "The sign of 'a' dictates direction, while |a| dictates whether it is narrow or wide!",
      },
      taskQuestion: {
        uz: "Topshiriq: Slayderda a ning qiymatini manfiy qiling (a = -2) va tarmoqlar pastga qaraganini ko'ring!",
        ru: "Задание: Установи значение a = -2 и убедись, что ветви параболы направлены вниз!",
        en: "Task: Set slider value to a = -2 and verify that the parabola branches point downward!",
      },
      taskType: 'sliders',
      defaultParams: { a: 1, b: 0, c: 0 },
      targetCheck: (p) => Math.abs(p.a - (-2)) < 0.25,
    },

    {
      id: 'lesson_4',
      icon: '🌉',
      caseTitle: {
        uz: "4-Keys: Daryo ustidagi kamar ko'prikni siljitish",
        ru: "Кейс 4: Сдвиг арочного моста через реку",
        en: "Case 4: Shifting a Bridge Arch",
      },
      caseProblem: {
        uz: "Ko'prik loyihalashtirilganda, uning kamari daryo o'zaniga mos holda yuqoriga yoki o'ngga-chapga siljitilishi kerak. Formulaga qanday sonlar qo'shiladi?",
        ru: "При строительстве моста параболическую арку нужно сместить выше над водой или сдвинуть к правому берегу. Как это записать формулой?",
        en: "To build a suspension bridge arch, we must elevate the apex or slide it sideways along the riverbank. What numbers do this in the formula?",
      },
      intro: {
        uz: "y = ax² + n formulasi parabolani Oy o'qi bo'ylab n birlikka siljitadi. y = a(x - m)² esa uni Ox o'qi bo'ylab m birlikka siljitadi!",
        ru: "Формула y = ax² + n сдвигает параболу по вертикали на n. А формула y = a(x - m)² сдвигает её по горизонтали на m!",
        en: "The equation y = ax² + n shifts the curve vertically by n units. While y = a(x - m)² shifts it horizontally by m units!",
      },
      theoryPoints: {
        uz: [
          "y = ax² + n: agar n > 0 bo'lsa, n birlik YUQORIGA; n < 0 bo'lsa, |n| birlik PASTGA siljiydi. Uchi (0, n) da bo'ladi.",
          "y = a(x - m)²: agar m > 0 bo'lsa, m birlik O'NGGA; m < 0 bo'lsa, |m| birlik CHAPGA siljiydi. Uchi (m, 0) da bo'ladi.",
          "DIQQAT: (x - 3)² bo'lsa, o'ngga +3 ga siljiydi (ishora teskari o'qiladi!).",
        ],
        ru: [
          "y = ax² + n: при n > 0 сдвиг ВВЕРХ на n; при n < 0 сдвиг ВНИЗ на |n|. Вершина в точке (0; n).",
          "y = a(x - m)²: при m > 0 сдвиг ВПРАВО на m; при m < 0 сдвиг ВЛЕВО на |m|. Вершина в точке (m; 0).",
          "ВНИМАНИЕ: выражение (x - 3)² сдвигает параболу вправо на +3 (знак противоположный!).",
        ],
        en: [
          "y = ax² + n: if n > 0, shifts UP by n; if n < 0, shifts DOWN by |n|. Vertex at (0, n).",
          "y = a(x - m)²: if m > 0, shifts RIGHT by m; if m < 0, shifts LEFT by |m|. Vertex at (m, 0).",
          "WATCH OUT: (x - 3)² shifts RIGHT by +3 (notice the minus sign inside parentheses!).",
        ],
      },
      rememberFormula: "y = ax² + n (vertikal) | y = a(x - m)² (gorizontal)",
      rememberText: {
        uz: "+n tashqarida bo'lsa vertikal siljish, qavs ichidagi (x - m) esa gorizontal siljishni beradi!",
        ru: "+n снаружи дает вертикальный сдвиг, а (x - m) в скобках — горизонтальный сдвиг!",
        en: "+n on the outside gives vertical shift, while (x - m) inside brackets gives horizontal shift!",
      },
      taskQuestion: {
        uz: "Topshiriq: Uchi (0, 3) nuqtada bo'lgan y = x² + 3 grafigini hosil qiling (a=1, b=0, c=3).",
        ru: "Задание: Построй график y = x² + 3 с вершиной в точке (0, 3) (a=1, b=0, c=3).",
        en: "Task: Plot y = x² + 3 with vertex at (0, 3) (a=1, b=0, c=3).",
      },
      taskType: 'sliders',
      defaultParams: { a: 1, b: 0, c: 0 },
      targetCheck: (p) => Math.abs(p.a - 1) < 0.2 && Math.abs(p.b) < 0.2 && Math.abs(p.c - 3) < 0.3,
    },

    {
      id: 'lesson_5',
      icon: '🛸',
      caseTitle: {
        uz: "5-Keys: Dronning to'siqlarni aylanib o'tish traektoriyasi",
        ru: "Кейс 5: Траектория дрона в обход препятствий",
        en: "Case 5: Drone Obstacle Avoidance Trajectory",
      },
      caseProblem: {
        uz: "Avtonom dron eng chuqur pastlikka (2; -3) nuqtasiga sho'ng'ib, yana yuqoriga ko'tariladi. Bu harakatni cho'qqi ko'rinishi (kanonik ko'rinish) orqali darhol yozish mumkinmi?",
        ru: "Дрон ныряет в ущелье с минимальной точкой (2; -3) и взлетает. Как моментально записать уравнение через вершину?",
        en: "A delivery drone dips into a valley with apex at (2, -3) and climbs back up. How do we write this instantly in vertex form?",
      },
      intro: {
        uz: "Ikkala siljishni birlashtirsak: y = a(x - m)² + n hosil bo'ladi. Bu ko'rinishda parabola uchi (m; n) nuqtada ekani darhol ko'rinadi!",
        ru: "Объединив сдвиги, получаем канонический вид: y = a(x - m)² + n. Координаты вершины (m; n) видны сразу!",
        en: "Combining both shifts gives vertex form: y = a(x - m)² + n. The vertex (m, n) is visible at a single glance!",
      },
      theoryPoints: {
        uz: [
          "Kanonik (cho'qqi) ko'rinish: y = a(x - m)² + n.",
          "Uchining koordinatalari: x0 = m, y0 = n.",
          "Simmetriya o'qi tenglamasi: x = m.",
          "To'la kvadratni ajratish: y = ax² + bx + c ni bu ko'rinishga keltirish orqali parabola uchi oson topiladi.",
        ],
        ru: [
          "Канонический вид (через вершину): y = a(x - m)² + n.",
          "Координаты вершины: x0 = m, y0 = n.",
          "Уравнение оси симметрии: x = m.",
          "Выделение полного квадрата позволяет перевести любой вид ax² + bx + c в канонический.",
        ],
        en: [
          "Vertex form: y = a(x - m)² + n.",
          "Vertex coordinates: x0 = m, y0 = n.",
          "Axis of symmetry: x = m.",
          "Completing the square converts standard form ax² + bx + c into vertex form.",
        ],
      },
      rememberFormula: "y = a(x - m)² + n ⟹ Uchi V(m; n)",
      rememberText: {
        uz: "Kanonik ko'rinishda hech narsani hisoblamay, parabola uchi (m; n) ekanini darhol aytish mumkin!",
        ru: "В каноническом виде вершина (m; n) определяется мгновенно без вычислений!",
        en: "In vertex form, you can read the vertex (m, n) directly without doing any extra calculations!",
      },
      taskQuestion: {
        uz: "Savol: y = 2(x - 4)² + 5 funksiya grafigining uchi qaysi nuqtada joylashgan?",
        ru: "Вопрос: В какой точке находится вершина параболы y = 2(x - 4)² + 5?",
        en: "Question: Where is the vertex of the parabola y = 2(x - 4)² + 5 located?",
      },
      taskType: 'choice',
      defaultParams: { a: 2, b: -16, c: 37 },
      choices: [
        { uz: "(4; 5)", ru: "(4; 5)", en: "(4; 5)" },
        { uz: "(-4; 5)", ru: "(-4; 5)", en: "(-4; 5)" },
        { uz: "(4; -5)", ru: "(4; -5)", en: "(4; -5)" },
        { uz: "(2; 5)", ru: "(2; 5)", en: "(2; 5)" },
      ],
      correctChoiceIndex: 0,
    },

    {
      id: 'lesson_6',
      icon: '🧙‍♂️',
      caseTitle: {
        uz: "6-Keys: Sehrgar Ko'rsatmasi - Parabolani 7 qadamda chizish",
        ru: "Кейс 6: Мастер Графиков — Построение параболы за 7 шагов",
        en: "Case 6: Graphing Wizard — Plotting a Parabola in 7 Steps",
      },
      caseProblem: {
        uz: "y = x² - 4x + 3 berilgan. Uni xato qilmasdan aniq chizish uchun qanday tartibda harakat qilish kerak?",
        ru: "Дано уравнение y = x² - 4x + 3. Каков надёжный алгоритм, чтобы построить график безупречно точно?",
        en: "Given y = x² - 4x + 3, what is the foolproof 7-step sequence to construct its graph perfectly?",
      },
      intro: {
        uz: "Kvadrat funksiya grafigini chizishning professional 7 qadamli algoritmi mavjud. Har bir qadamni tekshiring!",
        ru: "Существует профессиональный 7-шаговый алгоритм построения любой параболы. Пройдём его шаг за шагом!",
        en: "There is an authoritative 7-step recipe to construct any quadratic graph. Let's walk through it!",
      },
      theoryPoints: {
        uz: [
          "1-qadam: Tarmoqlar yo'nalishi (a ning ishorasi: a=1 > 0 bo'lsa yuqoriga).",
          "2-qadam: Parabola uchi x0 = -b / (2a) = -(-4)/(2*1) = 2; y0 = 2² - 4*2 + 3 = -1. Uchi (2; -1).",
          "3-qadam: Simmetriya o'qi x = x0 (x = 2 chizig'i).",
          "4-qadam: Oy o'qi bilan kesishish nuqtasi (0; c) = (0; 3).",
          "5-qadam: Ox o'qi bilan kesishish nuqtalari (ildizlar): D = b² - 4ac = 16 - 12 = 4 > 0. x1 = 1, x2 = 3.",
          "6-qadam: Simmetrik qo'shimcha nuqtalar (masalan, x=4 da y=3).",
          "7-qadam: Nuqtalarni silliq egri chiziq bilan tutashtirish.",
        ],
        ru: [
          "Шаг 1: Направление ветвей (знак a: a=1 > 0 — вверх).",
          "Шаг 2: Вершина параболы x0 = -b / (2a) = 2; y0 = 2² - 4·2 + 3 = -1. Вершина: (2; -1).",
          "Шаг 3: Ось симметрии x = x0 (прямая x = 2).",
          "Шаг 4: Пересечение с осью Oy: точка (0; c) = (0; 3).",
          "Шаг 5: Корни (пересечение с Ox): D = 16 - 12 = 4. Корни: x1 = 1, x2 = 3.",
          "Шаг 6: Дополнительные симметричные точки.",
          "Шаг 7: Плавное соединение точек параболы.",
        ],
        en: [
          "Step 1: Branch direction (sign of a: a=1 > 0 means opens up).",
          "Step 2: Vertex x0 = -b/(2a) = 2; y0 = 2² - 4(2) + 3 = -1. Vertex: (2, -1).",
          "Step 3: Axis of symmetry: line x = 2.",
          "Step 4: Y-intercept: point (0, c) = (0, 3).",
          "Step 5: Zeros via Discriminant: D = 16 - 12 = 4. Roots: x1 = 1, x2 = 3.",
          "Step 6: Additional symmetrical points.",
          "Step 7: Draw the smooth parabolic curve.",
        ],
      },
      rememberFormula: "x0 = -b / (2a),  y0 = f(x0),  D = b² - 4ac",
      rememberText: {
        uz: "Uchining absissasi x0 = -b/(2a) formulasi — butun kvadrat funksiyaning eng muhim kalitidir!",
        ru: "Формула абсциссы вершины x0 = -b/(2a) — главный ключ ко всем свойствам параболы!",
        en: "The vertex formula x0 = -b/(2a) is the single most vital key in the entire quadratic toolkit!",
      },
      taskQuestion: {
        uz: "Interaktiv Usta: Bosqichma-bosqich ko'rsatuvchini bosing va grafikdagi har bir elementni o'rganing!",
        ru: "Интерактивный Мастер: Переключай шаги и наблюдай за появлением элементов параболы!",
        en: "Interactive Wizard: Step through the sequence to see each parabola landmark appear!",
      },
      taskType: 'wizard',
      defaultParams: { a: 1, b: -4, c: 3 },
    },

    {
      id: 'lesson_7',
      icon: '🎢',
      caseTitle: {
        uz: "7-Keys: Amerikacha tepaliklar (Rollercoaster) balandligi",
        ru: "Кейс 7: Высотные пределы американских горок",
        en: "Case 7: Rollercoaster Elevation Limits",
      },
      caseProblem: {
        uz: "Attraksion vagonchasi qanday gorizontal masofada harakatlanishi mumkin va uning balandligi qaysi chegaralarda o'zgaradi?",
        ru: "В каких горизонтальных пределах может ехать тележка и в каком диапазоне высот она оказывается?",
        en: "Over what horizontal ground can the rollercoaster train travel, and between what lowest and highest elevations does it operate?",
      },
      intro: {
        uz: "Aniqlanish sohasi D(f) — argument x qabul qilishi mumkin bo'lgan barcha qiymatlar. Qiymatlar sohasi E(f) — funksiya y ning qiymatlari!",
        ru: "Область определения D(f) — это все значения x. Область значений E(f) — это все значения, которые принимает y!",
        en: "Domain D(f) is all possible x inputs. Range E(f) is the complete set of resulting y outputs!",
      },
      theoryPoints: {
        uz: [
          "Kvadrat funksiya uchun aniqlanish sohasi har doim BARCHA HAQIQIY SONLAR: D(f) = (-∞; +∞). x o'rniga istalgan sonni qo'yish mumkin.",
          "Qiymatlar sohasi E(f) esa parabola uchiga bog'liq:",
          "Agar a > 0 bo'lsa (tarmoqlar yuqoriga): eng kichik qiymat y0 bo'lib, E(f) = [y0; +∞).",
          "Agar a < 0 bo'lsa (tarmoqlar pastga): eng katta qiymat y0 bo'lib, E(f) = (-∞; y0].",
        ],
        ru: [
          "Область определения квадратичной функции ВСЕГДА все действительные числа: D(f) = (-∞; +∞).",
          "Область значений E(f) напрямую зависит от вершины:",
          "Если a > 0 (ветви вверх): наименьшее значение y0, поэтому E(f) = [y0; +∞).",
          "Если a < 0 (ветви вниз): наибольшее значение y0, поэтому E(f) = (-∞; y0].",
        ],
        en: [
          "The domain of any quadratic function is ALWAYS all real numbers: D(f) = (-∞, +∞).",
          "The range E(f) depends directly on the vertex y0:",
          "If a > 0 (opens up): minimum value is y0, so E(f) = [y0, +∞).",
          "If a < 0 (opens down): maximum value is y0, so E(f) = (-∞, y0].",
        ],
      },
      rememberFormula: "D(f) = (-∞; +∞) | a > 0: E(f) = [y0; +∞) | a < 0: E(f) = (-∞; y0]",
      rememberText: {
        uz: "Aniqlanish sohasi har doim cheksiz (-∞; +∞), qiymatlar sohasi esa parabola uchi y0 bilan chegaralangan!",
        ru: "Область определения всегда (-∞; +∞), а область значений ограничена вершиной y0!",
        en: "Domain is always unrestricted (-∞, +∞), while range is bounded by vertex y0!",
      },
      taskQuestion: {
        uz: "Savol: y = x² - 2 funksiyaning qiymatlar sohasi qanday?",
        ru: "Вопрос: Какова область значений функции y = x² - 2?",
        en: "Question: What is the range of y = x² - 2?",
      },
      taskType: 'choice',
      defaultParams: { a: 1, b: 0, c: -2 },
      choices: [
        { uz: "[-2; +∞)", ru: "[-2; +∞)", en: "[-2; +∞)" },
        { uz: "(-∞; -2]", ru: "(-∞; -2]", en: "(-∞; -2]" },
        { uz: "(-∞; +∞)", ru: "(-∞; +∞)", en: "(-∞; +∞)" },
        { uz: "[0; +∞)", ru: "[0; +∞)", en: "[0; +∞)" },
      ],
      correctChoiceIndex: 0,
    },

    {
      id: 'lesson_8',
      icon: '📈',
      caseTitle: {
        uz: "8-Keys: Ko'tarilish va tushish - O'sish va kamayish",
        ru: "Кейс 8: Подъём и спуск — Возрастание и убывание",
        en: "Case 8: Uphill and Downhill Intervals",
      },
      caseProblem: {
        uz: "Poyezd tepalikka chiqib, so'ng pastga tushadi. Matematik tilda funksiyaning qayerda o'sishi va qayerda kamayishi qanday yoziladi?",
        ru: "Поезд взбирается на склон, а затем спускается. Как на математическом языке описать промежутки возрастания и убывания?",
        en: "A train powers up an incline, crests the ridge, and rolls down. How do mathematicians define intervals of increase and decrease?",
      },
      intro: {
        uz: "x chapdan o'ngga qarab ortganda: y kattalashsa funksiya O'SUYDI, y kichiklasha borsa funksiya KAMAYADI. Burilish nuqtasi — aynan parabola uchi x0!",
        ru: "При движении слева направо: если график идёт вверх — функция ВОЗРАСТАЕТ, если вниз — УБЫВАЕТ. Точка перелома — абсцисса вершины x0!",
        en: "Moving from left to right: if the curve climbs, the function INCREASES; if it drops, it DECREASES. The turning point is the vertex x0!",
      },
      theoryPoints: {
        uz: [
          "Agar a > 0 bo'lsa (tarmoqlar yuqoriga):",
          "  - (-∞; x0] oraliqda KAMAYADI (chap tarmoq pastga tushadi);",
          "  - [x0; +∞) oraliqda O'SADI (o'ng tarmoq yuqoriga ko'tariladi).",
          "Agar a < 0 bo'lsa (tarmoqlar pastga):",
          "  - (-∞; x0] oraliqda O'SADI (chap tarmoq cho'qqiga ko'tariladi);",
          "  - [x0; +∞) oraliqda KAMAYADI (cho'qqidan pastga qulaydi).",
        ],
        ru: [
          "Если a > 0 (ветви вверх):",
          "  - на (-∞; x0] функция УБЫВАЕТ (спуск к вершине);",
          "  - на [x0; +∞) функция ВОЗРАСТАЕТ (подъём от вершины).",
          "Если a < 0 (ветви вниз):",
          "  - на (-∞; x0] функция ВОЗРАСТАЕТ (подъём к вершине);",
          "  - на [x0; +∞) функция УБЫВАЕТ (спуск от вершины).",
        ],
        en: [
          "If a > 0 (opens up):",
          "  - Decreasing on (-∞, x0] (sliding down to the bottom);",
          "  - Increasing on [x0, +∞) (climbing up from the vertex).",
          "If a < 0 (opens down):",
          "  - Increasing on (-∞, x0] (climbing up to the peak);",
          "  - Decreasing on [x0, +∞) (descending after the peak).",
        ],
      },
      rememberFormula: "Chegara nuqtasi doimo x0 = -b / (2a) !",
      rememberText: {
        uz: "Oraliqlar har doim x o'qi bo'yicha yoziladi va ularni parabola uchi x0 ikkiga ajratadi!",
        ru: "Промежутки всегда указываются по оси x, и границей раздела служит абсцисса вершины x0!",
        en: "Intervals are always measured along the x-axis, separated cleanly by vertex x0!",
      },
      taskQuestion: {
        uz: "Topshiriq: Slayderlarni sozlang va yashil (o'suvchi) hamda qizil (kamayuvchi) qismlarni kuzating!",
        ru: "Задание: Подвигай параметры и проследи за зелёным (возрастающим) и красным (убывающим) участками!",
        en: "Task: Adjust parameters and observe how the green (increasing) and red (decreasing) intervals split!",
      },
      taskType: 'sliders',
      defaultParams: { a: 1, b: -2, c: 0 },
      targetCheck: () => true,
    },

    {
      id: 'lesson_9',
      icon: '🪞',
      caseTitle: {
        uz: "9-Keys: Ko'zgu simmetriyasi - Juft va toq funksiyalar",
        ru: "Кейс 9: Зеркальная симметрия — Чётность и нечётность",
        en: "Case 9: Mirror Symmetry — Even and Odd Functions",
      },
      caseProblem: {
        uz: "Arxitekturadagi ko'zgu akslanishi: qaysi parabolalar Oy o'qiga nisbatan ideal simmetrik bo'ladi va qachon bu simmetriya buziladi?",
        ru: "Зеркальная симметрия в архитектуре: какие параболы идеально симметричны относительно оси Oy, а какие нет?",
        en: "Architectural symmetry: which parabolas reflect perfectly across the y-axis, and when is this balance broken?",
      },
      intro: {
        uz: "Funksiyaning juft yoki toqligi uning grafigi qanday simmetriyaga egaligini bildiradi!",
        ru: "Чётность или нечётность функции указывает на характер симметрии её графика!",
        en: "Even and odd parity tell us about the fundamental symmetry of the function's graph!",
      },
      theoryPoints: {
        uz: [
          "JUFT FUNKSIYA: f(-x) = f(x). Uning grafigi Oy o'qiga nisbatan simmetrik. Parabola uchun bu b = 0 bo'lgandagina ro'y beradi (y = ax² + c).",
          "TOQ FUNKSIYA: f(-x) = -f(x). Uning grafigi koordinatalar boshi (0; 0) ga nisbatan markaziy simmetrik. Kvadrat funksiya hech qachon toq bo'la olmaydi!",
          "NA JUFT, NA TOQ: agar b ≠ 0 bo'lsa, parabola uchi Oy o'qidan chetga siljiydi va simmetriya yo'qoladi.",
        ],
        ru: [
          "ЧЁТНАЯ ФУНКЦИЯ: f(-x) = f(x). График симметричен относительно оси ординат Oy. Для параболы это верно тогда и только тогда, когда b = 0 (y = ax² + c).",
          "НЕЧЁТНАЯ ФУНКЦИЯ: f(-x) = -f(x). Симметрия относительно начала координат (0; 0). Квадратичная функция с a ≠ 0 НЕ МОЖЕТ быть нечётной!",
          "НИ ЧЁТНАЯ, НИ НЕЧЁТНАЯ: если b ≠ 0, вершина смещена с оси Oy, и функция общего вида.",
        ],
        en: [
          "EVEN FUNCTION: f(-x) = f(x). Graph is symmetrical across the y-axis. For quadratics, this happens if and only if b = 0 (y = ax² + c).",
          "ODD FUNCTION: f(-x) = -f(x). Symmetrical with respect to origin (0, 0). A quadratic function (a ≠ 0) can NEVER be odd!",
          "NEITHER: if b ≠ 0, the vertex is displaced off the y-axis, so it is neither even nor odd.",
        ],
      },
      rememberFormula: "b = 0 ⟹ JUFT (Oy simmetriya) | b ≠ 0 ⟹ NA JUFT, NA TOQ",
      rememberText: {
        uz: "Kvadrat funksiya hech qachon toq bo'lmaydi! Agar b = 0 bo'lsa juft, b ≠ 0 bo'lsa na juft na toq!",
        ru: "Квадратичная функция никогда не бывает нечётной! При b = 0 она чётная, при b ≠ 0 — ни та, ни другая!",
        en: "A quadratic function is NEVER odd! If b = 0 it is even; if b ≠ 0 it is neither!",
      },
      taskQuestion: {
        uz: "Interaktiv Sinov: x ning qiymatini kiriting va f(x) bilan f(-x) tengligini solishtiring!",
        ru: "Интерактивный тест: Введи любое x и сравни значения f(x) и f(-x)!",
        en: "Interactive Parity Test: Input any x to evaluate and compare f(x) against f(-x)!",
      },
      taskType: 'parity_test',
      defaultParams: { a: 1, b: 0, c: -3 },
    },

    {
      id: 'lesson_10',
      icon: '☀️',
      caseTitle: {
        uz: "10-Keys: Quyosh batareyasi quvvati va funksiyaning ishorasi",
        ru: "Кейс 10: Мощность солнечной батареи и знаки функции",
        en: "Case 10: Solar Collector Output & Function Sign",
      },
      caseProblem: {
        uz: "Quyosh kollektori kun davomida energiya ishlab chiqaradi. Qachon energiya ijobiy (y > 0) va qachon nolga teng bo'ladi?",
        ru: "Солнечная панель вырабатывает энергию в светлое время суток. В какие промежутки выработка положительна (y > 0)?",
        en: "A solar panel produces net energy during daylight. Over what interval is output positive (y > 0)?",
      },
      intro: {
        uz: "Funksiya qayerda musbat (y > 0) va qayerda manfiy (y < 0) ekanini aniqlash — tengsizliklarni yechishning grafik usulidir!",
        ru: "Определение интервалов, где y > 0 и y < 0 — основа графического решения квадратных неравенств!",
        en: "Identifying where y > 0 and where y < 0 is the foundation for graphical quadratic inequalities!",
      },
      theoryPoints: {
        uz: [
          "y > 0 oraliq: parabolaning Ox o'qidan YUQORIDA joylashgan qismi.",
          "y < 0 oraliq: parabolaning Ox o'qidan PASTDA joylashgan qismi.",
          "Ox o'qi bilan kesishgan nuqtalarda y = 0 bo'ladi (funksiya nollari / ildizlar).",
          "Agar a > 0 va D > 0 bo'lsa: ildizlar orasida y < 0, ildizlardan tashqarida y > 0 bo'ladi.",
        ],
        ru: [
          "Промежутки y > 0: часть параболы, лежащая ВЫШЕ оси Ox.",
          "Промежутки y < 0: часть параболы, лежащая НИЖЕ оси Ox.",
          "В точках пересечения с осью Ox значение y = 0 (нули функции).",
          "При a > 0 и D > 0: между корнями y < 0, а за корнями y > 0.",
        ],
        en: [
          "Intervals where y > 0: the portions of the parabola ABOVE the x-axis.",
          "Intervals where y < 0: the portion of the parabola BELOW the x-axis.",
          "At x-intercepts, y = 0 (the zeros of the function).",
          "When a > 0 and D > 0: between the roots y < 0, outside the roots y > 0.",
        ],
      },
      rememberFormula: "y > 0 (Ox dan yuqorida) | y < 0 (Ox dan pastda)",
      rememberText: {
        uz: "Grafik Ox o'qini qayerda kesib o'tishini bildikmi, funksiyaning ishorasini bir qarashda aytish mumkin!",
        ru: "Зная нули функции и знак a, знаки функции видны мгновенно!",
        en: "Knowing the roots and sign of a allows you to read function signs at a glance!",
      },
      taskQuestion: {
        uz: "Savol: y = x² - 4 funksiya qaysi oraliqda manfiy (y < 0) qiymatlar qabul qiladi? (Ildizlar: -2 va 2)",
        ru: "Вопрос: На каком промежутке функция y = x² - 4 принимает отрицательные значения (y < 0)? (Корни: -2 и 2)",
        en: "Question: On which interval does y = x² - 4 take negative values (y < 0)? (Roots: -2 and 2)",
      },
      taskType: 'choice',
      defaultParams: { a: 1, b: 0, c: -4 },
      choices: [
        { uz: "(-2; 2)", ru: "(-2; 2)", en: "(-2; 2)" },
        { uz: "(-∞; -2)", ru: "(-∞; -2)", en: "(-∞; -2)" },
        { uz: "(2; +∞)", ru: "(2; +∞)", en: "(2; +∞)" },
        { uz: "[-4; 0]", ru: "[-4; 0]", en: "[-4; 0]" },
      ],
      correctChoiceIndex: 0,
    },

    {
      id: 'lesson_11',
      icon: '🏗️',
      caseTitle: {
        uz: "11-Keys: Maktab do'koni daromadini maksimallashtirish",
        ru: "Кейс 11: Максимизация прибыли школьного магазина",
        en: "Case 11: School Shop Profit Optimization",
      },
      caseProblem: {
        uz: "Maktab oshxonasida pirojnaning narxi x so'm bo'lsa, kunlik foyda P(x) = -2x² + 40x - 150 formula bilan ifodalanadi. Maksimal foyda olish uchun narxni qancha qilib belgilash kerak?",
        ru: "Прибыль школьного кафе зависит от цены товара x по формуле P(x) = -2x² + 40x - 150. Какую цену установить для максимальной прибыли?",
        en: "A student enterprise finds its daily profit depends on price x via P(x) = -2x² + 40x - 150. What price yields peak profit?",
      },
      intro: {
        uz: "Kvadrat funksiya iqtisodiyotda, fizikada va muhandislikda eng katta yoki eng kichik qiymatni (ekstremumni) topish uchun keng qo'llaniladi!",
        ru: "Квадратичная функция применяется в экономике, физике и инженерии для нахождения оптимальных значений (максимума и минимума)!",
        en: "Quadratic functions are universally used across economics, engineering, and physics to solve optimization problems!",
      },
      theoryPoints: {
        uz: [
          "Foyda P(x) = -2x² + 40x - 150 dagi a = -2 < 0 bo'lgani uchun parabola tarmoqlari pastga qaragan.",
          "Demak, parabola uchi eng yuqori nuqta (maksimum) bo'ladi.",
          "Maksimal nuqta x0 = -b / (2a) = -40 / (2 * (-2)) = -40 / -4 = 10 so'm!",
          "Maksimal foyda esa: P(10) = -2(100) + 40(10) - 150 = -200 + 400 - 150 = 50 so'm bo'ladi.",
        ],
        ru: [
          "В функции прибыли P(x) = -2x² + 40x - 150 коэффициент a = -2 < 0, ветви направлены вниз.",
          "Значит, вершина параболы является точкой максимума.",
          "Оптимальная цена: x0 = -b / (2a) = -40 / (2 · (-2)) = 10!",
          "Максимальная прибыль: P(10) = -2(100) + 400 - 150 = 50 денежных единиц.",
        ],
        en: [
          "In profit function P(x) = -2x² + 40x - 150, coefficient a = -2 < 0, so branches open downward.",
          "Hence, the vertex represents the global maximum.",
          "Optimal price: x0 = -b / (2a) = -40 / (2 * (-2)) = 10 units!",
          "Peak profit: P(10) = -2(100) + 400 - 150 = 50 profit units.",
        ],
      },
      rememberFormula: "Optimal yechim har doim x0 = -b / (2a) da erishiladi!",
      rememberText: {
        uz: "Maksimum yoki minimum talab qilingan har qanday amaliy masalada uchi x0 = -b/(2a) ni hisoblang!",
        ru: "В любой задаче на максимум или минимум достаточно найти вершину x0 = -b/(2a)!",
        en: "For any quadratic word problem asking for maximum or minimum, calculate vertex x0 = -b/(2a)!",
      },
      taskQuestion: {
        uz: "Savol: To'p h(t) = -5t² + 20t balandlikka otildi. To'p necha soniyadan so'ng eng yuqori balandlikka erishadi?",
        ru: "Вопрос: Мяч летит по закону h(t) = -5t² + 20t. Через сколько секунд он достигнет максимальной высоты?",
        en: "Question: A ball trajectory is h(t) = -5t² + 20t. After how many seconds does it reach peak height?",
      },
      taskType: 'choice',
      defaultParams: { a: -5, b: 20, c: 0 },
      choices: [
        { uz: "2 soniya (t = -20 / (2 * -5) = 2)", ru: "2 секунды (t = 2)", en: "2 seconds (t = 2)" },
        { uz: "4 soniya", ru: "4 секунды", en: "4 seconds" },
        { uz: "5 soniya", ru: "5 секунд", en: "5 seconds" },
        { uz: "1 soniya", ru: "1 секунда", en: "1 second" },
      ],
      correctChoiceIndex: 0,
    },
  ];

  const currentLesson = lessons[activeLessonIndex];

  // Set initial params on lesson change
  const selectLesson = (idx: number) => {
    playClickSound();
    setActiveLessonIndex(idx);
    setCurrentParams(lessons[idx].defaultParams);
    setTaskFeedback('idle');
    setSelectedChoice(null);
    setWizardStep(1);
  };

  const handleCheckAnswer = () => {
    if (currentLesson.taskType === 'choice') {
      if (selectedChoice === null) return;
      if (selectedChoice === currentLesson.correctChoiceIndex) {
        setTaskFeedback('correct');
        playSuccessSound();
        completeLesson(currentLesson.id);
      } else {
        setTaskFeedback('wrong');
        playErrorSound();
      }
    } else if (currentLesson.taskType === 'sliders') {
      if (currentLesson.targetCheck && currentLesson.targetCheck(currentParams)) {
        setTaskFeedback('correct');
        playSuccessSound();
        completeLesson(currentLesson.id);
      } else {
        setTaskFeedback('wrong');
        playErrorSound();
      }
    } else {
      setTaskFeedback('correct');
      playSuccessSound();
      completeLesson(currentLesson.id);
    }
  };

  const isCompleted = profile.completedLessons.includes(currentLesson.id);

  return (
    <div className="space-y-6">
      
      {/* Lesson Selector Carousel / Tabs */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-2 min-w-max">
          {lessons.map((les, i) => {
            const active = i === activeLessonIndex;
            const completed = profile.completedLessons.includes(les.id);
            return (
              <button
                key={les.id}
                onClick={() => selectLesson(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  active
                    ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                    : completed
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <span>{les.icon}</span>
                <span>{les.id.replace('lesson_', '')}-dars</span>
                {completed && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Lesson Content Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Real-Life Case & Theory */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Real-Life Case Story Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50/80 via-white to-sky-50/80 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-800/80 border border-indigo-100 dark:border-slate-700/80 shadow-xs">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">
              <span className="text-xl">{currentLesson.icon}</span>
              <span>{currentLesson.caseTitle[language]}</span>
            </div>
            
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed italic border-l-3 border-indigo-500 pl-3 my-3">
              "{currentLesson.caseProblem[language]}"
            </p>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {currentLesson.intro[language]}
            </p>
          </div>

          {/* Theoretical Points */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Nazariy Asoslar</span>
            </h3>

            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {currentLesson.theoryPoints[language].map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 flex-shrink-0" />
                  <span className="leading-snug">{pt}</span>
                </li>
              ))}
            </ul>

            {/* "Remember!" Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 mt-4">
              <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300 text-xs mb-1">
                <span>⭐ {t.rememberBox}</span>
              </div>
              <div className="font-mono font-bold text-xs sm:text-sm text-amber-900 dark:text-amber-200 bg-amber-100/60 dark:bg-amber-900/60 px-2 py-1 rounded-lg inline-block mb-1">
                {currentLesson.rememberFormula}
              </div>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 leading-tight">
                {currentLesson.rememberText[language]}
              </p>
            </div>
          </div>

          {/* Interactive Task / Check Box */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-sky-500" />
                <span>{t.interactiveTask}</span>
              </h4>
              {isCompleted && (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.levelCompleted}</span>
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
              {currentLesson.taskQuestion[language]}
            </p>

            {/* Choice format */}
            {currentLesson.taskType === 'choice' && currentLesson.choices && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {currentLesson.choices.map((ch, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      playClickSound();
                      setSelectedChoice(idx);
                      setTaskFeedback('idle');
                    }}
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                      selectedChoice === idx
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-500 text-sky-700 dark:text-sky-300'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {ch[language]}
                  </button>
                ))}
              </div>
            )}

            {/* Wizard format for Lesson 6 */}
            {currentLesson.taskType === 'wizard' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-600 dark:text-sky-400">
                    Qadam {wizardStep} / 7
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setWizardStep(s => Math.max(1, s - 1))}
                      disabled={wizardStep === 1}
                      className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-bold disabled:opacity-40"
                    >
                      ◀
                    </button>
                    <button
                      onClick={() => setWizardStep(s => Math.min(7, s + 1))}
                      disabled={wizardStep === 7}
                      className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 font-bold disabled:opacity-40"
                    >
                      ▶
                    </button>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {currentLesson.theoryPoints[language][wizardStep - 1]}
                </p>
              </div>
            )}

            {/* Parity test format for Lesson 9 */}
            {currentLesson.taskType === 'parity_test' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">x ni tanlang:</span>
                  <input
                    type="number"
                    value={testInputX}
                    onChange={(e) => setTestInputX(parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 bg-white dark:bg-slate-800 border rounded-lg text-center font-bold"
                  />
                </div>
                {(() => {
                  const fx = currentParams.a * testInputX * testInputX + currentParams.b * testInputX + currentParams.c;
                  const fMinusX = currentParams.a * (-testInputX) * (-testInputX) + currentParams.b * (-testInputX) + currentParams.c;
                  const isEqual = Math.abs(fx - fMinusX) < 0.0001;
                  return (
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono">
                        <span>f({testInputX}) = {formatNum(fx)}</span>
                        <span>f(-{testInputX}) = {formatNum(fMinusX)}</span>
                      </div>
                      <div className={`font-bold ${isEqual ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {isEqual ? "f(x) = f(-x) ⟹ Funksiya JUFT!" : "f(x) ≠ f(-x) ⟹ Funksiya juft EMAS!"}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Check Button & Mascot Feedback */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={handleCheckAnswer}
                className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all"
              >
                {t.checkAnswer}
              </button>

              {taskFeedback === 'correct' && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-bounce">
                  🎉 {t.mascotCorrect} (+50 XP)
                </span>
              )}
              {taskFeedback === 'wrong' && (
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  ❌ {t.mascotWrong}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Hands-On Interactive Graph Canvas */}
        <div className="lg:col-span-6 space-y-4">
          <GraphCanvas
            params={currentParams}
            onChangeParams={setCurrentParams}
            showGhostBase={activeLessonIndex === 1 || activeLessonIndex === 3 || activeLessonIndex === 4}
            showVertexHighlight={true}
            showAxisHighlight={wizardStep >= 3}
            showRootsHighlight={wizardStep >= 5}
            showInterceptHighlight={wizardStep >= 4}
            showIntervalsHighlight={activeLessonIndex === 7}
            showSymmetricPair={activeLessonIndex === 8 || wizardStep >= 6}
            height={380}
          />

          {/* Mathematical Properties Readout Bar */}
          {(() => {
            const aInfo = analyzeParabola(currentParams);
            return (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs text-xs space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t.vertex}</span>
                    <strong className="text-slate-800 dark:text-slate-100 font-mono">
                      V({formatNum(aInfo.x0)}; {formatNum(aInfo.y0)})
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t.axisOfSymmetry}</span>
                    <strong className="text-pink-600 dark:text-pink-400 font-mono">
                      x = {formatNum(aInfo.x0)}
                    </strong>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">{t.range}</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-mono">
                      {aInfo.range}
                    </strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700/50">
                  <span>{t.direction}: <strong>{aInfo.direction === 'up' ? t.directionUp : t.directionDown}</strong></span>
                  <span>{t.discriminant}: <strong>D = {formatNum(aInfo.discriminant)}</strong></span>
                </div>
              </div>
            );
          })()}

          {/* Navigation Between Lessons */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => selectLesson(Math.max(0, activeLessonIndex - 1))}
              disabled={activeLessonIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.prevLesson}</span>
            </button>

            <button
              onClick={() => selectLesson(Math.min(lessons.length - 1, activeLessonIndex + 1))}
              disabled={activeLessonIndex === lessons.length - 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs hover:bg-sky-600 disabled:opacity-40 shadow-sm transition-colors"
            >
              <span>{t.nextLesson}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
