// Client-side LLM calls for static deployment
// Note: This exposes API keys to the browser, but they are user-provided keys

export type LLMProvider = 'anthropic' | 'openai' | 'gemini' | 'xai' | 'none';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ProblemContext {
  question: string;
  answer: string | number;
  topic: string;
  explanation?: string;
  steps?: { description: string }[];
}

function getSystemPrompt(yearLevel: number, studentName: string, problem: ProblemContext | null) {
  return `You are MathBuddy, a friendly and encouraging math tutor for students in Year ${yearLevel} (ages ${yearLevel + 4}-${yearLevel + 5}).
You're helping ${studentName || 'a student'} understand math concepts.

Your personality:
- Super friendly, patient, and encouraging!
- Use simple, clear language appropriate for the student's age
- Celebrate every effort and small win
- When they struggle, be gentle and break things down into smaller steps
- Use real-world examples (sports, games, food, money, everyday situations)
- Keep explanations SHORT and CLEAR - don't overwhelm them
- Ask questions to check understanding

${problem ? `Current problem: ${problem.question}
Correct answer: ${problem.answer}
Topic: ${problem.topic}
${problem.explanation ? `Explanation: ${problem.explanation}` : ''}
${problem.steps ? `Steps: ${problem.steps.map((s) => s.description).join(' -> ')}` : ''}` : ''}

Guidelines:
- If they ask "why" or "how", explain step by step with visual descriptions
- If they got it wrong, don't just give the answer - help them understand
- Use analogies they can relate to
- Encourage them to try again
- Keep responses concise (2-4 sentences usually)

Remember: Make math FUN and approachable!`;
}

async function callAnthropic(apiKey: string, systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const textContent = data.content?.find((c: { type: string }) => c.type === 'text');
  return textContent?.text || '';
}

async function callOpenAI(apiKey: string, systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || '';
}

async function callGemini(apiKey: string, systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const lastMessage = messages[messages.length - 1];
  const history = messages.slice(0, -1);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [
        ...history.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        { role: 'user', parts: [{ text: lastMessage.content }] },
      ],
      generationConfig: { maxOutputTokens: 500 },
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function callXAI(apiKey: string, systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-beta',
      max_tokens: 500,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || '';
}

export async function callLLM(
  provider: LLMProvider,
  apiKey: string,
  messages: ChatMessage[],
  problem: ProblemContext | null,
  studentName: string,
  yearLevel: number
): Promise<string> {
  if (!apiKey || provider === 'none') {
    throw new Error('AI chat requires an API key. Configure one in Settings!');
  }

  const systemPrompt = getSystemPrompt(yearLevel, studentName, problem);

  switch (provider) {
    case 'anthropic':
      return callAnthropic(apiKey, systemPrompt, messages);
    case 'openai':
      return callOpenAI(apiKey, systemPrompt, messages);
    case 'gemini':
      return callGemini(apiKey, systemPrompt, messages);
    case 'xai':
      return callXAI(apiKey, systemPrompt, messages);
    default:
      throw new Error('Unknown provider');
  }
}
