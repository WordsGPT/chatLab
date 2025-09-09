import { ExecutionStatus } from "@executions/enums/execution-status.enum";

// Interface for representing an execution search result
export interface SearchExecutionDto {
  id: string;
  inputValues: Record<string, string>;
  status: ExecutionStatus;
  results?: Record<string, string[]>;
  executedAt?: Date;
}
