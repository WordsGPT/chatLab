import { ExecutionStatus } from '@executions/enums/execution-status.enum';

// This constant is used for the labels for execution statuses
export const EXECUTION_STATUS_LABELS: Record<ExecutionStatus, string> = {
  [ExecutionStatus.CREATED]: 'Created',
  [ExecutionStatus.LOADING]: 'Loading',
  [ExecutionStatus.ERROR]: 'Error',
  [ExecutionStatus.FINISHED]: 'Finished',
};