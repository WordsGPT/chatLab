import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AccordionModule } from 'ngx-bootstrap/accordion';

import { ExperimentService } from '@core/services/experiment.service';

import { ExecutionsFormComponent } from '@executions/executions-form/executions-form.component';
import { ExecutionsIntroComponent } from '@executions/executions-intro/executions-intro.component';
import { ExecutionsHistoryLiteComponent } from '@executions/executions-history-lite/executions-history-lite.component';
import { ExecutionDragDropComponent } from '@executions/execution-drag-drop/execution-drag-drop.component';

// This component manages the overall execution process
@Component({
  selector: 'app-executions',
  standalone: true,
  imports: [AccordionModule, ExecutionDragDropComponent, ExecutionsFormComponent, ExecutionsHistoryLiteComponent, ExecutionsIntroComponent],
  templateUrl: './executions.component.html',
  styleUrl: './executions.component.scss'
})
export class ExecutionsComponent {

  // Injecting dependencies
  private readonly experimentService = inject(ExperimentService);
  private readonly router = inject(Router);

  // Properties for managing execution state
  protected readonly currentExperiment = this.experimentService.currentExperiment;
  protected fromRoute?: string;
  protected multipleExecutions = signal(false);

  // Constructor to initialize the route to navigate back to
  constructor() {
    const nav = this.router.getCurrentNavigation();
    this.fromRoute = nav?.extras.state?.['from'] ?? '/';
  }

  /*
   * Method to navigate back to the previous route or a default route
   */
  protected goBack(): void {
    this.router.navigateByUrl(this.fromRoute ?? '/');
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
