import { CreateVariable } from "@experiments/interfaces/create-variable.interface";
import { LlmConfig } from "@experiments/interfaces/llm-config.interface";

// Interface that represents the response to the search of an individual experiment
export interface SearchExperimentDto {
  id: string;
  name: string;
  description?: string;
  llmConfigs: LlmConfig;
  models: string[];
  prompts: string[];
  variables: CreateVariable[];
}