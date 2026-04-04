import OpenAI from "openai";
import { AIProvider, AIContext } from "./provider";

export class OpenAIProvider implements AIProvider {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async generateReply(message: string, context: AIContext, customPrompt?: string): Promise<string | null> {
    const baseSystemPrompt = `You are an intelligent Instagram DM assistant for the account @${context.instagramHandle}. 
Your goal is to be helpful, concise (under 3 sentences), and sound like a natural human rather than a stiff bot. Never hallucinate discounts or refund policies.`;

    const knowledgeInjection = context.knowledgeBase 
      ? `\n\nCRITICAL BRAND KNOWLEDGE BASE:\n${context.knowledgeBase}\nYou MUST use this information strictly to answer questions. If you don't know the answer, politely say a human will step in.` 
      : '';

    const systemMessage = customPrompt 
      ? `${customPrompt}${knowledgeInjection}`
      : `${baseSystemPrompt}${knowledgeInjection}`;

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemMessage },
    ];

    if (context.conversationHistory) {
      messages.push(...context.conversationHistory);
    }

    if (context.senderName) {
       messages.push({ role: "system", content: `The user currently messaging you is named ${context.senderName}` });
    }

    messages.push({ role: "user", content: message });

    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.3, // Strict temp to prevent hallucinated offers
        max_tokens: 200, // Instagram DMs should be quick
      });

      return completion.choices[0]?.message?.content || null;
    } catch (error) {
      console.error("[OpenAI Provider Error]", error);
      return null;
    }
  }
}
