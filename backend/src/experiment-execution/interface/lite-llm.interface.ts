// LiteLLM response interface
export interface LiteLLMResponse {
  id: string;
  created: number;
  model: string;
  object: string;
  system_fingerprint: string;
  choices: LiteLLMChoice[];
  usage: LiteLLMUsage;
  service_tier: string | null;
  prompt_filter_results: LiteLLMPromptFilterResult[];
}

// LiteLLM message interface
interface LiteLLMMessage {
  content: string;
  role: string;
  tool_calls: any;
  function_call: any;
  annotations: any[];
}

// LiteLLM choice interface
interface LiteLLMChoice {
  finish_reason: string;
  index: number;
  message: LiteLLMMessage;
}

// LiteLLM usage interface
interface LiteLLMUsageDetails {
  accepted_prediction_tokens: number;
  audio_tokens: number;
  reasoning_tokens: number;
  rejected_prediction_tokens: number;
}

// LiteLLM usage interface
interface LiteLLMUsage {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
  completion_tokens_details: LiteLLMUsageDetails;
  prompt_tokens_details: Partial<Record<string, number>>;
}

// LiteLLM prompt filter result interface
interface LiteLLMPromptFilterResult {
  prompt_index: number;
  content_filter_results: Record<
    string,
    { filtered: boolean; severity: string }
  >;
}
