import { GoogleGenAI } from "@google/genai";
import { ImageSize } from "../types";

export async function generateMockupImage(prompt: string, size: ImageSize, model: 'gemini' | 'doubao' = 'gemini', doubaoKey?: string, geminiKey?: string) {
  if (model === 'gemini') {
    const apiKey = geminiKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Gemini API key is not configured. Please enter your API key.");
    }
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: `A high-quality product mockup of ${prompt}. The product should be centered and have a clear, clean background suitable for placing a logo on it. Realistic lighting and textures.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: size
        },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
  } else if (model === 'doubao') {
    const apiKey = doubaoKey || process.env.DOUBAO_API_KEY;
    const endpoint = process.env.DOUBAO_ENDPOINT || 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

    if (!apiKey) {
      throw new Error("Doubao API key is not configured. Please enter your API key.");
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.DOUBAO_MODAL || "doubao-vision-pro",
        prompt: `A high-quality product mockup of ${prompt}. The product should be centered and have a clear, clean background suitable for placing a logo on it. Realistic lighting and textures.`,
        size: size === '1K' ? "1024x1024" : size === '2K' ? "2048x2048" : "4096x4096",
        n: 1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Doubao API error: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.data && data.data[0] && data.data[0].url) {
      return data.data[0].url;
    } else if (data.data && data.data[0] && data.data[0].b64_json) {
      return `data:image/png;base64,${data.data[0].b64_json}`;
    }
  }
  
  throw new Error("No image generated or model not supported");
}
