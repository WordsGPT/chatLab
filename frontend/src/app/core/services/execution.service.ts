import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { toast } from 'ngx-sonner';

import { environment } from '@env/environment';

import { ORIGIN } from '@core/constants/http-context-token';
import { SearchExecutionDto } from '@executions/interfaces/search-execution.interface';
import { OptionsSearchExecutionDto } from '@executions/interfaces/options-search-execution.interface';
import { ExperimentService } from './experiment.service';
import { SearchExperimentDto } from '@experiments/interfaces/search-experiment-dto.interface';
import { ExecutionStatus } from '@executions/enums/execution-status.enum';

// This service handles all operations related to experiment executions
@Injectable({
  providedIn: 'root'
})
export class ExecutionService {

  // Injecting dependencies
  private readonly http = inject(HttpClient);
  private readonly experimentService = inject(ExperimentService);

  // URLs for the backend server
  private readonly serverUrl = environment.BACKEND_URI;
  private readonly executionUrl = `${this.serverUrl}/experiment-execution`;

  // Signals to manage execution state
  private readonly _loading = signal(false);
  private readonly _submitted = signal(false);

  private readonly _executions = signal<any[]>([]);
  private readonly _temporalExecutions = signal<any[]>([]);
  private readonly _totalExecutions = signal(0);
  private readonly _runningIds = signal<string[]>([]);

  readonly loading = this._loading.asReadonly();
  readonly submitted = this._submitted.asReadonly();

  readonly executions = this._executions.asReadonly();
  readonly temporalExecutions = this._temporalExecutions.asReadonly();
  readonly totalExecutions = this._totalExecutions.asReadonly();
  readonly runningIds = this._runningIds.asReadonly();

  readonly LIMIT_PER_PAGE = 20;

  // ------------------ HTTP Requests ------------------

  /** GET */

  /**
   * Fetch the list of executions for a specific experiment
   * 
   * @param experimentId The ID of the experiment
   * @param options Optional search parameters
   */
  getExecutions(experimentId: string, options?: OptionsSearchExecutionDto): void {
    const url = `${this.executionUrl}/executions/${experimentId}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExecutionService');

    let params = new HttpParams()
      .set('page', options?.page?.toString() ?? '1')

    if (options?.status !== undefined) {
      params = params.set('status', options.status.toString());
    }

    if (options?.executedAt) {
      params = params.set('executedAt', options.executedAt);
    }

    this.http.get<{ executions: SearchExecutionDto[]; total: number }>(url, { context, params })
      .subscribe((response) => {
        this._executions.set(response.executions);
        this._totalExecutions.set(response.total);
      });
  }

  /**
   * Fetch the list of temporal (created/loading status) executions for a specific experiment
   * 
   * @param experimentId The ID of the experiment
   */
  async getTemporalExecutions(experimentId: string): Promise<void> {
    const url = `${this.executionUrl}/temporal-executions/${experimentId}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExecutionService');

    this.http.get<SearchExecutionDto[]>(url, { context })
      .subscribe((response) => {
        this._temporalExecutions.set(response);
      });
  }

  /** POST */

  /**
   * Create a new execution
   * 
   * @param inputValues The input values for the execution
   * @param prompts The prompts associated with the execution
   * @param experimentId The ID of the experiment to which the execution belongs 
   */
  async createExecution(inputValues: Record<string, string>, prompts: string[], experimentId: string): Promise<void> {
    const url = `${this.executionUrl}/create/execution/${experimentId}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExecutionService');

    const execution = {
      inputValues,
      prompts
    };

    this._loading.set(true);

    try {
      const response = await firstValueFrom(
        this.http.post<{ message: string; execution: SearchExecutionDto }>(url, execution, { context })
          .pipe(finalize(() => this._loading.set(false)))
      );

      this._submitted.set(false);
      this._temporalExecutions.set([response.execution, ...this._temporalExecutions()]);
      toast.success(response.message);
    } catch (error) {
      this._loading.set(false);
    }
  }

  /**
   * Upload multiple executions for a specific experiment
   * 
   * @param file The file containing the executions to upload
   * @param prompts The prompts associated with the executions
   * @param experimentId The ID of the experiment to which the executions belong
   */
  uploadExecutions(file: File, prompts: string[], experimentId: string): void {
    const url = `${this.executionUrl}/upload/executions/${experimentId}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExecutionService');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompts', JSON.stringify(prompts));

    this._loading.set(true);

    this.http.post<{ message: string; executions: SearchExecutionDto[] }>(url, formData, { context })
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe((response) => {
        this._temporalExecutions.set([...response.executions, ...this._temporalExecutions()]);
        toast.success(response.message);
      });
  }

  /** 
   * Download an Excel file containing the executions for a specific experiment
   * 
   * @param experimentId The ID of the experiment
   * @param prompts The prompts associated with the experiment
   */
  downloadExcel(experimentId: string, prompts: string[]): void {
    const url = `${this.executionUrl}/download/${experimentId}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExecutionService');

    this.http.post(url, { prompts }, { context, responseType: 'blob' })
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `experiment_${experimentId}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  /** PATCH */

  /**
   * Run a specific execution by its ID
   * Update the corresponding signal based on whether it's historial or temporal
   * 
   * @param executionId The ID of the execution to run
   * @param models The models to use for the execution
   * @param llmConfigs The LLM configurations to use for the execution
   * @param historial Boolean indicating if the execution is from historial or temporal
   */
  runExecution(
    executionId: string, 
    models: SearchExperimentDto['models'], 
    llmConfigs: SearchExperimentDto['llmConfigs'], 
    historial: boolean = false
  ): void {
    const url = `${this.executionUrl}/run/${executionId}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExecutionService');

    historial ? 
      this._executions.set(this._executions().map(e => e.id === executionId ? { ...e, status: ExecutionStatus.LOADING } : e))
    : this._temporalExecutions.set(this._temporalExecutions().map(e => e.id === executionId ? { ...e, status: ExecutionStatus.LOADING } : e));

    const body = { models: models, llmConfigs: llmConfigs };

    this.http.patch<{ message: string; execution: SearchExecutionDto }>(url, body, { context })
      .subscribe((response) => {
        if (historial) {
          this._executions.set(this._executions().map(e => e.id === executionId ? response.execution : e));
          toast.success(response.message);
          return;
        }
        this._temporalExecutions.set(this._temporalExecutions().map(e => e.id === executionId ? response.execution : e));
        toast.success(response.message);
      });
  }

  /**
   * Run all temporal executions for a specific experiment
   *
   * @param experimentId The ID of the experiment
   * @param models The models to use for the executions
   * @param llmConfigs The LLM configurations to use for the executions
   */
  async runAll(
    experimentId: string,
    models: SearchExperimentDto['models'],
    llmConfigs: SearchExperimentDto['llmConfigs'],
    historial: boolean = false,
    options?: OptionsSearchExecutionDto
  ): Promise<void> {
    const url = `${this.executionUrl}/run-all/${experimentId}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExecutionService');

    const body = { models: models, llmConfigs: llmConfigs };

    this.http.patch<{ message: string; changes: boolean; executionsIds?: string[] }>(url, body, { context })
      .subscribe(async (response) => {
        if (response.changes === false) {
          toast.success(response.message);
          return;
        }

        if (historial) {
          this.getExecutions(experimentId, options);
          toast.success(response.message);
          return;
        }

        await this.getExecutionsByIds(experimentId, response.executionsIds!, this._temporalExecutions());
        toast.success(response.message);
      });
  }

  /** DELETE */

  /**
   * Delete an execution by its ID
   * Update the corresponding signal based on whether it's historial or temporal
   * 
   * @param id The ID of the execution to delete
   * @param historial Boolean indicating if the execution is from historial or temporal
   */
  deleteExecution(id: string, historial: boolean = false): void {
    const url = `${this.executionUrl}/delete/${id}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExecutionService');

    this.http.delete<{ message: string }>(url, { context })
      .subscribe((response) => {
        if(historial) {
          this._executions.set(this._executions().filter(e => e.id !== id));
          toast.success(response.message);
          return;
        }

        if (this._temporalExecutions().length > 10) {
          this._temporalExecutions.set(this._temporalExecutions().filter(e => e.id !== id));
        } else {
          this.getTemporalExecutions(this.experimentService.currentExperiment()!.id);
        }
        toast.success(response.message);
      });
  }

  // ------------------ Auxiliary Methods --------------

  /**
   * Indicate if the experiment form has been submitted
   */
  submit(): void {
    this._submitted.set(true);
  }

  /**
   * Cancel the form submission
   */
  cancelSubmit(): void {
    this._submitted.set(false);
  }

  /**
   * Fetch executions by their IDs and update the temporal executions signal
   * Merges with current temporal executions to avoid losing any not modified ones
   * 
   * @param experimentId The ID of the experiment
   * @param executionIds The IDs of the executions to fetch
   * @param currentTemporalExecutions The current temporal executions to merge with
   */
  private async getExecutionsByIds(experimentId: string, executionIds: string[], currentTemporalExecutions: SearchExecutionDto[]): Promise<void> {
    const url = `${this.executionUrl}/update-temporal-executions/${experimentId}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExecutionService');

    const params = new HttpParams()
      .set('executionIds', executionIds.join(','));

    this.http.get<SearchExecutionDto[]>(url, { context, params })
      .subscribe((response) => {
        this._temporalExecutions.set(response);
      });

    try {
      const response = await firstValueFrom(
        this.http.get<SearchExecutionDto[]>(url, { context, params })
      );
      let updateExecutions = response;

      const notModified = currentTemporalExecutions
        .filter(e => !response.some(r => r.id === e.id));

      if (notModified.length > 0) {
        updateExecutions = [...response, ...notModified];
      }

      this._temporalExecutions.set(updateExecutions);
    } catch (error) { }
  }
}