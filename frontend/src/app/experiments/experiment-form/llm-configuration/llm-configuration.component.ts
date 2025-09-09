import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CollapseModule } from 'ngx-bootstrap/collapse';

// This component manages the configuration settings for LLMs
// It uses CollapseModule from ngx-bootstrap for the collapsible of the section
@Component({
  selector: 'experiment-llm-configuration',
  standalone: true,
  imports: [CollapseModule, NgClass, ReactiveFormsModule],
  templateUrl: './llm-configuration.component.html',
  styleUrl: './llm-configuration.component.scss'
})
export class LlmConfigurationComponent {

  // Inputs from the parent form
  readonly parentForm = input.required<FormGroup>();
  readonly submitted = input.required<boolean>();

  // State for the visibility of the LLM configuration
  protected isLlmConfigOpen = false;

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
