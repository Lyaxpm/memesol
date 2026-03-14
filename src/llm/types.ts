export interface LlmRequest {
  systemPrompt: string;
  userPrompt: string;
  timeoutMs: number;
}

export interface LlmResponse {
  text: string;
  model: string;
}

export interface LlmProvider {
  complete(req: LlmRequest): Promise<LlmResponse>;
}
