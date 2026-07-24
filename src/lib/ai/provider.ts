export interface AIContext {
  instagramHandle: string;
  senderName?: string;
  knowledgeBase?: string | null;
  conversationHistory?: { role: 'user' | 'assistant', content: string }[];
}

export interface AIProvider {
  /**
   * Generates a conversational reply based on the user's incoming message and the brand's knowledge base.
   */
  generateReply(message: string, context: AIContext, systemPrompt?: string): Promise<string | null>;
}
