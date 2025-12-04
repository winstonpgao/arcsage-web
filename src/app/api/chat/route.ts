import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

type LLMProvider = 'anthropic' | 'openai' | 'gemini' | 'xai';

function getSystemPrompt(yearLevel: number, studentName: string, problem: {
  question: string;
  answer: string | number;
  topic: string;
  explanation?: string;
  steps?: { description: string }[];
} | null) {
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

async function callAnthropic(apiKey: string, systemPrompt: string, messages: { role: string; content: string }[]) {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  const textContent = response.content.find((c) => c.type === 'text');
  return textContent?.type === 'text' ? textContent.text : '';
}

async function callOpenAI(apiKey: string, systemPrompt: string, messages: { role: string; content: string }[]) {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 500,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ],
  });

  return response.choices[0]?.message?.content || '';
}

async function callGemini(apiKey: string, systemPrompt: string, messages: { role: string; content: string }[]) {
  // Using Google's Gemini API via REST
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

async function callXAI(apiKey: string, systemPrompt: string, messages: { role: string; content: string }[]) {
  // xAI (Grok) uses OpenAI-compatible API
  const client = new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
  });

  const response = await client.chat.completions.create({
    model: 'grok-beta',
    max_tokens: 500,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ],
  });

  return response.choices[0]?.message?.content || '';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, problem, studentName, yearLevel, apiKey, provider } = body;

    if (!apiKey || !provider || provider === 'none') {
      return NextResponse.json(
        { error: 'AI chat requires an API key. Configure one in Settings, or use the built-in explanations!' },
        { status: 400 }
      );
    }

    const systemPrompt = getSystemPrompt(yearLevel, studentName, problem);
    let responseText = '';

    switch (provider as LLMProvider) {
      case 'anthropic':
        responseText = await callAnthropic(apiKey, systemPrompt, messages);
        break;
      case 'openai':
        responseText = await callOpenAI(apiKey, systemPrompt, messages);
        break;
      case 'gemini':
        responseText = await callGemini(apiKey, systemPrompt, messages);
        break;
      case 'xai':
        responseText = await callXAI(apiKey, systemPrompt, messages);
        break;
      default:
        return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
    }

    return NextResponse.json({ message: responseText });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get response' },
      { status: 500 }
    );
  }
}
