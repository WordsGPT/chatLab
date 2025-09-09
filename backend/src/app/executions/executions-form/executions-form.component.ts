import { NgClass } from '@angular/common';
import { Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ExecutionService } from '@core/services/execution.service';

import { ValidationVariableType } from '@experiments/enums/validation-variable-type.enum';
import { VariableType } from '@experiments/enums/variable-type.enum';
import { CreateVariable } from '@experiments/interfaces/create-variable.interface';
import { SearchExperimentDto } from '@experiments/interfaces/search-experiment-dto.interface';

// This component is responsible for rendering the form used to configure experiment executions
// It allows users to define the parameters and conditions for running experiments
@Component({
  selector: 'app-executions-form',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule],
  templateUrl: './executions-form.component.html',
  styleUrl: './executions-form.component.scss'
})
export class ExecutionsFormComponent implements OnInit, OnDestroy {

  // Inputs from the parent form
  readonly currentExperiment = input.required<SearchExperimentDto>();

  // Injecting dependencies
  private readonly fb = inject(FormBuilder);
  private readonly executionService = inject(ExecutionService);

  // Properties for managing the execution form
  protected executionForm!: FormGroup;
  protected readonly loading = this.executionService.loading;
  protected readonly submitted = this.executionService.submitted;

  protected executionError: string | null = null;

  protected readonly VariableType = VariableType;
  protected readonly ValidationVariableType = ValidationVariableType;

  // Lifecycle hook for component initialization
  ngOnInit() {
    this.buildForm();
  }

  // Lifecycle hook to cancel any possible submission during the component's lifecycle
  ngOnDestroy(): void {
    this.executionService.cancelSubmit();
  }

  /**
   * Get the FormArray control for a specific form field
   * 
   * @param name The name of the form field
   * @returns The FormArray control
   */
  protected getArrayControl(name: string): FormArray {
    return this.executionForm.get(name) as FormArray;
  }

  /**
   * Add a new control to a FormArray
   * 
   * @param name The name of the form field
   */
  protected addToArray(name: string): void {
    const variable = this.currentExperiment().variables.find(v => v.name === name);
    if (!variable) return;

    const itemType = variable.type.slice(0, -2) as ValidationVariableType;
    const initialValue = this.getInitialValue(variable.type.slice(0, -2) as VariableType);

    const newControl = new FormControl(
      initialValue,
      this.buildItemValidators(variable.validations, itemType)
    );

    this.getArrayControl(name).push(newControl);
  }

  /**
   * Remove a control from a FormArray
   * 
   * @param name The name of the form field
   * @param index The index of the control to remove
   */
  protected removeFromArray(name: string, index: number): void {
    this.getArrayControl(name).removeAt(index);
  }

  /**
   * Get the error message for a form control
   *
   * @param controlName The name of the form control
   * @returns The error message or null
   */
  protected getErrorMessage(controlName: string): string | null {
    const control = this.executionForm.get(controlName);
    if (!control || !control.errors) return null;

    const errors = control.errors;

    if (errors['required']) return 'This field is required';
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}`;
    if (errors['pattern']) return 'Invalid format';
    if (errors['email']) return 'Must be a valid email';
    if (errors['url']) return 'Must be a valid URL';
    if (errors['date']) return 'Must be a valid date';

    if (errors['exclusiveMin']) return `Value must be higher than ${errors['exclusiveMin'].min}`;
    if (errors['exclusiveMax']) return `Value must be less than ${errors['exclusiveMax'].max}`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}`;

    if (errors['minItems']) return 'Not enough items in array';
    if (errors['maxItems']) return 'Too many items in array';
    if (errors['uniqueItems']) return 'Array items must be unique';

    if (errors['invalidJson']) return 'Invalid JSON format';
    if (errors['invalidObject']) return 'Value must be a JSON object';
    if (errors['minProperties']) return `At least ${errors['minProperties'].required} properties required`;
    if (errors['maxProperties']) return `At most ${errors['maxProperties'].required} properties allowed`;
    if (errors['propertiesMismatch']) return `Missing required properties: ${errors['propertiesMismatch'].required}`;

    return 'Invalid value';
  }

  /**
   * Submit the form
   */
  protected async onSubmit(): Promise<void> {
    this.executionError = null;
    this.executionService.submit();

    if (this.executionForm.invalid) {
      this.executionError = 'Please complete all fields correctly.';
      return;
    }

    const formValue = this.executionForm.value;
    const cleanedValue: Record<string, any> = {};

    for (const variable of this.currentExperiment().variables) {
      const name = variable.name;
      const val = formValue[name];

      if (variable.type === VariableType.OBJECT) {
        cleanedValue[name] = this.normalizeObject(val);
      } else if (variable.type === VariableType.OBJECT_ARRAY) {
        cleanedValue[name] = (val as any[]).map(v => this.normalizeObject(v));
      } else {
        cleanedValue[name] = val;
      }
    }

    await this.executionService.createExecution(cleanedValue, this.currentExperiment().prompts, this.currentExperiment().id);
    this.resetForm();
  }

  /**
   * Build the form group
   * If the current experiment is not defined, the form will not be built
   * Also, if the variable is an array, it will be initialized as a FormArray
   * Else, it will be initialized as a FormControl
   * The value will be set to the initial value based on the variable type
   */
  private buildForm(): void {
    const experiment = this.currentExperiment();
    if (!experiment) return;

    const group: Record<string, any> = {};

    experiment.variables.forEach(v => {
      if (v.validations.type === ValidationVariableType.ARRAY) {
        const itemType = v.type.slice(0, -2) as ValidationVariableType;
        const initialValue = this.getInitialValue(v.type.slice(0, -2) as VariableType);
            
        const initialControl = new FormControl(
          initialValue,
          this.buildItemValidators(v.validations, itemType)
        );

        const arrayControl = new FormArray<any>([initialControl], this.buildArrayValidators(v.validations));
        group[v.name] = arrayControl;

      } else {
        const initialValue = this.getInitialValue(v.type);
        group[v.name] = new FormControl(initialValue, this.buildItemValidators(v.validations, v.validations.type));
      }
    });

    this.executionForm = this.fb.group(group);
  }

  /**
   * Build the item validators for a form control
   * The validators will be based on the variable's validations and type
   *
   * @param validations - The validations to apply
   * @param itemType - The type of the item
   * @returns An array of validator functions
   */
  private buildItemValidators(validations: CreateVariable['validations'], itemType: ValidationVariableType): ValidatorFn[] {
    const validators = [];

    if (validations.required) {
      validators.push(Validators.required);
    }
    
    switch (itemType) {
      case ValidationVariableType.STRING:
        validators.push(...this.buildStringValidators(validations));
        break;
      case ValidationVariableType.NUMBER:
        validators.push(...this.buildNumberValidators(validations));
        break;
      case ValidationVariableType.OBJECT:
        validators.push(...this.buildObjectValidators(validations));
        break;
    }
    return validators;
  }

  /**
   * Build the array validators for a form array
   *
   * @param validations - The validations to apply
   * @returns A validator function for the form array
   */
  private buildArrayValidators(validations: CreateVariable['validations']): ValidatorFn {
    return (control: AbstractControl) => {
      if (!(control instanceof FormArray)) return null;

      const arr = control.controls.map(c => c.value);
      const errors: any = {};

      if (validations.minItems !== undefined && arr.length < validations.minItems) errors.minItems = true;
      if (validations.maxItems !== undefined && arr.length > validations.maxItems) errors.maxItems = true;
      if (validations.uniqueItems && new Set(arr).size !== arr.length) errors.uniqueItems = true;

      return Object.keys(errors).length ? errors : null;
    };
  }

  /**
   * Build the string validators for a form control
   * The possible validations are: minLength, maxLength, pattern and format
   *
   * @param validations - The validations to apply
   * @returns An array of validator functions
   */
  private buildStringValidators(validations: CreateVariable['validations']): ValidatorFn[] {
    const stringValidators: ValidatorFn[] = [];
    
    if (validations.minLength !== undefined) {
      stringValidators.push(Validators.minLength(validations.minLength));
    }
    if (validations.maxLength !== undefined) {
      stringValidators.push(Validators.maxLength(validations.maxLength));
    }
    if (validations.pattern) {
      stringValidators.push(Validators.pattern(validations.pattern));
    } else if (validations.format) {
      switch (validations.format) {
        case 'email':
          stringValidators.push(Validators.email);
          break;
        case 'url':
          stringValidators.push(this.urlValidator());
          break;
        case 'date':
          stringValidators.push(this.dateValidator());
          break;
      }
    }
    return stringValidators;
  }

  /**
   * Build the number validators for a form control
   * The possible validations are: minimum, maximum, exclusiveMinimum and exclusiveMaximum
   *
   * @param validations - The validations to apply
   * @returns An array of validator functions
   */
  private buildNumberValidators(validations: CreateVariable['validations']): ValidatorFn[] {
    const numberValidators: ValidatorFn[] = [];

    if (validations.minimum !== undefined) {
      numberValidators.push(Validators.min(validations.minimum));
    }
    if (validations.maximum !== undefined) {
      numberValidators.push(Validators.max(validations.maximum));
    }
    if (validations.exclusiveMinimum !== undefined) {
      numberValidators.push(this.exclusiveMin(validations.exclusiveMinimum));
    }
    if (validations.exclusiveMaximum !== undefined) {
      numberValidators.push(this.exclusiveMax(validations.exclusiveMaximum));
    }
    return numberValidators;
  }

  /**
   * Build the object validators for a form control
   * The possible validations are: minProperties, maxProperties and properties
   *
   * @param validations - The validations to apply
   * @returns An array of validator functions
   */
  private buildObjectValidators(validations: CreateVariable['validations']): ValidatorFn[] {
    const objectValidators: ValidatorFn[] = [];

    const validator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }

      try {
        const parsedObject = JSON.parse(value);

        if (typeof parsedObject !== 'object' || Array.isArray(parsedObject)) {
          return { 'invalidObject': true };
        }

        const keys = Object.keys(parsedObject);

        if (validations.minProperties !== undefined && keys.length < validations.minProperties) {
          return { 'minProperties': { 'required': validations.minProperties, 'actual': keys.length } };
        }
        if (validations.maxProperties !== undefined && keys.length > validations.maxProperties) {
          return { 'maxProperties': { 'required': validations.maxProperties, 'actual': keys.length } };
        }
        if (validations.properties) {
          const requiredKeys = Object.keys(validations.properties);
          const hasAllRequiredKeys = requiredKeys.every(key => keys.includes(key));
          if (!hasAllRequiredKeys) {
            return { 'propertiesMismatch': { 'required': requiredKeys.join(', '), 'actual': keys.join(', ') } };
          }
        }
      } catch (e) {
        return { 'invalidJson': true };
      }

      return null;
    };

    objectValidators.push(validator);

    return objectValidators;
  }

  /**
   * Get the initial value for a form control based on its type
   *
   * @param type - The type of the variable
   * @returns The initial value for the form control
   */
  private getInitialValue(type: VariableType): '' | null {
    return type === 'string' ? '' : null;
  }

  /**
   * Validator for URL format
   *
   * @returns A validator function
   */
  private urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const urlPattern = /^(http|https):\/\/[^ "]+$/;
      return urlPattern.test(control.value) ? null : { url: true };
    };
  }

  /**
   * Validator for date format
   *
   * @returns A validator function
   */
  private dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const datePattern = /^((\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4}))$/;
      return datePattern.test(control.value) ? null : { date: true };
    };
  }

  /**
   * Validator for exclusive minimum
   *
   * @param min - The minimum value
   * @returns A validator function
   */
  private exclusiveMin(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return (value !== null && value !== '' && value <= min) ? { 'exclusiveMin': { 'min': min, 'actual': value } } : null;
    };
  }

  /**
   * Validator for exclusive maximum
   *
   * @param max - The maximum value
   * @returns A validator function
   */
  private exclusiveMax(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      return (value !== null && value !== '' && value >= max) ? { 'exclusiveMax': { 'max': max, 'actual': value } } : null;
    };
  }

  /**
   * Normalize a JSON object string by trimming whitespace from its string properties
   *
   * @param value - The JSON object string to normalize
   * @returns The normalized JSON object string
   */
  private normalizeObject(value: string): string {
    try {
      const parsed = JSON.parse(value);

      if (typeof parsed === 'object' && !Array.isArray(parsed)) {
        for (const key of Object.keys(parsed)) {
          if (typeof parsed[key] === 'string') {
            parsed[key] = parsed[key].trim();
          }
        }
        return JSON.stringify(parsed);
      }
    } catch {
      return value;
    }

    return value;
  }

  /**
   * Reset the form to its initial state
   * For simplicity in managing arrays, we rebuild the form entirely
   */
  private resetForm(): void {
    this.buildForm();
  }

}