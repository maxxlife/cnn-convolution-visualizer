import { GoogleGenAI } from "@google/genai";
import { Matrix, Language } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const explainConvolution = async (
  language: Language,
  kernelName: string,
  inputSlice: Matrix,
  kernel: Matrix,
  result: number
) => {
  const client = getClient();
  const errorMsg = language === 'ru' 
    ? "API Key не найден. Пожалуйста, настройте ключ для получения объяснений от AI."
    : "API Key not found. Please configure the key to get AI explanations.";

  if (!client) {
    return errorMsg;
  }

  const promptRu = `
    Ты - опытный преподаватель Data Science. Объясни очень кратко и просто (для новичка), что происходит в данном шаге свертки (Convolution).
    
    Контекст:
    Мы применяем фильтр "${kernelName}".
    
    Данные текущего шага:
    Кусочек изображения (Input): ${JSON.stringify(inputSlice)}
    Фильтр (Kernel): ${JSON.stringify(kernel)}
    Результат умножения и суммы: ${result}
    
    Задание:
    1. Объясни математику этого конкретного шага (одно предложение).
    2. Объясни интуитивный смысл: почему результат получился таким (высоким, низким или нулевым)? Что это значит для поиска признаков (features)?
    
    Формат ответа: обычный текст, можно использовать markdown. Максимум 3-4 предложения. Отвечай на русском языке.
  `;

  const promptEn = `
    You are an experienced Data Science instructor. Explain very briefly and simply (for a beginner) what is happening in this Convolution step.
    
    Context:
    We are applying the filter "${kernelName}".
    
    Current step data:
    Input Slice: ${JSON.stringify(inputSlice)}
    Kernel: ${JSON.stringify(kernel)}
    Dot Product Result: ${result}
    
    Task:
    1. Explain the math of this specific step (one sentence).
    2. Explain the intuitive meaning: why is the result high, low, or zero? What does this mean for feature detection?
    
    Response format: Plain text, markdown allowed. Max 3-4 sentences. Answer in English.
  `;

  const prompt = language === 'ru' ? promptRu : promptEn;
  const errorGen = language === 'ru'
    ? "Не удалось получить объяснение от AI. Проверьте консоль или попробуйте позже."
    : "Failed to get explanation from AI. Check console or try again later.";

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return errorGen;
  }
};