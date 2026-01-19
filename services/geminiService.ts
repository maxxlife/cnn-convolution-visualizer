import { GoogleGenAI } from "@google/genai";
import { Matrix } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const explainConvolution = async (kernelName: string, inputSlice: Matrix, kernel: Matrix, result: number) => {
  const client = getClient();
  if (!client) {
    return "API Key не найден. Пожалуйста, настройте ключ для получения объяснений от AI.";
  }

  const prompt = `
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
    
    Формат ответа: обычный текст, можно использовать markdown. Максимум 3-4 предложения.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Не удалось получить объяснение от AI. Проверьте консоль или попробуйте позже.";
  }
};
