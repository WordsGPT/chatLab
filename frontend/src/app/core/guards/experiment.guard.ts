import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ExperimentService } from '@core/services/experiment.service';

// This guard checks if an experiment is currently selected
export const experimentGuard: CanActivateFn = () => {

  // Injecting dependencies
  const experimentService = inject(ExperimentService);
  const router = inject(Router);

  // Check if an experiment is currently selected
  if (!experimentService.currentExperiment()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};