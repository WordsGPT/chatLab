import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@env/environment';

import { ORIGIN } from '@core/constants/http-context-token';

import { SearchPromptDto } from '@experiments/interfaces/search-prompt-dto.interface';

// This service handles prompt-related operations
@Injectable({
  providedIn: 'root'
})
export class PromptService {

  // Injecting dependencies
  private readonly http = inject(HttpClient);

  // URLs for the backend server
  private readonly serverUrl = environment.BACKEND_URI;
  private readonly promptUrl = `${this.serverUrl}/prompt`;

  // Signals for managing prompt state
  private readonly _recentPrompts = signal<string[]>([]);
  readonly recentPrompts = this._recentPrompts.asReadonly();

  // ------------------ HTTP Requests ------------------

  /** GET */

  /**
   * Load recent prompts from the server
   */
  loadRecentPrompts(): void {
    const url = `${this.promptUrl}/recent`;

    const context = new HttpContext()
      .set(ORIGIN, 'PromptService');

    this.http.get<SearchPromptDto[]>(url, { context })
      .subscribe((response) => {
        const prompts = response.map((item) => item.prompt);
        this._recentPrompts.set(prompts ?? []);
      });
  }

  /**
   * Load autocomplete prompts from the server
   */
  loadAutocompletePrompts(search: string): Observable<string[]> {
    if (!search || search.trim().length < 2) {
      return of(this._recentPrompts());
    }

    const url = `${this.promptUrl}/autocomplete`;

    const context = new HttpContext()
      .set(ORIGIN, 'PromptService');

    const params = new HttpParams()
      .set('search', search);

    return this.http.get<SearchPromptDto[]>(url, { context, params }).pipe(
      map((response) => response.map((item) => item.prompt))
    );
  }
}
