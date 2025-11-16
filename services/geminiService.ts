
import { GoogleGenAI } from "@google/genai";
import type { StatisticalMethod } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable is not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function* runChat(method: StatisticalMethod, userQuestion: string) {
    const prompt = `你是一位樂於助人的統計學專家。請根據「${method.name}」的原則以及以下從學習指南中摘錄的背景知識，用清晰、簡潔、友善的方式回答用戶的問題。

背景知識：
- 描述: ${method.description}
- 適用時機: ${method.useWhen.join('; ')}
- 解釋: ${method.explanation}

用戶問題：
${userQuestion}
`;

    try {
        const response = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        for await (const chunk of response) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error generating content from Gemini:", error);
        yield "對不起，我遇到了一些麻煩，無法回答您的問題。請稍後再試。";
    }
}
