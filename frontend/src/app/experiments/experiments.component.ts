import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AccordionModule } from 'ngx-bootstrap/accordion';

import { ExperimentService } from '@core/services/experiment.service';

import { ExperimentIntroComponent } from '@experiments/experiment-intro/experiment-intro.component';
import { ExperimentFormComponent } from '@experiments/experiment-form/experiment-form.component';
import { ExperimentHistoryLiteComponent } from '@experiments/experiment-history-lite/experiment-history-lite.component';

// This component manages the overall experiment creation process
@Component({
  selector: 'app-experiments',
  standalone: true,
  imports: [AccordionModule, ExperimentIntroComponent, ExperimentFormComponent, ExperimentHistoryLiteComponent],
  templateUrl: './experiments.component.html',
  styleUrl: './experiments.component.scss'
})
export class ExperimentsComponent implements OnInit {

  // Injecting dependencies
  protected readonly experimentService = inject(ExperimentService);
  private readonly router = inject(Router);

  // Properties for recent and featured experiments
  protected readonly recentExperiments = this.experimentService.recentExperiments;
  protected readonly featuredExperiments = this.experimentService.featuredExperiments;

  // Lifecycle hook for component initialization
  ngOnInit(): void {
    this.experimentService.getFeaturedExperiments();
    this.experimentService.getRecentExperiments();
  }

  /**
   * Handles the click event for the "View All" button.
   * @param event The click event.
   */
  viewAll(event: Event) {
    event.stopPropagation();
    this.router.navigateByUrl('/history', {
      state: { from: this.router.url }
    });
  }
}
