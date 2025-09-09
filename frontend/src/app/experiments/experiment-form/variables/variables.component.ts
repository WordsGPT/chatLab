import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CollapseModule } from 'ngx-bootstrap/collapse';

import { VARIABLE_TYPE_LABELS } from '@experiments/constants/variable-type-labels';
import { VARIABLE_TO_VALIDATION_MAP } from '@experiments/constants/variable-to-validation-map';
import { VariableType } from '@experiments/enums/variable-type.enum';

// This component handles the dynamic form fields for experiment variables
// It allows users to add, remove, and configure variables for the experiment
@Component({
  selector: 'experiment-variables',
  standalone: true,
  imports: [CollapseModule, NgClass, ReactiveFormsModule],
  templateUrl: './variables.component.html',
  styleUrl: './variables.component.scss'
})
export class VariablesComponent {

  // Inputs from the parent form
  readonly parentForm = input.required<FormGroup>();
  readonly submitted = input.required<boolean>();

  // Injecting dependencies
  private readonly fb = inject(FormBuilder);

  // Properties for managing variable states
  protected isVariableOpen: boolean[] = [false];
  protected readonly variableTypeLabels = VARIABLE_TYPE_LABELS;
  protected readonly variableType = VariableType;

  /**
   * Getter for the variables form array
   */
  protected get variables(): FormArray {
    return this.parentForm().get('variables') as FormArray;
  }

  /**
   * Getter for the variable types, mapping their real values with a user-friendly label
   */
  protected get variableTypes() {
    return Object.entries(this.variableTypeLabels).map(([value, label]) => ({
      value,
      label,
    }));
  }

  /**
   * Getter for the variable type at a specific index
   * Used in the conditional rendering of variable-specific  validations fields
   *
   * @param i The index of the variable
   */
  protected getVariableType(i: number) {
    return this.variables.at(i).get('type')?.value;
  }

  /**
   * Getter for the properties form array at a specific variable index
   *
   * @param variableIndex The index of the variable
   */
  protected getPropertiesArray(variableIndex: number): FormArray {
    return this.variables.at(variableIndex).get('validations.properties') as FormArray;
  }

  /**
   * Adds a new variable to the form
   */
  protected addVariable(): void {
    this.isVariableOpen.push(false);
    this.variables.push(
      this.fb.group({
        name: ['', Validators.required],
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
    );
  }

  /**
   * Adds a new property to a variable's validation schema
   * 
   * @param variableIndex The index of the variable
   */
  protected addProperty(variableIndex: number): void {
    this.getPropertiesArray(variableIndex).push(this.fb.control(''));
  }

  /**
   * Removes a variable from the form¨
   * 
   * @param index The index of the variable
   */
  protected removeVariable(index: number): void {
    this.variables.removeAt(index);
    this.isVariableOpen.splice(index, 1);
  }

  /**
   * Removes a property from a variable's validation schema
   * 
   * @param variableIndex The index of the variable
   * @param propertyIndex The index of the property
   */
  protected removeProperty(variableIndex: number, propertyIndex: number): void {
    this.getPropertiesArray(variableIndex).removeAt(propertyIndex);
  }

  /**
   * Handles changes to the variable type
   * If the variable type changes, the validation schema is updated accordingly.
   *
   * @param index The index of the variable
   */
  protected onVariableTypeChange(index: number): void {
    const variableGroup = this.variables.at(index) as FormGroup;
    const type = variableGroup.get('type')!.value as VariableType;
    const validations = variableGroup.get('validations') as FormGroup;

    const description = validations.get('description')!.value;
    const required = validations.get('required')!.value;

    validations.reset({
      type: VARIABLE_TO_VALIDATION_MAP[type],
      description,
      required,
      minLength: '',
      maxLength: '',
      format: '',
      pattern: '',
      minimum: '',
      maximum: '',
      exclusiveMinimum: '',
      exclusiveMaximum: '',
      items: '',
      minItems: '',
      maxItems: '',
      uniqueItems: '',
      properties: '',
      minProperties: '',
      maxProperties: ''
    });
  }

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

  /**
   * Toggles the collapse state of a variable
   * 
   * @param index The index of the variable
   */
  protected toggleVariableCollapse(index: number): void {
    this.isVariableOpen[index] = !this.isVariableOpen[index];
  }
}
