import { LlmConfig } from "@experiments/interfaces/llm-config.interface";
import { CreatePrompt } from "@experiments/interfaces/create-prompt.interface";
import { CreateVariable } from "@experiments/interfaces/create-variable.interface";

// Interface for representing an experiment creation request
export interface CreateExperimentDto {
  name: string;
  description?: string;
  llmConfig: LlmConfig;
  models: string[];
  prompts: CreatePrompt[];
  variables: CreateVariable[];
}