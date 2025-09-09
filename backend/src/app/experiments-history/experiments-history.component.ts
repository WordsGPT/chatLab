import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { OrderDirection } from '@core/enums/order-direction.enum';
import { ExperimentService } from '@core/services/experiment.service';

import { OptionsSearchExperimentDto } from '@experiments/interfaces/options-search-experiment.interface';

import { CardExperimentHistoryComponent } from '@shared/components/card-experiment-history/card-experiment-history.component';

// Component to display the history of experiments with filtering and pagination options
@Component({
  selector: 'app-experiments-history',
  standalone: true,
  imports: [CardExperimentHistoryComponent, NgbPaginationModule],
  templateUrl: './experiments-history.component.html',
  styleUrl: './experiments-history.component.scss'
})
export class ExperimentsHistoryComponent {

  // Injecting dependencies
  private readonly experimentService = inject(ExperimentService);
  private readonly router = inject(Router);

  // Properties for managing experiments history
  protected readonly experiments = this.experimentService.experiments;
  protected readonly totalExperiments = this.experimentService.totalExperiments;
  protected readonly limitExperiments = this.experimentService.LIMIT_PER_PAGE;

  protected readonly OrderDirection = OrderDirection;

  protected page = 1;

  protected readonly searchOptions = signal<OptionsSearchExperimentDto>({
    page: 1,
    featured: undefined,
    lastViewed: undefined,
    createdAt: undefined,
  });

  // Lifecycle hook for component initialization
  ngOnInit(): void {
    this.getExperiments(this.searchOptions());
  }

  /*
   * Method to navigate back to the previous route or a default route
   */
  protected goBack(): void {
    this.router.navigateByUrl('/');
  }

  /**
   * Update the page number and fetch experiments for the new page
   * 
   * @param page The new page number to navigate to
   */
  protected updatePage(page: number): void {
    this.page = page;
    this.searchOptions.set({ ...this.searchOptions(), page });
    this.getExperiments(this.searchOptions());
  }

  /**
   * Update the featured filter based on the selected option
   * 
   * @param event The change event from the featured select element
   */
  protected updateFeatured(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const prevOptions = this.searchOptions();

    switch (target.value) {
      case 'true':
        this.searchOptions.set({ ...prevOptions, page: 1, featured: true });
        break;
      case 'false':
        this.searchOptions.set({ ...prevOptions, page: 1, featured: false });
        break;
      case 'all':
        this.searchOptions.set({ ...prevOptions, page: 1, featured: undefined });
        break;
      default:
        this.searchOptions.set({ ...prevOptions, page: 1, featured: undefined });
        break;
    }

    this.getExperiments(this.searchOptions());
  }

  /**
   * Update the last viewed order based on the selected option
   * 
   * @param event The change event from the last viewed select element
   */
  protected updateLastViewed(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newLastViewed = target.value as OrderDirection;

    this.searchOptions.set({ ...this.searchOptions(), page: 1, lastViewed: newLastViewed });
    this.getExperiments(this.searchOptions());
  }

  /**
   * Update the created at order based on the selected option
   * 
   * @param event The change event from the created at select element
   */
  protected updateCreatedAt(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newCreatedAt = target.value as OrderDirection;

    this.searchOptions.set({ ...this.searchOptions(), page: 1, createdAt: newCreatedAt });
    this.getExperiments(this.searchOptions());
  }

  /**
   * Fetch experiments based on the provided search options
   * 
   * @param options The search options to filter experiments
   */
  private getExperiments(options: OptionsSearchExperimentDto): void {
    this.experimentService.getExperimentsFiltered(options);
  }

}
