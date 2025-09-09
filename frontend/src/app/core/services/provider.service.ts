import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

import { environment } from '@env/environment';

import { ORIGIN } from '@core/constants/http-context-token';

import { LlmProviderDto } from '@experiments/interfaces/provider-dto.interface';

// This service manages the retrieval of LLM providers from the backend
@Injectable({
  providedIn: 'root'
})
export class ProviderService {

  // Injecting dependencies
  private readonly http = inject(HttpClient);

  // URLs for the backend server
  private readonly serverUrl = environment.BACKEND_URI;
  private readonly providerUrl = `${this.serverUrl}/llm-provider`;

  // Signal to manage the state of LLM providers
  private readonly _providers = signal<LlmProviderDto[]>([]);
  readonly providers = this._providers.asReadonly();

  /** GET */

  /** 
   * Get available models from the proxy 
  */
  getLlmProviders(): void {
    const url = `${this.providerUrl}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ProviderService');

    this.http.get<LlmProviderDto[]>(url, { context })
      .subscribe((response) => {
        this._providers.set(response);
      });
  }
}
