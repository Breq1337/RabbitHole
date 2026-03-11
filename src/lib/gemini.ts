// Gemini API - resumos e fatos interessantes
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MODEL = 'gemini-2.5-flash';

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY;
}

export interface GeminiGenerateOptions {
  model?: string;
  maxTokens?: number;
}

async function generateContent(
  prompt: string,
  options: GeminiGenerateOptions = {}
): Promise<string | null> {
  const key = getApiKey();
  if (!key) return null;

  const model = options.model ?? DEFAULT_MODEL;
  const url = `${GEMINI_API}/models/${model}:generateContent?key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options.maxTokens ?? 256,
          temperature: 0.7,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[Gemini]', res.status, err);
      return null;
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return text || null;
  } catch (e) {
    console.error('[Gemini]', e);
    return null;
  }
}

/** Gera uma frase curta "fato interessante" sobre o tópico (em português). */
export async function generateInterestingFact(
  topicName: string,
  contextSummary?: string
): Promise<string | null> {
  const prompt = contextSummary
    ? `Com base no texto abaixo, escreva UMA frase curta e impactante (máximo 150 caracteres) que destaque um fato interessante sobre "${topicName}". Responda apenas com a frase, em português, sem aspas nem título.\n\nTexto: ${contextSummary.slice(0, 800)}`
    : `Escreva UMA frase curta e impactante (máximo 150 caracteres) com um fato interessante sobre "${topicName}". Responda apenas com a frase, em português, sem aspas nem título.`;

  return generateContent(prompt, { maxTokens: 120 });
}

/** Resume o texto em 1-2 frases (em português). */
export async function summarizeText(text: string, maxLength = 200): Promise<string | null> {
  if (!text.trim()) return null;
  const prompt = `Resuma o seguinte texto em no máximo 1 ou 2 frases (máximo ${maxLength} caracteres). Mantenha em português. Responda apenas com o resumo.\n\n${text.slice(0, 1500)}`;
  return generateContent(prompt, { maxTokens: 150 });
}

/** Comprime evidência de relação em label curto (2–6 palavras). Ex: "acted with" */
export async function compressRelationLabel(
  evidence: string,
  minWords = 2,
  maxWords = 6
): Promise<string | null> {
  if (!evidence.trim()) return null;
  const prompt = `Transforme esta descrição de relação entre pessoas em um label curto de ${minWords} a ${maxWords} palavras em inglês. Exemplos: "acted with", "married to", "teammate", "co-founded with". Responda apenas com o label, nada mais.\n\nDescrição: ${evidence.slice(0, 200)}`;
  return generateContent(prompt, { maxTokens: 50 });
}
