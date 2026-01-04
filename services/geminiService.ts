
import { GoogleGenAI, Type } from "@google/genai";
import { AIModel, ChatMessage, Source, User, Avatar } from "../types";
import { AVATAR_SYSTEM_PROMPTS, SUBSCRIPTION_URL } from "../constants";

// Initialize the Google GenAI client. The API key is handled by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

interface GenerateOptions {
    image?: { data: string; mimeType: string };
    userSettings: Partial<Pick<User, 'knowledgeBase' | 'webAccessEnabled' | 'useChatMemory' | 'chatStyle'>>;
    avatarId?: string;
    customAvatar?: Avatar; // Add support for custom avatar data
    conversationHistory: ChatMessage[];
}

async function* streamResponse(text: string) {
    const words = text.split(' ');
    for (const word of words) {
        yield { text: `${word} ` };
        await new Promise(res => setTimeout(res, 40));
    }
}

export async function* generateResponseStream(
    prompt: string, 
    model: AIModel, 
    options: GenerateOptions
): AsyncGenerator<{ text?: string, sources?: Source[] }> {
    
    if (model.id.startsWith('gemini')) {
        try {
            let systemInstruction = `You are UF AI, a highly capable and helpful assistant.`;
            
            // Priority 1: Custom Avatar Persona
            if (options.customAvatar?.systemPrompt) {
                systemInstruction = options.customAvatar.systemPrompt;
            } 
            // Priority 2: Predefined Avatar Persona
            else if (options.avatarId && AVATAR_SYSTEM_PROMPTS[options.avatarId]) {
                systemInstruction = AVATAR_SYSTEM_PROMPTS[options.avatarId];
            } 
            // Priority 3: User Style Choice
            else if (options.userSettings.chatStyle === 'Professional') {
                systemInstruction += "\n**Current Persona: Professional.** Tone is formal, concise, and objective.";
            } else if (options.userSettings.chatStyle === 'Creative') {
                systemInstruction += "\n**Current Persona: Creative.** Imagination and storytelling are encouraged.";
            } else { 
                systemInstruction += "\n**Current Persona: Friendly.** Tone is warm and conversational.";
            }

            systemInstruction += `\n\nImportant: If the user asks who made you, respond exactly with: I was created by a 16-year-old boy named Umar Farooq. He designed me to be helpful, reliable, and easy to use. I’m still improving as Umar continues to upgrade and train me.`;

            if (options.userSettings.useChatMemory && options.userSettings.knowledgeBase) {
                systemInstruction += `\n\n### USER KNOWLEDGE BASE (MEMORY)\n${options.userSettings.knowledgeBase}\n### END OF MEMORY`;
            }

            const geminiModel = model.id;
            const contents: any[] = [];

            if (options.userSettings.useChatMemory) {
                for (const message of options.conversationHistory) {
                    contents.push({
                        role: message.sender === 'ai' ? 'model' : 'user',
                        parts: [{ text: message.text }]
                    });
                }
            }
            
            contents.push({ role: 'user', parts: [{ text: prompt }] });

            const responseStream = await ai.models.generateContentStream({
                model: geminiModel,
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                }
            });

            for await (const chunk of responseStream) {
                if (chunk.text) {
                    yield { text: chunk.text };
                }
            }
            return;

        } catch (error) {
            console.error("Gemini API Error:", error);
            yield { text: `Error: ${error instanceof Error ? error.message : "Connection failed"}` };
            return;
        }
    }
    
    yield* streamResponse(`This is a mock response from ${model.name}. Try selecting the Gemini model for a live AI-powered conversation!`);
}

/**
 * Creates a custom avatar by researching the person and generating a portrait.
 */
export const createCustomAvatar = async (name: string): Promise<Avatar> => {
    // 1. Research the person using Search Grounding
    const researchResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Research the person named "${name}". Provide:
        1. A detailed system prompt defining their persona, knowledge, and speaking style.
        2. A short, iconic greeting they would say to a visitor.
        Format the response as JSON.`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    systemPrompt: { type: Type.STRING },
                    greeting: { type: Type.STRING }
                },
                required: ["systemPrompt", "greeting"]
            }
        }
    });

    const data = JSON.parse(researchResponse.text);

    // 2. Generate a portrait
    const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: `A professional, cinematic close-up headshot portrait of ${name}, centered, clean background, 8k resolution, photorealistic.` }] },
        config: {
            imageConfig: { aspectRatio: "1:1" }
        }
    });

    const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
    const imageUrl = imagePart?.inlineData 
        ? `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    return {
        id: `custom-${Date.now()}`,
        name: name,
        imageUrl: imageUrl,
        systemPrompt: data.systemPrompt,
        greeting: data.greeting
    };
};

export const generateImageFromContext = async (prompt: string, conversationHistory: ChatMessage[]): Promise<{ imageUrl: string | null; error: string | null; finalPrompt: string | null }> => {
    try {
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
        });

        const imagePart = imageResponse.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (imagePart && imagePart.inlineData) {
            return {
                imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
                error: null,
                finalPrompt: prompt,
            };
        }
        throw new Error("No image data");
    } catch (error) {
        return { imageUrl: null, error: "Failed to generate image", finalPrompt: prompt };
    }
};

export const updateKnowledgeBase = async (currentKnowledge: string, recentMessages: ChatMessage[]): Promise<string> => {
    return currentKnowledge; // Placeholder for brief update logic
};

export const generateChatTitle = async (messages: ChatMessage[]): Promise<string> => {
    return messages[0]?.text.substring(0, 30) || "New Chat";
};
