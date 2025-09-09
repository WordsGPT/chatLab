import { Component, input } from '@angular/core';

import { VARIABLE_TYPE_LABELS } from '@experiments/constants/variable-type-labels';
import { CreateVariable } from '@experiments/interfaces/create-variable.interface';
import { LlmConfig } from '@experiments/interfaces/llm-config.interface';

import { SearchExperimentDto } from '@experiments/interfaces/search-experiment-dto.interface';

// This component provides an introduction to the experiment execution process
// It guides users through the steps of executing an experiment
@Component({
  selector: 'app-executions-intro',
  standalone: true,
  imports: [],
  templateUrl: './executions-intro.component.html',
  styleUrl: './executions-intro.component.scss'
})
export class ExecutionsIntroComponent {

  // Inputs from the parent form
  readonly currentExperiment = input.required<SearchExperimentDto>();

  // Properties for variable type labels
  protected readonly variableTypeLabels = VARIABLE_TYPE_LABELS;

  /**
   * Get the validation entries for a variable
   * Also converts the validation properties into a more readable format
   * And eliminates any undefined values and the description and the type validation
   *
   * @param validations - The validations object for the variable
   * @returns An array of validation entries
   */
  getValidationEntries(validations: CreateVariable['validations']) {
    return Object.entries(validations)
      .map(([key, value]) => {
        if (key === 'properties' && typeof value === 'object' && value !== null) {
          return [key, Object.keys(value).join(', ')];
        }
        return [key, value];
      })
      .filter(([key, value]) => value !== undefined && key !== 'description' && key !== 'type');
  }

  /**
   * Get the configuration entries for a variable
   *
   * @param configurations - The configurations object for the variable
   * @returns An array of configuration entries
   */
  getConfigurationEntries(configurations: LlmConfig) {
    return Object.entries(configurations)
      .filter(([_, value]) => value !== undefined);
  }
}
