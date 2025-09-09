import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

import { environment } from '@env/environment';

import { ORIGIN } from '@core/constants/http-context-token';

import { LlmModelDto } from '@experiments/interfaces/model-dto.interface';

// This service manages the retrieval of LLM models from the backend
@Injectable({
  providedIn: 'root'
})
export class ModelService {

  // Injecting dependencies
  private readonly http = inject(HttpClient);

  // URLs for the backend server
  private readonly serverUrl = environment.BACKEND_URI;
  private readonly modelUrl = `${this.serverUrl}/llm-model`;

  // Signal to manage the state of LLM models
  private readonly _models = signal<LlmModelDto[]>([]);
  readonly models = this._models.asReadonly();

  /** GET */

  /** 
   * Get available models from the proxy 
  */
  getLlmModels(): void {
    const url = `${this.modelUrl}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ModelService');

    this.http.get<LlmModelDto[]>(url, { context })
      .subscribe((response) => {
        this._models.set(response);
      });
  }
}
