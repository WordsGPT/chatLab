import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { ExecutionService } from '@core/services/execution.service';
import { ExperimentService } from '@core/services/experiment.service';

import { CardExecutionHistoryComponent } from '@shared/components/card-execution-history/card-execution-history.component';

// This component displays a lightweight history of executions for a specific experiment
// It fetches temporal executions on init and resets them on destroy unless navigating to settings
@Component({
  selector: 'app-executions-history-lite',
  standalone: true,
  imports: [CardExecutionHistoryComponent, NgbPaginationModule],
  templateUrl: './executions-history-lite.component.html',
  styleUrl: './executions-history-lite.component.scss'
})
export class ExecutionsHistoryLiteComponent implements OnInit {

  // Injecting dependencies
  private readonly executionService = inject(ExecutionService);
  private readonly experimentService = inject(ExperimentService);
  private readonly router = inject(Router);

  // Properties to hold temporal executions and the current experiment
  protected readonly temporalExecutions = this.executionService.temporalExecutions;
  protected readonly executions = this.executionService.executions;
  protected readonly currentExperiment = this.experimentService.currentExperiment;

  protected fromRoute?: string;

  // Constructor to initialize the fromRoute property based on navigation state
  constructor() {
    const nav = this.router.getCurrentNavigation();
    this.fromRoute = nav?.extras.state?.['from'] ?? '/';
  }

  // Lifecycle hook to fetch executions when the component is initialized
  ngOnInit(): void {
    if (!this.fromRoute?.includes('/settings')) {
      this.executionService.getTemporalExecutions(this.currentExperiment()!.id);
      this.executionService.getExecutions(this.currentExperiment()!.id);
    }
  }

  /**
   * Runs all executions for the current experiment
   */
  protected runAll(): void {
    this.executionService.runAll(this.currentExperiment()!.id, this.currentExperiment()!.models, this.currentExperiment()!.llmConfigs);
  }

  /**
   * Download the executions as an Excel file
   * Uses the current experiment's ID and prompts to download the Excel file
   */
  protected downloadExcel(): void {
    this.executionService.downloadExcel(this.currentExperiment()!.id, this.currentExperiment()!.prompts);
  }

  /**
   * Handles the click event for the "View All" button.
   * @param event The click event.
   */
  protected viewAll(event: Event) {
    event.stopPropagation();
    this.router.navigateByUrl('/experiment/history', {
      state: { from: this.router.url }
    });
  }
}