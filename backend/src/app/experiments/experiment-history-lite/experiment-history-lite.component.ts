import { Component, inject } from '@angular/core';
import { ExperimentService } from '@core/services/experiment.service';

import { CardExperimentHistoryComponent } from '@shared/components/card-experiment-history/card-experiment-history.component';

// This component displays the experiment history
// It shows a list of recent and featured experiments
@Component({
  selector: 'app-experiment-history-lite',
  standalone: true,
  imports: [CardExperimentHistoryComponent],
  templateUrl: './experiment-history-lite.component.html',
  styleUrl: './experiment-history-lite.component.scss'
})
export class ExperimentHistoryLiteComponent {

  // Injecting dependencies
  protected readonly experimentService = inject(ExperimentService);

  // Properties for recent and featured experiments
  protected readonly recentExperiments = this.experimentService.recentExperiments;
  protected readonly featuredExperiments = this.experimentService.featuredExperiments;

}
