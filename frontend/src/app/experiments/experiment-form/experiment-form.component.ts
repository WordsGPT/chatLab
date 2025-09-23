import { Component, effect, inject, OnDestroy, Signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { ExperimentService } from '@core/services/experiment.service';

import { VariableType } from '@experiments/enums/variable-type.enum';
import { CreateVariable } from '@experiments/interfaces/create-variable.interface';
import { CreatePrompt } from '@experiments/interfaces/create-prompt.interface';
import { LlmSelectorComponent } from '@experiments/experiment-form/llm-selector/llm-selector.component';
import { LlmConfigurationComponent } from '@experiments/experiment-form/llm-configuration/llm-configuration.component';
import { PromptsComponent } from '@experiments/experiment-form/prompts/prompts.component';
import { VariablesComponent } from '@experiments/experiment-form/variables/variables.component';

// This component handles the experiment form
// It allows users to create and configure experiments with various settings
@Component({
  selector: 'app-experiment-form',
  standalone: true,
  imports: [
    LlmSelectorComponent, 
    LlmConfigurationComponent,
    NgClass,
    PromptsComponent,
    ReactiveFormsModule, 
    VariablesComponent
  ],
  templateUrl: './experiment-form.component.html',
  styleUrl: './experiment-form.component.scss'
})
export class ExperimentFormComponent implements OnDestroy {

  // Injecting dependencies
  private readonly fb = inject(FormBuilder);
  private readonly experimentService = inject(ExperimentService);
  private readonly router = inject(Router);

  // Properties for managing experiment state
  protected readonly loading = this.experimentService.loading;
  protected readonly submitted = this.experimentService.submitted;

  protected readonly lastExperiment = this.experimentService.recentExperiments;

  protected experimentError: string | null = null;

  // Form group for the experiment
  protected experimentForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    description: [''],
    providers: [[]],
    models: [[], Validators.required],
    prompts: this.fb.array([
      this.fb.group({
        prompt: ['', Validators.required],
        promptOrder: [1, [Validators.required, Validators.min(1)]]
      })
    ]),
    variables: this.fb.array([ 
      this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        type: ['', Validators.required],
        validations: this.fb.group({
          type: ['', Validators.required],
          description: [''],
          minLength: [''],
          maxLength: [''],
          format: [''],
          pattern: [''],
          minimum: [''],
          maximum: [''],
          exclusiveMinimum: [''],
          exclusiveMaximum: [''],
          items: [''],
          minItems: [''],
          maxItems: [''],
          uniqueItems: [''],
          properties: [''],
          minProperties: [''],
          maxProperties: [''],
          required: [false]
        })
      })
    ]),
    llmConfig: this.fb.group({
      temperature: [1, [Validators.required, Validators.min(0), Validators.max(2)]],
      top_p: [1, [Validators.required, Validators.min(0), Validators.max(1)]],
      max_tokens: [4096, [Validators.required, Validators.min(1)]],
    })
  });

  // Constructor that uses effects to reset the model field if providers change
  constructor() {
    effect(() => {
      this.selectedProviders();
      this.experimentForm.get('models')?.reset();
    });
  }

  // Lifecycle hook to cancel any possible submission during the component's lifecycle
  ngOnDestroy(): void {
    this.experimentService.cancelSubmit();
  }

  /** 
   * Selected providers signal 
   * This signal tracks the selected providers from the form and transforms the value into a signal
   */
  protected selectedProviders: Signal<string[]> = toSignal(
    this.experimentForm.get('providers')!.valueChanges.pipe(
      map(value => value ?? [])
    ),
    { initialValue: [] }
  )!;

  /**
   * Form submission handler
   * Submits the form to the backend API if experimentForm is valid
   * Cleans the validations object by removing empty or null values
   * Transforms comma-separated strings into arrays for the field properties from validation
   */
  protected async onSubmit(): Promise<void> {
    this.experimentError = null;
    this.experimentService.submit();

    if (this.experimentForm.invalid) {
      this.experimentError = 'Please complete all fields correctly.';
      return;
    }

    const formValue = this.experimentForm.value;

    const prompts: CreatePrompt[] = (formValue.prompts || []).map(p => ({
      prompt: p.prompt!,
      promptOrder: p.promptOrder!,
    }));

    const variables: CreateVariable[] = (formValue.variables || []).map(v => ({
      name: v.name!,
      type: v.type! as VariableType,
      validations: this.cleanValidations(v.validations)
    }));

    const payload = {
      name: formValue.name!,
      description: formValue.description ?? undefined,
      llmConfig: {
        temperature: formValue.llmConfig!.temperature!,
        top_p: formValue.llmConfig!.top_p!,
        max_tokens: formValue.llmConfig!.max_tokens!
      },
      models: formValue.models!,
      prompts,
      variables
    };

    await this.experimentService.createExperiment(payload);
    this.resetForm();
  }

  /**
   * Submits the form and navigates to the experiment list page
   */
  protected async onSubmitAndGo(): Promise<void> {
    if (this.experimentForm.invalid) {
      this.experimentError = null;
      this.experimentService.submit();
      this.experimentError = 'Please complete all fields correctly.';
      return;
    }
    await this.onSubmit();
    await this.experimentService.getExperiment(this.lastExperiment()[0].id);
    this.router.navigateByUrl('/experiment');
  }

  /**
   * Check if a form field is invalid
   * 
   * @param controlName The name of the form control
   * @param errorName The name of the error to check
   * @returns True if the field is invalid, false otherwise
   */
  protected isFieldInvalid(controlName: string, errorName: string): boolean | undefined {
    const control = this.experimentForm.get(controlName);
    return !!(control?.hasError(errorName));
  }

  /**
   * Resets the form to its initial state
   */
  private resetForm(): void {
    this.experimentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      description: [''],
      providers: [[]],
      models: [[], Validators.required],
      prompts: this.fb.array([
        this.fb.group({
          prompt: ['', Validators.required],
          promptOrder: [1, [Validators.required, Validators.min(1)]]
        })
      ]),
      variables: this.fb.array([ 
        this.fb.group({
          name: ['', [Validators.required, Validators.maxLength(100)]],
          type: ['', Validators.required],
          validations: this.fb.group({
            type: ['', Validators.required],
            description: [''],
            minLength: [''],
            maxLength: [''],
            format: [''],
            pattern: [''],
            minimum: [''],
            maximum: [''],
            exclusiveMinimum: [''],
            exclusiveMaximum: [''],
            items: [''],
            minItems: [''],
            maxItems: [''],
            uniqueItems: [''],
            properties: [''],
            minProperties: [''],
            maxProperties: [''],
            required: [false]
          })
        })
      ]),
      llmConfig: this.fb.group({
        temperature: [1, [Validators.required, Validators.min(0), Validators.max(2)]],
        top_p: [1, [Validators.required, Validators.min(0), Validators.max(1)]],
        max_tokens: [4096, [Validators.required, Validators.min(1)]],
      })
    });
  }

  /**
   * Cleans the validations object by removing empty or null values
   * Transforms comma-separated strings into arrays for the field properties from validation
   *
   * @param validations - The validations object to transform
   * @returns The transformed validations object
   */
  private cleanValidations(validations: any): any {
    if (!validations) return {};
    
    return Object.fromEntries(
      Object.entries(validations)
        .filter(([_, value]) => {
          if (value === null || value === undefined) return false;
          if (typeof value === 'string') return value.trim() !== '';
          if (Array.isArray(value)) return value.length > 0;
          if (typeof value === 'boolean') return true;
          if (typeof value === 'number') return true;
          return true;
        })
        .map(([key, value]) => {
        if (key === 'properties' && typeof value === 'string') {
          const objectValue = this.stringToObject(value);
          return [key, objectValue];
        }
        return [key, value];
      })
    );
  }

  /**
   * Transforms a comma-separated string into an array of strings
   *
   * @param value - The comma-separated string to transform
   * @returns An object with the property names as keys and empty objects as values
   */
  private stringToObject(value: string): Record<string, {}> {
    if (!value) return {};
  
    const propertyNames = value
      .split(',')
      .map(s => s.trim())
      .filter(s => s !== '');
    
    return Object.fromEntries(
      propertyNames.map(name => [name, {}])
    );
  }
}
