import { NgClass } from '@angular/common';
import { Component, inject, input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Observable, switchMap } from 'rxjs';

import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

import { PromptService } from '@core/services/prompt.service';

// This component handles the prompts section of the experiment form
// It allows users to add, remove, and manage prompts for the experiment
@Component({
  selector: 'experiment-prompts',
  standalone: true,
  imports: [NgClass, NgbTypeaheadModule, ReactiveFormsModule],
  templateUrl: './prompts.component.html',
  styleUrl: './prompts.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PromptsComponent implements OnInit {

  // Inputs from the parent form
  readonly parentForm = input.required<FormGroup>();
  readonly submitted = input.required<boolean>();

  // Injecting dependencies
  private readonly fb = inject(FormBuilder);
  private promptService = inject(PromptService);

  // Formatter for displaying prompts in the typeahead
  formatter = (p: string) => p;

  // Lifecycle hook for component initialization
  ngOnInit(): void {
    this.promptService.loadRecentPrompts();
  }

  /**
   * Getter for the prompts FormArray
   */
  protected get prompts(): FormArray {
    return this.parentForm().get('prompts') as FormArray;
  }

  /**
   * Adds a new prompt FormGroup to the prompts FormArray
   */
  protected addPrompt(): void {
    const promptGroup = this.fb.group({
      prompt: ['', Validators.required],
      promptOrder: [this.prompts.length + 1, [Validators.required, Validators.min(1)]]
    });
    this.prompts.push(promptGroup);
  }

  /**
   * Removes a prompt FormGroup from the prompts FormArray
   * 
   * @param index The index of the prompt to remove
   */
  protected removePrompt(index: number): void {
    this.prompts.removeAt(index);
    this.prompts.controls.forEach((ctrl, i) => ctrl.get('promptOrder')?.setValue(i + 1));
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
   * Search for prompts based on user input
   *
   * @param text$ - The observable stream of user input text
   * @returns An observable stream of matching prompt strings
   */
  protected searchPrompts = (text$: Observable<string>): Observable<string[]> => {
    return text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.promptService.loadAutocompletePrompts(term))
    );
  };
}
