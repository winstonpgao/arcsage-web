import { MathProblem, MathTopic, YearLevel, Difficulty, DragItem } from '@/types/math';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Generate problems based on topic, year level, and difficulty
export function generateProblem(
  topic: MathTopic,
  yearLevel: YearLevel,
  difficulty: Difficulty
): MathProblem {
  switch (topic) {
    case 'counting':
      return generateCountingProblem(yearLevel, difficulty);
    case 'addition':
      return generateAdditionProblem(yearLevel, difficulty);
    case 'subtraction':
      return generateSubtractionProblem(yearLevel, difficulty);
    case 'multiplication':
      return generateMultiplicationProblem(yearLevel, difficulty);
    case 'division':
      return generateDivisionProblem(yearLevel, difficulty);
    case 'fractions':
      return generateFractionProblem(yearLevel, difficulty);
    case 'decimals':
      return generateDecimalProblem(yearLevel, difficulty);
    case 'percentages':
      return generatePercentageProblem(yearLevel, difficulty);
    case 'time':
      return generateTimeProblem(yearLevel, difficulty);
    case 'money':
      return generateMoneyProblem(yearLevel, difficulty);
    case 'patterns':
      return generatePatternProblem(yearLevel, difficulty);
    case 'area_perimeter':
      return generateAreaPerimeterProblem(yearLevel, difficulty);
    default:
      return generateAdditionProblem(yearLevel, difficulty);
  }
}

// Get number ranges appropriate for each year level
function getRange(yearLevel: YearLevel, difficulty: Difficulty): { min: number; max: number } {
  // Year 1-6 appropriate ranges
  const yearRanges: Record<YearLevel, Record<Difficulty, { min: number; max: number }>> = {
    1: {
      easy: { min: 1, max: 5 },
      medium: { min: 1, max: 10 },
      hard: { min: 5, max: 15 },
      challenge: { min: 10, max: 20 },
    },
    2: {
      easy: { min: 1, max: 10 },
      medium: { min: 5, max: 20 },
      hard: { min: 10, max: 30 },
      challenge: { min: 15, max: 50 },
    },
    3: {
      easy: { min: 1, max: 20 },
      medium: { min: 10, max: 50 },
      hard: { min: 20, max: 100 },
      challenge: { min: 50, max: 200 },
    },
    4: {
      easy: { min: 10, max: 50 },
      medium: { min: 20, max: 100 },
      hard: { min: 50, max: 200 },
      challenge: { min: 100, max: 500 },
    },
    5: {
      easy: { min: 10, max: 100 },
      medium: { min: 50, max: 200 },
      hard: { min: 100, max: 500 },
      challenge: { min: 200, max: 1000 },
    },
    6: {
      easy: { min: 50, max: 200 },
      medium: { min: 100, max: 500 },
      hard: { min: 200, max: 1000 },
      challenge: { min: 500, max: 2000 },
    },
  };

  return yearRanges[yearLevel][difficulty];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCountingProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  const ranges: Record<Difficulty, { min: number; max: number }> = {
    easy: { min: 1, max: 10 },
    medium: { min: 5, max: 20 },
    hard: { min: 10, max: 50 },
    challenge: { min: 20, max: 100 },
  };

  const range = ranges[difficulty];
  const count = randomInt(range.min, range.max);
  const startNum = randomInt(1, 5);

  // Different types of counting problems
  const types = ['count_objects', 'what_comes_next', 'count_by_twos'];
  const type = types[randomInt(0, yearLevel >= 2 ? 2 : 1)];

  if (type === 'count_objects') {
    // Separate emojis from question so speech doesn't read them
    const emojiObjects = ['🍎', '⭐', '🌟', '🎈', '🐱', '🐶', '🦋', '🌸'];
    const emoji = emojiObjects[Math.floor(Math.random() * emojiObjects.length)];
    const displayCount = Math.min(count, 15);

    return {
      id: generateId(),
      topic: 'counting',
      yearLevel,
      difficulty,
      question: `Count the objects:`,
      visualContent: emoji.repeat(displayCount) + (count > 15 ? ` (+${count - 15} more)` : ''),
      answer: count,
      hint: 'Count each object one by one!',
      explanation: `There are ${count} objects in total.`,
      visualType: 'blocks',
      interactiveType: 'drag_drop',
      numbers: { num1: count, num2: 0, operator: '' },
      steps: [
        { description: 'Count each object', result: `1, 2, 3... ${count}` },
      ],
    };
  } else if (type === 'what_comes_next') {
    return {
      id: generateId(),
      topic: 'counting',
      yearLevel,
      difficulty,
      question: `What number comes after ${count}?`,
      answer: count + 1,
      hint: 'Count one more!',
      explanation: `After ${count} comes ${count + 1}`,
      visualType: 'number_line',
      interactiveType: 'drag_drop',
      numbers: { num1: count, num2: 1, operator: '+' },
      steps: [
        { description: `Start at ${count}`, result: String(count) },
        { description: 'Count one more', result: String(count + 1) },
      ],
    };
  } else {
    // Count by twos
    const sequence = [startNum, startNum + 2, startNum + 4, startNum + 6];
    return {
      id: generateId(),
      topic: 'counting',
      yearLevel,
      difficulty,
      question: `Count by 2s: ${sequence.slice(0, 3).join(', ')}, ?`,
      answer: sequence[3],
      hint: 'Add 2 each time!',
      explanation: `When counting by 2s: ${sequence.join(', ')}`,
      visualType: 'number_line',
      interactiveType: 'drag_drop',
      steps: [
        { description: 'Pattern: add 2 each time' },
        { description: `${sequence[2]} + 2 = ${sequence[3]}`, result: String(sequence[3]) },
      ],
    };
  }
}

function generateAdditionProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  const range = getRange(yearLevel, difficulty);
  const num1 = randomInt(range.min, range.max);
  const num2 = randomInt(range.min, Math.min(range.max, num1 + 20)); // Keep second number reasonable
  const answer = num1 + num2;

  return {
    id: generateId(),
    topic: 'addition',
    yearLevel,
    difficulty,
    question: `${num1} + ${num2} = ?`,
    answer,
    hint: yearLevel <= 2 ? 'Use your fingers or count objects!' : 'Try breaking the numbers into smaller parts!',
    explanation: `When we add ${num1} and ${num2}, we combine them together to get ${answer}.`,
    visualType: 'blocks',
    interactiveType: 'drag_drop',
    numbers: { num1, num2, operator: '+' },
    dragItems: generateNumberBlocks(num1, num2, '+'),
    steps: [
      { description: `Start with ${num1}`, result: String(num1) },
      { description: `Add ${num2} more`, formula: `${num1} + ${num2}`, result: String(answer) },
    ],
  };
}

function generateSubtractionProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  const range = getRange(yearLevel, difficulty);
  const num1 = randomInt(range.min, range.max);
  const num2 = randomInt(1, Math.min(num1, range.max)); // Ensure positive result
  const answer = num1 - num2;

  return {
    id: generateId(),
    topic: 'subtraction',
    yearLevel,
    difficulty,
    question: `${num1} - ${num2} = ?`,
    answer,
    hint: yearLevel <= 2 ? 'Take away objects and count what\'s left!' : 'Think about counting backwards!',
    explanation: `When we subtract ${num2} from ${num1}, we take away ${num2} to get ${answer}.`,
    visualType: 'blocks',
    interactiveType: 'drag_drop',
    numbers: { num1, num2, operator: '-' },
    dragItems: generateNumberBlocks(num1, num2, '-'),
    steps: [
      { description: `Start with ${num1}`, result: String(num1) },
      { description: `Take away ${num2}`, formula: `${num1} - ${num2}`, result: String(answer) },
    ],
  };
}

function generateMultiplicationProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  // Multiplication ranges based on year level
  const ranges: Record<YearLevel, Record<Difficulty, { min: number; max: number }>> = {
    1: { easy: { min: 1, max: 2 }, medium: { min: 1, max: 3 }, hard: { min: 2, max: 3 }, challenge: { min: 2, max: 5 } },
    2: { easy: { min: 1, max: 3 }, medium: { min: 2, max: 5 }, hard: { min: 2, max: 5 }, challenge: { min: 3, max: 6 } },
    3: { easy: { min: 2, max: 5 }, medium: { min: 2, max: 6 }, hard: { min: 3, max: 8 }, challenge: { min: 4, max: 10 } },
    4: { easy: { min: 2, max: 6 }, medium: { min: 3, max: 9 }, hard: { min: 4, max: 10 }, challenge: { min: 5, max: 12 } },
    5: { easy: { min: 3, max: 9 }, medium: { min: 4, max: 10 }, hard: { min: 6, max: 12 }, challenge: { min: 7, max: 12 } },
    6: { easy: { min: 4, max: 10 }, medium: { min: 5, max: 12 }, hard: { min: 6, max: 12 }, challenge: { min: 7, max: 15 } },
  };

  const range = ranges[yearLevel][difficulty];
  const num1 = randomInt(range.min, range.max);
  const num2 = randomInt(range.min, range.max);
  const answer = num1 * num2;

  return {
    id: generateId(),
    topic: 'multiplication',
    yearLevel,
    difficulty,
    question: `${num1} × ${num2} = ?`,
    answer,
    hint: `Think of it as ${num1} groups of ${num2}!`,
    explanation: `${num1} × ${num2} means ${num1} groups of ${num2}, which equals ${answer}.`,
    visualType: 'grid',
    interactiveType: 'drag_drop',
    numbers: { num1, num2, operator: '×' },
    steps: [
      { description: `We have ${num1} groups`, result: String(num1) },
      { description: `Each group has ${num2}`, result: String(num2) },
      { description: 'Count all together', formula: `${num1} × ${num2}`, result: String(answer) },
    ],
  };
}

function generateDivisionProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  const ranges: Record<YearLevel, Record<Difficulty, { min: number; max: number }>> = {
    1: { easy: { min: 1, max: 2 }, medium: { min: 1, max: 3 }, hard: { min: 2, max: 3 }, challenge: { min: 2, max: 4 } },
    2: { easy: { min: 1, max: 3 }, medium: { min: 2, max: 4 }, hard: { min: 2, max: 5 }, challenge: { min: 2, max: 5 } },
    3: { easy: { min: 2, max: 4 }, medium: { min: 2, max: 5 }, hard: { min: 2, max: 6 }, challenge: { min: 3, max: 8 } },
    4: { easy: { min: 2, max: 5 }, medium: { min: 2, max: 8 }, hard: { min: 3, max: 10 }, challenge: { min: 4, max: 12 } },
    5: { easy: { min: 2, max: 8 }, medium: { min: 3, max: 10 }, hard: { min: 4, max: 12 }, challenge: { min: 5, max: 12 } },
    6: { easy: { min: 2, max: 10 }, medium: { min: 3, max: 12 }, hard: { min: 4, max: 12 }, challenge: { min: 5, max: 15 } },
  };

  const range = ranges[yearLevel][difficulty];
  const divisor = randomInt(range.min, range.max);
  const answer = randomInt(range.min, range.max);
  const dividend = divisor * answer; // Ensure clean division

  return {
    id: generateId(),
    topic: 'division',
    yearLevel,
    difficulty,
    question: `${dividend} ÷ ${divisor} = ?`,
    answer,
    hint: `How many groups of ${divisor} can you make from ${dividend}?`,
    explanation: `${dividend} ÷ ${divisor} means splitting ${dividend} into groups of ${divisor}, giving us ${answer} groups.`,
    visualType: 'blocks',
    interactiveType: 'drag_drop',
    numbers: { num1: dividend, num2: divisor, operator: '÷' },
    steps: [
      { description: `Start with ${dividend} objects`, result: String(dividend) },
      { description: `Make groups of ${divisor}`, formula: `${dividend} ÷ ${divisor}` },
      { description: 'Count the groups', result: String(answer) },
    ],
  };
}

function generateFractionProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  const denominators = difficulty === 'easy' ? [2, 4] : difficulty === 'medium' ? [2, 3, 4] : [2, 3, 4, 5, 6];
  const denom = denominators[randomInt(0, denominators.length - 1)];
  const num1 = randomInt(1, denom - 1);
  const num2 = randomInt(1, denom - num1); // Ensure result doesn't exceed whole

  // Simple fraction addition with same denominator
  const answerNum = num1 + num2;
  const answerDisplay = answerNum >= denom ?
    (answerNum % denom === 0 ? String(answerNum / denom) : `${Math.floor(answerNum / denom)} ${answerNum % denom}/${denom}`) :
    `${answerNum}/${denom}`;

  return {
    id: generateId(),
    topic: 'fractions',
    yearLevel,
    difficulty,
    question: `${num1}/${denom} + ${num2}/${denom} = ?`,
    answer: answerDisplay,
    acceptableAnswers: [`${answerNum}/${denom}`, answerDisplay, String(answerNum / denom)],
    hint: 'When the bottom numbers are the same, just add the top numbers!',
    explanation: `With the same denominator, add the numerators: ${num1} + ${num2} = ${answerNum}`,
    visualType: 'fraction_bar',
    interactiveType: 'input',
    steps: [
      { description: 'Keep the bottom number (denominator) the same', result: `?/${denom}` },
      { description: 'Add the top numbers (numerators)', formula: `${num1} + ${num2}`, result: String(answerNum) },
      { description: 'Write the answer', result: answerDisplay },
    ],
  };
}

function generateDecimalProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  const num1 = randomInt(10, difficulty === 'easy' ? 50 : 100) / 10;
  const num2 = randomInt(10, difficulty === 'easy' ? 50 : 100) / 10;
  const answer = Math.round((num1 + num2) * 10) / 10;

  return {
    id: generateId(),
    topic: 'decimals',
    yearLevel,
    difficulty,
    question: `${num1.toFixed(1)} + ${num2.toFixed(1)} = ?`,
    answer,
    acceptableAnswers: [answer, answer.toFixed(1), answer.toFixed(2)],
    hint: 'Line up the decimal points like a tower!',
    explanation: `Line up the decimals and add like normal numbers: ${num1.toFixed(1)} + ${num2.toFixed(1)} = ${answer}`,
    visualType: 'number_line',
    interactiveType: 'input',
    steps: [
      { description: 'Line up the decimal points' },
      { description: 'Add each column from right to left' },
      { description: 'Put the decimal point in the answer', result: String(answer) },
    ],
  };
}

function generatePercentageProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  const percentages = difficulty === 'easy' ? [5, 10, 50] : difficulty === 'medium' ? [5, 10, 25, 50] : [5, 10, 20, 25, 50, 75];
  const percentage = percentages[randomInt(0, percentages.length - 1)];
  // Use multiples of 20 for easier mental math (5% of 20 = 1, 5% of 100 = 5)
  const baseNumber = randomInt(2, 10) * 20;
  const answer = (percentage / 100) * baseNumber;

  return {
    id: generateId(),
    topic: 'percentages',
    yearLevel,
    difficulty,
    question: `What is ${percentage}% of ${baseNumber}?`,
    answer,
    hint: `${percentage}% means ${percentage} out of 100. Try finding half or a quarter first!`,
    explanation: `${percentage}% of ${baseNumber} = ${answer}`,
    visualType: 'pie_chart',
    interactiveType: 'input',
    steps: [
      { description: `${percentage}% means ${percentage} parts out of 100` },
      { description: 'Calculate the answer', formula: `${percentage}/100 × ${baseNumber}`, result: String(answer) },
    ],
  };
}

function generateTimeProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  const hours = randomInt(1, 12);
  const minutes = difficulty === 'easy' ? 0 : difficulty === 'medium' ? randomInt(0, 1) * 30 : randomInt(0, 11) * 5;

  if (difficulty === 'easy') {
    return {
      id: generateId(),
      topic: 'time',
      yearLevel,
      difficulty,
      question: `What time does this clock show?`,
      answer: hours,
      acceptableAnswers: [hours, `${hours}:00`, `${hours} o'clock`],
      hint: 'Look at where the short hand (hour hand) is pointing!',
      explanation: `When the short hand points to ${hours}, it's ${hours} o'clock!`,
      visualType: 'clock',
      clockTime: { hours, minutes: 0 },
      interactiveType: 'input',
      steps: [
        { description: 'Find the hour hand (short hand)' },
        { description: 'See what number it points to', result: `${hours} o'clock` },
      ],
    };
  }

  if (difficulty === 'medium') {
    return {
      id: generateId(),
      topic: 'time',
      yearLevel,
      difficulty,
      question: `What time does this clock show?`,
      answer: `${hours}:${minutes.toString().padStart(2, '0')}`,
      acceptableAnswers: [
        `${hours}:${minutes.toString().padStart(2, '0')}`,
        minutes === 30 ? `half past ${hours}` : undefined,
      ].filter(Boolean) as string[],
      hint: minutes === 30 ? '30 minutes is half past the hour!' : 'Count by 5s from 12 to where the long hand points!',
      explanation: `The hour hand is on ${hours} and the minute hand shows ${minutes} minutes.`,
      visualType: 'clock',
      clockTime: { hours, minutes },
      interactiveType: 'input',
      steps: [
        { description: 'Find the hour hand (short hand)', result: String(hours) },
        { description: 'Count the minutes (long hand)', result: `${minutes} minutes` },
      ],
    };
  }

  // Hard/Challenge: Time addition
  return {
    id: generateId(),
    topic: 'time',
    yearLevel,
    difficulty,
    question: `What time is 30 minutes after ${hours}:00?`,
    answer: `${hours}:30`,
    acceptableAnswers: [`${hours}:30`, `half past ${hours}`],
    hint: '30 minutes is half an hour!',
    explanation: `30 minutes after ${hours}:00 is ${hours}:30 (half past ${hours})`,
    visualType: 'clock',
    clockTime: { hours, minutes: 0 },
    interactiveType: 'input',
    steps: [
      { description: `Start at ${hours}:00` },
      { description: 'Add 30 minutes', result: `${hours}:30` },
    ],
  };
}

function generateMoneyProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  const prices = difficulty === 'easy' ? [1, 2, 3, 5, 10] : difficulty === 'medium' ? [5, 10, 15, 20, 25] : [10, 15, 20, 25, 30, 50];
  const price1 = prices[randomInt(0, prices.length - 1)];
  const price2 = prices[randomInt(0, prices.length - 1)];
  const total = price1 + price2;

  const items = ['🍎 apple', '🍌 banana', '🍕 pizza slice', '🧁 cupcake', '📚 book', '✏️ pencil', '🎈 balloon'];
  const item1 = items[randomInt(0, items.length - 1)];
  const item2 = items[randomInt(0, items.length - 1)];

  return {
    id: generateId(),
    topic: 'money',
    yearLevel,
    difficulty,
    question: `A ${item1} costs $${price1} and a ${item2} costs $${price2}. How much for both?`,
    answer: total,
    acceptableAnswers: [total, `$${total}`, `${total} dollars`],
    hint: 'Add the two prices together!',
    explanation: `$${price1} + $${price2} = $${total}`,
    visualType: 'blocks',
    interactiveType: 'input',
    numbers: { num1: price1, num2: price2, operator: '+' },
    steps: [
      { description: `${item1} costs $${price1}` },
      { description: `${item2} costs $${price2}` },
      { description: 'Add them together', formula: `$${price1} + $${price2}`, result: `$${total}` },
    ],
  };
}

function generatePatternProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  const step = difficulty === 'easy' ? randomInt(1, 3) : difficulty === 'medium' ? randomInt(2, 5) : randomInt(3, 10);
  const start = randomInt(1, 10);
  const sequence = [start, start + step, start + step * 2, start + step * 3];
  const answer = start + step * 4;

  return {
    id: generateId(),
    topic: 'patterns',
    yearLevel,
    difficulty,
    question: `What comes next? ${sequence.join(', ')}, ?`,
    answer,
    hint: `Look at how much the numbers increase each time!`,
    explanation: `The pattern adds ${step} each time. ${sequence[3]} + ${step} = ${answer}`,
    visualType: 'number_line',
    interactiveType: 'drag_drop',
    steps: [
      { description: 'Find the pattern', result: `Adding ${step} each time` },
      { description: 'Continue the pattern', formula: `${sequence[3]} + ${step}`, result: String(answer) },
    ],
  };
}

function generateAreaPerimeterProblem(yearLevel: YearLevel, difficulty: Difficulty): MathProblem {
  const isArea = Math.random() > 0.5;
  const length = difficulty === 'easy' ? randomInt(2, 5) : difficulty === 'medium' ? randomInt(3, 8) : randomInt(5, 12);
  const width = difficulty === 'easy' ? randomInt(2, 5) : difficulty === 'medium' ? randomInt(3, 8) : randomInt(5, 12);

  if (isArea) {
    const answer = length * width;
    return {
      id: generateId(),
      topic: 'area_perimeter',
      yearLevel,
      difficulty,
      question: `What is the area of this rectangle?`,
      answer,
      acceptableAnswers: [answer, `${answer} square units`],
      hint: 'Area = length × width. Count all the squares inside!',
      explanation: `Area = ${length} × ${width} = ${answer} square units`,
      visualType: 'rectangle',
      dimensions: { length, width },
      interactiveType: 'input',
      numbers: { num1: length, num2: width, operator: '×' },
      steps: [
        { description: 'Use the formula: Area = length × width' },
        { description: 'Calculate', formula: `${length} × ${width}`, result: `${answer} square units` },
      ],
    };
  } else {
    const answer = 2 * (length + width);
    return {
      id: generateId(),
      topic: 'area_perimeter',
      yearLevel,
      difficulty,
      question: `What is the perimeter of this rectangle?`,
      answer,
      acceptableAnswers: [answer, `${answer} units`],
      hint: 'Perimeter = add all sides together. Walk around the shape!',
      explanation: `Perimeter = ${length} + ${width} + ${length} + ${width} = ${answer} units`,
      visualType: 'rectangle',
      dimensions: { length, width },
      interactiveType: 'input',
      steps: [
        { description: 'Add all four sides' },
        { description: 'Calculate', formula: `${length} + ${width} + ${length} + ${width}`, result: `${answer} units` },
      ],
    };
  }
}

function generateNumberBlocks(num1: number, num2: number, operator: string): DragItem[] {
  const items: DragItem[] = [];

  // For smaller numbers, create individual blocks
  const displayNum1 = Math.min(num1, 15);
  const displayNum2 = Math.min(num2, 15);

  for (let i = 0; i < displayNum1; i++) {
    items.push({
      id: `block-1-${i}`,
      content: '■',
      value: 1,
      type: 'number',
    });
  }

  items.push({
    id: 'operator',
    content: operator,
    value: operator,
    type: 'operator',
  });

  for (let i = 0; i < displayNum2; i++) {
    items.push({
      id: `block-2-${i}`,
      content: '■',
      value: 1,
      type: 'number',
    });
  }

  return items;
}
