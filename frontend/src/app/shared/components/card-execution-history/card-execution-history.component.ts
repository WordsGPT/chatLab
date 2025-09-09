import { Component, inject, input } from '@angular/core';

import { ExecutionService } from '@core/services/execution.service';
import { ExperimentService } from '@core/services/experiment.service';

import { EXECUTION_STATUS_LABELS } from '@executions/constants/execution-status-label';
import { ExecutionStatus } from '@executions/enums/execution-status.enum';
import { SearchExecutionDto } from '@executions/interfaces/search-execution.interface';

// This component displays the history cards of executions
// It allows users to view and manage their execution history
@Component({
  selector: 'card-execution-history',
  standalone: true,
  imports: [],
  templateUrl: './card-execution-history.component.html',
  styleUrl: './card-execution-history.component.scss'
})
export class CardExecutionHistoryComponent {

  // Inputs from the parent form
  readonly executions = input.required<SearchExecutionDto[]>();
  readonly history = input<boolean>();

  // Injecting dependencies´
  private readonly experimentService = inject(ExperimentService);
  private readonly executionService = inject(ExecutionService);

  // Properties for execution management
  protected readonly currentExperiment = this.experimentService.currentExperiment;

  protected readonly executionStatusLabels = EXECUTION_STATUS_LABELS;
  protected readonly ExecutionStatus = ExecutionStatus;

  /**
   * Deletes an execution by its ID
   * 
   * @param executionId The ID of the execution to delete
   */
  protected deleteExecution(executionId: string): void {
    let history;
    this.history() ? (history = this.history()) : (history = undefined);
    this.executionService.deleteExecution(executionId, history);
  }

  /**
   * Runs an execution by its ID
   * 
   * @param executionId The ID of the execution to run
   */
  protected runExecution(executionId: string): void {
    let history;
    this.history() ? (history = this.history()) : (history = undefined);
    this.executionService.runExecution(executionId, this.currentExperiment()!.models, this.currentExperiment()!.llmConfigs, history);
  }

  /** 
   * Checks if the results object has any entries
   * 
   * @param results The results object to check
   * @returns True if there are results, false otherwise
   */
  protected hasResults(results: any): boolean {
    return results && Object.keys(results).length > 0;
  }

  /**
   * Checks if the result array has any items
   * 
   * @param resultArray The result array to check
   * @return True if there are items, false otherwise
   */
  protected hasResultItems(resultArray: any): boolean {
    return Array.isArray(resultArray) && resultArray.length > 0;
  }

  /**
   * Extracts input entries from the given object
   * 
   * @param inputValues The object containing input values
   * @returns An array of key-value pairs for non-empty input fields
   */
  protected getInputEntries(inputValues: any) {
    return Object.entries(inputValues).filter(([key, value]) => 
      value !== null && 
      value !== undefined && 
      !(Array.isArray(value) && value.every(v => 
        v === null || 
        v === undefined || 
        (typeof v === 'string' && v.trim() === '')
      )) && 
      !(typeof value === 'string' && value.trim() === '')
    );
  }

  /**
   * Formats a value for display
   * 
   * @param value The value to format
   * @returns The formatted value as a string
   */
  protected formatValue(value: any): string {
    return Array.isArray(value) ? JSON.stringify(value) : value;
  }

  /**
   * Converts the results object into an array of key-value pairs
   *
   * @param results The results object to convert
   * @returns An array of key-value pairs representing the results
   */
  protected getResultEntries(results: Record<string, string[]>): [string, string[]][] {
    return Object.entries(results);
  }

}
