import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Helper to check if API key is present
export const hasApiKey = () => !!apiKey;

export const enhanceText = async (currentText: string, tone: 'professional' | 'fun' | 'concise', lang: 'en' | 'es'): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");
  
  const ai = new GoogleGenAI({ apiKey });
  const prompt = lang === 'es' 
    ? `Reescribe el siguiente texto para que sea más ${tone}. Mantén el significado pero mejora la fluidez:\n\n"${currentText}"`
    : `Rewrite the following text to be more ${tone}. Keep the meaning the same but improve flow and engagement:\n\n"${currentText}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || currentText;
  } catch (error) {
    console.error("Gemini Text Enhancement Error:", error);
    throw error;
  }
};

export const translateContent = async (text: string, targetLang: 'en' | 'es'): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  const target = targetLang === 'en' ? 'English' : 'Spanish';
  const prompt = `Translate the following text to ${target}. Only provide the translated text, no explanations:\n\n"${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || text;
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw error;
  }
}

export const generateImageCaption = async (base64Data: string, mimeType: string, lang: 'en' | 'es'): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });
  const promptText = lang === 'es' 
    ? "Escribe un pie de foto breve y atractivo para esta imagen en redes sociales. Incluye 2-3 hashtags relevantes."
    : "Write a short, engaging social media caption for this image. Include 2-3 relevant hashtags.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Multimodal model
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: promptText,
          },
        ],
      },
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    throw error;
  }
};

// Helper to convert file to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URL declaration (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};
