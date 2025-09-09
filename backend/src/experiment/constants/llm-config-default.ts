import { LLMConfigDto } from '@experiment/dto/llm-config.dto';

// This is the default configuration for the LLM
export const DEFAULT_LLM_CONFIG: LLMConfigDto = {
  temperature: 1.0,
  top_p: 1.0,
  max_tokens: 4096,
};
