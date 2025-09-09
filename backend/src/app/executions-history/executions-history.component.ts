import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { ExecutionService } from '@core/services/execution.service';
import { ExperimentService } from '@core/services/experiment.service';
import { OrderDirection } from '@core/enums/order-direction.enum';

import { EXECUTION_STATUS_LABELS } from '@executions/constants/execution-status-label';
import { ExecutionStatus } from '@executions/enums/execution-status.enum';
import { OptionsSearchExecutionDto } from '@executions/interfaces/options-search-execution.interface';

import { CardExecutionHistoryComponent } from '@shared/components/card-execution-history/card-execution-history.component';

// This component displays the history of executions for a given experiment
@Component({
  selector: 'app-executions-history',
  standalone: true,
  imports: [CardExecutionHistoryComponent, NgbPaginationModule],
  templateUrl: './executions-history.component.html',
  styleUrl: './executions-history.component.scss'
})
export class ExecutionsHistoryComponent implements OnInit {

  // Injecting dependencies
  private readonly experimentService = inject(ExperimentService);
  private readonly executionService = inject(ExecutionService);
  private readonly router = inject(Router);

  // Properties for managing executions history
  protected readonly currentExperiment = this.experimentService.currentExperiment;

  protected readonly executions = this.executionService.executions;
  protected readonly totalExecutions = this.executionService.totalExecutions;
  protected readonly limitExecutions = this.executionService.LIMIT_PER_PAGE;

  protected readonly executionStatusLabels = EXECUTION_STATUS_LABELS;
  protected readonly ExecutionStatus = ExecutionStatus;
  protected readonly OrderDirection = OrderDirection;

  protected readonly statusOptions = Object.values(ExecutionStatus)
    .filter(value => typeof value === 'number') as ExecutionStatus[];

  protected page = 1;

  protected readonly searchOptions = signal<OptionsSearchExecutionDto>({
    page: 1,
    status: undefined,
    executedAt: undefined
  });

  protected fromRoute?: string;

  // Constructor to initialize the route to navigate back to
  constructor() {
    const nav = this.router.getCurrentNavigation();
    this.fromRoute = nav?.extras.state?.['from'] ?? '/';
  }

  // Lifecycle hook for component initialization
  ngOnInit(): void {
    this.getExecutions(this.searchOptions());
  }

  /**
   * Runs all executions for the current experiment
   */
  protected runAll(): void {
    this.executionService.runAll(this.currentExperiment()!.id, this.currentExperiment()!.models, this.currentExperiment()!.llmConfigs, true, this.searchOptions());
  }

  /**
   * Download the executions as an Excel file
   * Uses the current experiment's ID and prompts to download the Excel file
   */
  protected downloadExcel(): void {
    this.executionService.downloadExcel(this.currentExperiment()!.id, this.currentExperiment()!.prompts);
  }

  /*
   * Method to navigate back to the previous route or a default route
   */
  protected goBack(): void {
    this.router.navigateByUrl(this.fromRoute ?? '/');
  }

  /**
   * Update the current page and fetch the executions for the new page
   * 
   * @param page The new page number
   */
  protected updatePage(page: number): void {
    this.page = page;
    this.searchOptions.set({ ...this.searchOptions(), page });
    this.getExecutions(this.searchOptions());
  }

  /**
   * Update the execution status based on the selected option
   * 
   * @param event The change event from the status select element
   */
  protected updateStatus(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const prevOptions = this.searchOptions();

    let newStatus: ExecutionStatus | undefined;
    let newExecutedAt: OrderDirection | undefined;

    if (target.value === 'all') {
      this.searchOptions.set({ ...this.searchOptions(), status: undefined });
    } else {
      newStatus = Number(target.value) as ExecutionStatus;
    }

    if (newStatus === ExecutionStatus.ERROR || newStatus === ExecutionStatus.FINISHED) {
      if (prevOptions.executedAt !== OrderDirection.ASC && prevOptions.executedAt !== OrderDirection.DESC) {
        newExecutedAt = OrderDirection.DESC;
      }
    } else {
      newExecutedAt = undefined;
    }

    this.searchOptions.set({
      page: 1,  
      status: newStatus,
      executedAt: newExecutedAt
    });

    this.getExecutions(this.searchOptions());
  }

  /**
   * Update the order of executions based on the selected option
   * 
   * @param event The change event from the order select element
   */
  protected updateOrder(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newExecutedAt = target.value as OrderDirection;

    this.searchOptions.set({
      ...this.searchOptions(),
      page: 1,
      executedAt: newExecutedAt
    });

    this.getExecutions(this.searchOptions());
  }

  /**
   * Fetch the execution history based on the search options
   *
   * @param searchOptions The options to filter the executions
   */
  private getExecutions(searchOptions: OptionsSearchExecutionDto) {
    this.executionService.getExecutions(
      this.experimentService.currentExperiment()!.id,
      searchOptions
    );
  }
}