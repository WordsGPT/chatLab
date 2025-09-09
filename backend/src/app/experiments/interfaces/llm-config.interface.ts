// Interface representing the configuration for LLM
export interface LlmConfig {
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
}