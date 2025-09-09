import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ExperimentService } from '@core/services/experiment.service';
import { SearchExperimentsDto } from '@experiments/interfaces/search-experiments-dto.interface';

// This component displays the history cards of experiments
// It allows users to view and manage their experiment history
@Component({
  selector: 'card-experiment-history',
  standalone: true,
  imports: [NgClass],
  templateUrl: './card-experiment-history.component.html',
  styleUrl: './card-experiment-history.component.scss'
})
export class CardExperimentHistoryComponent {

  // Inputs from the parent form
  readonly experiments = input.required<SearchExperimentsDto[]>();
  readonly showDescription = input.required<boolean>();
  readonly history = input<boolean>();

  // Injecting dependencies
  protected readonly experimentService = inject(ExperimentService);
  protected readonly router = inject(Router);

  /**
   * Toggles the featured status of an experiment
   * @param experiment The experiment to toggle
   */
  toggleFeatured(experiment: SearchExperimentsDto): void {
    this.experimentService.toggleFeatured(experiment, this.history());
  }

  /**
   * Deletes an experiment
   * @param experiment The experiment to delete
   */
  deleteExperiment(experiment: SearchExperimentsDto): void {
    this.experimentService.deleteExperiment(experiment, this.history());
  }

  /**
   * Navigates to the experiment details page
   * @param experiment The experiment to view
   */
  async goToExperiment(experiment: SearchExperimentsDto): Promise<void> {
    await this.experimentService.getExperiment(experiment.id);
    this.router.navigate(['/experiment'], {
      state: { from: this.router.url }
    });
  }

  /**
   * Navigates to the experiment history page
   * @param experiment The experiment to view
   */
  async goToHistory(experiment: SearchExperimentsDto): Promise<void> {
    await this.experimentService.getExperiment(experiment.id);
    this.router.navigate(['/experiment/history'], {
      state: { from: this.router.url }
    });
  }
}
