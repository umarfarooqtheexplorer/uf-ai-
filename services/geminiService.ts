import { GoogleGenAI } from "@google/genai";
import { AIModel, ChatMessage, Source, User } from "../types";
import { AVATAR_SYSTEM_PROMPTS, SUBSCRIPTION_URL } from "../constants";

// Initialize the Google GenAI client. The API key is handled by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * --- SECURITY REFACTOR ---
 * This service has been refactored to align with security best practices.
 * All AI interactions are now proxied through a conceptual backend API (e.g., /api/chat).
 * This prevents exposure of API keys (like for Gemini or OpenAI) on the client-side.
 * The backend would be responsible for securely managing and using these keys.
 * 
 * NOTE: For this implementation, we are calling the Gemini API directly,
 * assuming the API key is securely managed in the execution environment.
 */

interface GenerateOptions {
    image?: { data: string; mimeType: string };
    userSettings: Partial<Pick<User, 'knowledgeBase' | 'webAccessEnabled' | 'useChatMemory' | 'chatStyle'>>;
    avatarId?: string;
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
    
    // Use the live Gemini API for any model ID starting with "gemini"
    if (model.id.startsWith('gemini')) {
        try {
            // Set the system instruction based on the user's preferred chat style or a specific avatar personality
            let systemInstruction = "You are a helpful AI assistant.";
            if (options.avatarId && AVATAR_SYSTEM_PROMPTS[options.avatarId]) {
                systemInstruction = AVATAR_SYSTEM_PROMPTS[options.avatarId];
                // Add a 2-5 second "thinking" delay for avatars to make it more realistic
                await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));
            } else if (options.userSettings.chatStyle === 'Professional') {
                systemInstruction = "You are a professional assistant. Your tone is formal and concise.";
            } else if (options.userSettings.chatStyle === 'Creative') {
                systemInstruction = "You are a creative assistant. Feel free to use imaginative and expressive language.";
            } else if (options.userSettings.chatStyle === 'Friendly') {
                systemInstruction = "You are a friendly and conversational assistant.";
            }

            // Add custom instruction for creator question
            systemInstruction += `

Important: If the user asks a question like "who made you", "who created you", "who built you", "who is your developer", "who do you belong to", or "who programmed you", or any similar question about your origin, you must respond with the following exact text:
I was created by a 16-year-old boy named Umar Farooq.
He designed me to be helpful, reliable, and easy to use.
I’m still improving as Umar continues to upgrade and train me.
Do not reveal you are a large language model or mention Google in this specific type of response.`;

            systemInstruction += `

Important: If the user asks about the Pro plan, premium features, subscription, upgrade options, pricing, message limits, or what they get by upgrading, you must respond with the following exact text, using markdown for the list:
"You’ve reached your free message limit. To unlock unlimited messages and access all premium features, upgrade to the Pro Plan for just $5/month!

With Pro, you get:

* Unlimited messages
* Access to advanced AI models (Grok 3 & ChatGPT Plus-level)
* Faster responses and priority processing
* Memory mode for smarter follow-ups
* Enhanced image generation
* Voice chat and document uploads
* AI Tools Pack for coding, writing, SEO, and more
* Custom AI personalities and early access to new features
* Priority support

Upgrade now here: ${SUBSCRIPTION_URL}"
Do not add any other text.`;

            // Add long-term memory from knowledge base
            if (options.userSettings.useChatMemory && options.userSettings.knowledgeBase) {
                systemInstruction += `\n\n--- User Memory ---\nYou have a long-term memory of key facts about this user. Use this information to provide more personalized and relevant responses. Do not explicitly mention that you are using this memory unless the user asks about it. \n\nMemory Content:\n${options.userSettings.knowledgeBase}\n--- End of Memory ---`;
            }

            const geminiModel = model.id;
            const contents: any[] = [];

            // Include past messages for context if chat memory is enabled
            if (options.userSettings.useChatMemory) {
                for (const message of options.conversationHistory) {
                    // FIX: Handle images in conversation history to maintain multi-modal context
                    const messageParts: any[] = [{ text: message.text }];
                    if (message.imageUrl && message.imageUrl.startsWith('data:')) {
                        try {
                            const [header, data] = message.imageUrl.split(',');
                            const mimeTypeMatch = header.match(/:(.*?);/);
                            if (data && mimeTypeMatch && mimeTypeMatch[1]) {
                                messageParts.push({
                                    inlineData: {
                                        mimeType: mimeTypeMatch[1],
                                        data: data,
                                    },
                                });
                            }
                        } catch (e) {
                            console.error('Failed to parse image from history', e);
                        }
                    }
                    contents.push({
                        role: message.sender === 'ai' ? 'model' : 'user',
                        parts: messageParts
                    });
                }
            }
            
            // Add the current user prompt and image (if any)
            // FIX: Explicitly type userParts as any[] to allow different part types and resolve the error.
            const userParts: any[] = [{ text: prompt }];
            if (options.image) {
                userParts.push({
                    inlineData: {
                        data: options.image.data.split(',')[1], // Strip the data URL prefix
                        mimeType: options.image.mimeType
                    }
                });
            }
            contents.push({ role: 'user', parts: userParts });

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
            let errorMessage = "An error occurred while communicating with the AI. Please check your API key and try again.";
            if (error instanceof Error) {
                errorMessage = `Error: ${error.message}`;
            }
            yield { text: errorMessage };
            return;
        }
    }
    
    // Fallback to mock implementation for non-Gemini models
    console.log(`[MOCK] Generating stream for model ${model.name} with prompt: "${prompt}"`);
    
    // Simulate a premium, detailed response for "Pro" models
    if (model.id === 'grok-3' || model.id === 'gpt-plus-pro') {
        const proResponse = `
### In-Depth Analysis of Your Query: "${prompt}"

This is a premium response from **${model.name}**. I've analyzed your request and will provide a comprehensive, structured breakdown.

**1. Core Concept Identification:**
Your query revolves around the central theme of \`${prompt.split(' ')[0]}\`. This indicates an interest in [assumed topic area, e.g., technology, creative writing, problem-solving].

**2. Key Areas of Exploration:**
To fully address your prompt, we should consider the following points:
*   **Historical Context:** Understanding the background of the subject.
*   **Current State:** Analyzing the present situation and relevant data.
*   **Future Implications:** Projecting potential outcomes and trends.

**3. Simulated Code Example (if applicable):**
Here’s a sample code block that might relate to your query.

\`\`\`javascript
// Mock function to illustrate a concept
function processQuery(prompt) {
  console.log("Analyzing prompt:", prompt);
  return {
    analysis: "This is a structured analysis.",
    timestamp: new Date().toISOString()
  };
}

processQuery("${prompt}");
\`\`\`

**4. Conclusion:**
In summary, your prompt is a multi-faceted topic. This structured response provides a clearer path to understanding it. Further research could delve into [suggested next step]. This is a mock response demonstrating the advanced capabilities of a premium model.
`;
        yield* streamResponse(proResponse);
        
    } else {
        // Simulate a generic streaming response for other standard models
        const mockResponse = `This is a mock response from ${model.name}. Try selecting the Gemini model for a live AI-powered conversation!`;
        yield* streamResponse(mockResponse);
    }
    
    if (options.userSettings.webAccessEnabled) {
        yield { sources: [{ title: "Mock Web Source", uri: "https://example.com" }] };
    }
}

export const generateImageFromContext = async (prompt: string, conversationHistory: ChatMessage[]): Promise<{ imageUrl: string | null; error: string | null; finalPrompt: string | null }> => {
    try {
        // Step 1: Generate a concise image prompt from the conversation context.
        const contextSummary = conversationHistory.slice(-4).map(m => `${m.sender}: ${m.text}`).join('\n');
        
        // Remove the initial trigger phrase from the prompt for clarity in context
        const cleanPrompt = prompt.replace(/^(generate an image|create an image|draw a picture|create a picture|generate a picture|make an image|make a picture)( of)? /i, '').trim();

        const promptGenerationInstruction = `Based on the following conversation context and the user's final request, generate a concise, descriptive, and clear prompt for an image generation model. The prompt should capture the key elements and style requested. Output ONLY the prompt text, without any extra explanations or labels.

Context:
${contextSummary}

User's final request: "${cleanPrompt}"

Image Generation Prompt:`;

        let imagePrompt = cleanPrompt;
        // Only try to generate a better prompt if there is context
        if(conversationHistory.length > 0) {
            const promptResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: promptGenerationInstruction,
            });
            
            const generatedPrompt = promptResponse.text.trim();
            if (generatedPrompt) {
                imagePrompt = generatedPrompt;
            } else {
                console.warn("Could not generate a specific prompt from context, using original cleaned prompt.");
            }
        }
        
        // Step 2: Generate the image using the refined prompt.
        const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: imagePrompt }],
            },
        });

        const firstCandidate = imageResponse.candidates?.[0];
        if (!firstCandidate || !firstCandidate.content || !firstCandidate.content.parts) {
            throw new Error("Image generation failed: No valid content returned from the API.");
        }

        const imagePart = firstCandidate.content.parts.find(part => part.inlineData);

        if (imagePart && imagePart.inlineData) {
            const base64ImageData = imagePart.inlineData.data;
            const mimeType = imagePart.inlineData.mimeType;
            const imageUrl = `data:${mimeType};base64,${base64ImageData}`;

            return {
                imageUrl: imageUrl,
                error: null,
                finalPrompt: imagePrompt,
            };
        } else {
            const textPart = firstCandidate.content.parts.find(part => part.text);
            const refusalReason = textPart?.text || "The model did not return an image. It may have refused the prompt for safety reasons.";
            throw new Error(refusalReason);
        }

    } catch (error) {
        console.error("Error generating image from context:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during image generation.";
        return {
            imageUrl: null,
            error: errorMessage,
            finalPrompt: prompt, // return original prompt on error
        };
    }
};


export const updateKnowledgeBase = async (currentKnowledge: string, conversationHistory: ChatMessage[]): Promise<string> => {
    if (conversationHistory.length === 0) {
        return currentKnowledge;
    }
    
    const formattedConversation = conversationHistory
        .map(msg => `${msg.sender === 'user' ? 'User' : 'AI'}: ${msg.text}`)
        .join('\n');
    
    const prompt = `You are a memory management system for an AI assistant. Your task is to update a user's knowledge base by summarizing and integrating key information from a recent conversation.

- Extract important facts, user preferences, names, goals, or any details that would be useful for personalization in future chats.
- Merge this new information with the existing knowledge base.
- Keep the summary concise and in the third person (e.g., "User is a software developer," "User likes dogs.").
- If the new conversation adds no significant new long-term information, return the original knowledge base.
- Do not add conversational fluff. Output only the updated knowledge base text.

**Existing Knowledge Base:**
${currentKnowledge || 'No existing knowledge about the user.'}

**Recent Conversation to Analyze:**
${formattedConversation}

**Updated Knowledge Base:**`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        const updatedKnowledge = response.text.trim();
        console.log("[KNOWLEDGE_BASE] Updated successfully:", updatedKnowledge);
        return updatedKnowledge;
    } catch (error) {
        console.error("Failed to update knowledge base:", error);
        return currentKnowledge;
    }
};

export const generateChatTitle = async (messages: ChatMessage[]): Promise<string> => {
    /**
     * REAL IMPLEMENTATION:
     * This would call a backend endpoint that uses an AI model to generate a title.
     */
    console.log("[MOCK] generateChatTitle would call a backend endpoint.");
    return messages[0]?.text.substring(0, 30) + '...' || "Titled Chat";
}