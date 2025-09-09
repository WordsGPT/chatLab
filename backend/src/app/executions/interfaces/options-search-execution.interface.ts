import { ExecutionStatus } from '@executions/enums/execution-status.enum';
import { OrderDirection } from '@core/enums/order-direction.enum';

// Interface for search options when fetching executions
export interface OptionsSearchExecutionDto {
  page?: number;
  status?: ExecutionStatus;
  executedAt?: OrderDirection;
}
