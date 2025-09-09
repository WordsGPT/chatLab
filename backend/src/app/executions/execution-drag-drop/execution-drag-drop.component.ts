import { Component, inject, input, signal } from '@angular/core';

import { ExecutionService } from '@core/services/execution.service';
import { ExperimentService } from '@core/services/experiment.service';

import { SearchExperimentDto } from '@experiments/interfaces/search-experiment-dto.interface';

// This component allows users to drag and drop a JSON file to create executions for the current experiment.
@Component({
  selector: 'app-execution-drag-drop',
  standalone: true,
  imports: [],
  templateUrl: './execution-drag-drop.component.html',
  styleUrl: './execution-drag-drop.component.scss'
})
export class ExecutionDragDropComponent {

  // Input from parent component
  readonly currentExperiment = input.required<SearchExperimentDto>();
  
  // Injecting dependencies
  private readonly executionService = inject(ExecutionService);
  private readonly experimentService = inject(ExperimentService);

  // Signals to manage state
  protected readonly loading = this.executionService.loading;

  protected file = signal<File | null>(null);
  protected isDragOver = signal<boolean>(false);

  /**
   * Handle file drop event
   * 
   * @param event DragEvent 
   */
  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type === 'application/json') {
      this.file.set(file);
    }
  }

  /**
   * Handle drag over event
   * 
   * @param event DragEvent
   */
  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  /**
   * Handle drag leave event
   * 
   * @param event DragEvent
   */
  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  /**
   * Handle file selection via input element
   * 
   * @param event Event
   */
  protected onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && file.type === 'application/json') {
      this.file.set(file);
    }
  }

  /**
   * Remove selected file
   * 
   * @param event Event
   */
  protected removeFile(event: Event): void {
    event.stopPropagation();
    this.file.set(null);
  }

  /**
   * Create executions by uploading the selected file
   */
  protected createExecutions() {
    if (this.file()) {
      this.executionService.uploadExecutions(
        this.file()!,
        this.currentExperiment().prompts,
        this.currentExperiment().id
      );
      this.file.set(null);
    }
  }

  /**
   * Download JSON schema for the current experiment
   */
  protected downloadSchema() {
    this.experimentService.downloadJsonSchema(this.currentExperiment().id);
  }
}