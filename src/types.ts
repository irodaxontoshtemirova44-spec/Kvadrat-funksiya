export type Language = 'uz' | 'ru' | 'en';
export type Theme = 'light' | 'dark';

export interface UserProfile {
  name: string;
  avatar: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  unlockedBadges: string[];
  mistakes: MistakeItem[];
  gameScores: Record<string, { highScore: number; stars: number }>;
  quizHistory: QuizAttempt[];
  examResult?: ExamResult;
}

export interface MistakeItem {
  id: string;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  topic: string;
  date: string;
}

export interface QuizAttempt {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  total: number;
  date: string;
}

export interface ExamResult {
  score: number;
  total: number;
  percentage: number;
  grade: number; // 2, 3, 4, 5
  date: string;
  topicBreakdown: Record<string, { correct: number; total: number }>;
  recommendedLessons: string[];
}

export interface Badge {
  id: string;
  icon: string;
  titleKey: string;
  descKey: string;
  condition: (profile: UserProfile) => boolean;
}

export interface QuadraticParams {
  a: number;
  b: number;
  c: number;
}

export interface VertexFormParams {
  a: number;
  m: number; // h = -b/(2a) -> y = a(x - m)^2 + n
  n: number; // k = y0
}

export interface ParabolaAnalysis {
  a: number;
  b: number;
  c: number;
  x0: number; // vertex x
  y0: number; // vertex y
  direction: 'up' | 'down';
  discriminant: number;
  roots: number[];
  yIntercept: number;
  domain: string;
  range: string;
  increasingInterval: string;
  decreasingInterval: string;
  parity: 'even' | 'odd' | 'neither';
  standardFormString: string;
  vertexFormString: string;
}

export type NavTab = 'home' | 'learn' | 'lab' | 'play' | 'quiz' | 'exam' | 'progress';

export interface LessonCase {
  id: string;
  number: number;
  titleKey: string;
  subtitleKey: string;
  storyKey: string;
  icon: string;
  badgeKey: string;
  content: {
    introKey: string;
    theoryPointsKeys: string[];
    formula?: string;
    defaultParams: QuadraticParams;
    taskPromptKey: string;
    taskTargetCheck: (params: QuadraticParams) => boolean;
    taskHintKey: string;
    rememberKey: string;
  };
}

export interface Question {
  id: string;
  topic: 'basics' | 'vertex' | 'shift' | 'discriminant' | 'intervals' | 'domain_range' | 'parity' | 'applications';
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: { uz: string; ru: string; en: string };
  type: 'choice' | 'number' | 'boolean' | 'graph_choice';
  options?: { uz: string; ru: string; en: string }[];
  correctAnswer: string | number; // index or numeric value or string
  tolerance?: number; // for numeric input
  graphParams?: QuadraticParams;
  hint: { uz: string; ru: string; en: string };
  explanation: { uz: string; ru: string; en: string };
}
