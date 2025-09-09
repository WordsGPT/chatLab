import { Component, computed, inject, input, OnInit, Signal, ViewEncapsulation } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';
import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'ngx-bootstrap-multiselect';

import { ModelService } from '@core/services/model.service';
import { ProviderService } from '@core/services/provider.service';

// This component allows users to select LLM providers and models
// It uses the ngx-bootstrap-multiselect library for the selection UI
@Component({
  selector: 'experiment-llm-selector',
  standalone: true,
  imports: [NgxBootstrapMultiselectModule, ReactiveFormsModule],
  templateUrl: './llm-selector.component.html',
  styleUrl: './llm-selector.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class LlmSelectorComponent implements OnInit {

  // Inputs from the parent form
  readonly parentForm = input.required<FormGroup>();
  readonly selectedProviders = input.required<string[]>();
  readonly submitted = input.required<boolean>();

  // Injecting dependencies
  private readonly modelService = inject(ModelService);
  private readonly providerService = inject(ProviderService);

  // Properties for managing providers and models
  protected readonly providers = this.providerService.providers;
  protected readonly models = this.modelService.models;
  
  // Lifecycle hook for component initialization
  ngOnInit(): void {
    this.providerService.getLlmProviders();
    this.modelService.getLlmModels();
  }

  // Settings for the multi-select dropdowns
  protected mySettings: IMultiSelectSettings = {
    enableSearch: true,
    buttonClasses: 'form-control',
    containerClasses: 'form-control',
    showCheckAll: true,
    showUncheckAll: true,
    dynamicTitleMaxItems: 3,
    stopScrollPropagation: true,
    displayAllSelectedText: true,
  };

  // Texts for the multi-select dropdowns
  protected myTexts: IMultiSelectTexts = {
    defaultTitle: 'Select',
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'Item selected',
    checkedPlural: 'Items selected',
    searchPlaceholder: 'Find',
    searchEmptyResult: 'Loading...',
  };

  // Options for the provider multi-select dropdown
  protected providerOptions: Signal<IMultiSelectOption[]> = computed(() =>{
    return this.providers().map(p => ({
      id: p.name,
      name: p.name,
    }));
  });

  // Options for the model multi-select dropdown, dependent on selected providers
  protected modelOptions: Signal<IMultiSelectOption[]> = computed(() => {
    const selected = this.selectedProviders() ?? [];
    const allModels = this.models();

    if (!selected.length) {
      return allModels.map(model => ({
        id: model.name,
        name: model.name,
      }));
    }
    
    return allModels
      .filter(m => selected.includes(m.providerName))
      .map(model => ({
        id: model.name,
        name: model.name,
      }));
  });

  /**
   * Check if a form field is invalid
   * 
   * @param controlName The name of the form control
   * @param errorName The name of the error to check
   * @returns True if the field is invalid, false otherwise
   */
  protected isFieldInvalid(controlName: string, errorName: string): boolean | undefined {
    const control = this.parentForm().get(controlName);
    return !!(control?.hasError(errorName));
  }
}
