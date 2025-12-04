// Math types for Level 1-6 curriculum

export type YearLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type Difficulty = 'easy' | 'medium' | 'hard' | 'challenge';

export type MathTopic =
  // Lv.1-2 (Foundation)
  | 'counting' | 'addition' | 'subtraction'
  // Lv.3-4
  | 'multiplication' | 'division' | 'fractions'
  // Lv.5-6
  | 'decimals' | 'percentages' | 'area_perimeter'
  | 'time' | 'money' | 'patterns';

export interface MathProblem {
  id: string;
  topic: MathTopic;
  yearLevel: YearLevel;
  difficulty: Difficulty;
  question: string;
  answer: number | string;
  acceptableAnswers?: (number | string)[];
  hint?: string;
  explanation?: string;
  visualType?: 'number_line' | 'blocks' | 'pie_chart' | 'fraction_bar' | 'algebra_tiles' | 'grid' | 'clock' | 'rectangle';
  interactiveType?: 'drag_drop' | 'slider' | 'input' | 'multiple_choice' | 'matching';
  options?: string[];
  dragItems?: DragItem[];
  steps?: ProblemStep[];
  numbers?: { num1: number; num2: number; operator: string };
  // Visual content separate from question text (for emojis that shouldn't be read aloud)
  visualContent?: string;
  // For time problems
  clockTime?: { hours: number; minutes: number };
  // For area/perimeter problems
  dimensions?: { length: number; width: number };
}

export interface DragItem {
  id: string;
  content: string;
  value: number | string;
  type: 'number' | 'operator' | 'variable' | 'fraction';
}

export interface ProblemStep {
  description: string;
  formula?: string;
  result?: string;
}

export interface UserProgress {
  yearLevel: YearLevel;
  topic: MathTopic;
  problemsAttempted: number;
  problemsCorrect: number;
  streak: number;
  lastAttempt: Date;
}

export interface SessionStats {
  totalProblems: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  topicsStudied: MathTopic[];
  timeSpent: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Topics organized by level (appropriate for each age group)
export const YEAR_TOPICS: Record<YearLevel, MathTopic[]> = {
  1: ['counting', 'addition', 'subtraction'],
  2: ['addition', 'subtraction', 'counting', 'patterns'],
  3: ['addition', 'subtraction', 'multiplication', 'time'],
  4: ['multiplication', 'division', 'fractions', 'money'],
  5: ['fractions', 'decimals', 'multiplication', 'division', 'area_perimeter'],
  6: ['decimals', 'percentages', 'fractions', 'area_perimeter', 'patterns'],
};

export const TOPIC_NAMES: Record<MathTopic, string> = {
  counting: 'Counting',
  addition: 'Addition',
  subtraction: 'Subtraction',
  multiplication: 'Multiplication',
  division: 'Division',
  fractions: 'Fractions',
  decimals: 'Decimals',
  percentages: 'Percentages',
  area_perimeter: 'Area & Perimeter',
  time: 'Telling Time',
  money: 'Money',
  patterns: 'Patterns',
};

export const YEAR_LEVEL_NAMES: Record<YearLevel, string> = {
  1: 'Lv.1',
  2: 'Lv.2',
  3: 'Lv.3',
  4: 'Lv.4',
  5: 'Lv.5',
  6: 'Lv.6',
};
