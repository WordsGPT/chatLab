import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { toast } from 'ngx-sonner';

import { environment } from '@env/environment';

import { ORIGIN } from '@core/constants/http-context-token';

import { SearchExperimentsDto } from '@experiments/interfaces/search-experiments-dto.interface';
import { CreateExperimentDto } from '@experiments/interfaces/create-experiment-dto.interface';
import { SearchExperimentDto } from '@experiments/interfaces/search-experiment-dto.interface';
import { OptionsSearchExperimentDto } from '@experiments/interfaces/options-search-experiment.interface';

// This service manages experiments, including creating, retrieving, and deleting experiments
@Injectable({
  providedIn: 'root'
})
export class ExperimentService {

  // Injecting dependencies
  private readonly http = inject(HttpClient);

  // URLs for the backend server
  private readonly serverUrl = environment.BACKEND_URI;
  private readonly experimentUrl = `${this.serverUrl}/experiment`;

  // Signals to manage experiment state
  private readonly _currentExperiment = signal<SearchExperimentDto | null>(null);
  private readonly _totalExperiments = signal(0);
  private readonly _experiments = signal<SearchExperimentsDto[]>([]);
  private readonly _recentExperiments = signal<SearchExperimentsDto[]>([]);
  private readonly _featuredExperiments = signal<SearchExperimentsDto[]>([]);
  private readonly _loading = signal(false);
  private readonly _submitted = signal(false);

  readonly currentExperiment = this._currentExperiment.asReadonly();
  readonly totalExperiments = this._totalExperiments.asReadonly();
  readonly experiments = this._experiments.asReadonly();
  readonly recentExperiments = this._recentExperiments.asReadonly();
  readonly featuredExperiments = this._featuredExperiments.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly submitted = this._submitted.asReadonly();

  readonly LIMIT_PER_PAGE = 20;

  // ------------------ HTTP Requests ------------------

  /** GET */

  /**
   * Get an individual experiment by ID
   *
   * @param id The ID of the experiment to retrieve
   */
  async getExperiment(id: string): Promise<void> {
    const url = `${this.experimentUrl}/${id}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExperimentService');

    try {
      const response = await firstValueFrom(
        this.http.get<SearchExperimentDto>(url, { context })
      );
      this._currentExperiment.set(response);
    } catch (error) {
      console.error('Error fetching experiment:', error);
    }
  }

  /**
   * Fetch the list of experiments for the authenticated user with optional filters
   * 
   * @param options Optional search parameters
   */
  getExperimentsFiltered(options?: OptionsSearchExperimentDto): void {
    const url = `${this.experimentUrl}/all`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExperimentService');

    let params = new HttpParams()
      .set('page', options?.page?.toString() ?? '1')

    if (options?.featured !== undefined) {
      params = params.set('featured', options.featured.toString());
    }

    if (options?.lastViewed !== undefined) {
      params = params.set('lastViewed', options.lastViewed.toString());
    }

    if (options?.createdAt !== undefined) {
      params = params.set('createdAt', options.createdAt.toString());
    }

    this.http.get<{ experiments: SearchExperimentsDto[]; total: number }>(url, { context, params })
      .subscribe((response) => {
        this._experiments.set(response.experiments);
        this._totalExperiments.set(response.total);
      });
  }

  /**
   * Get the last 10 featured experiments for the authenticated user
   */
  getFeaturedExperiments(): void {
    const url = `${this.experimentUrl}/featured`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExperimentService');

    this.http.get<SearchExperimentsDto[]>(url, { context })
      .subscribe((response) => {
        this._featuredExperiments.set(response);
      });
  }

  /**
   * Get the last 10 recent experiments for the authenticated user
   */
  getRecentExperiments(): void {
    const url = `${this.experimentUrl}/recent`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExperimentService');

    this.http.get<SearchExperimentsDto[]>(url, { context })
      .subscribe((response) => {
        this._recentExperiments.set(response);
      });    
  }

  /**
   * Download the JSON schema of a specific experiment by its ID
   * 
   * @param experimentId The ID of the experiment
   */
  downloadJsonSchema(experimentId: string): void {
    const url = `${this.experimentUrl}/schema/${experimentId}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExperimentService');

    this.http.get(url, { context, responseType: 'blob' })
      .subscribe((response) => {
        const blob = new Blob([response], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `schema_${experimentId}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }
  

  /** POST */

  /**
   * Create a new experiment
   * Converts the response to promise for await/async usage
   *
   * @param createExperimentDto The data for the new experiment
   */
  async createExperiment(createExperimentDto: CreateExperimentDto): Promise<void> {
    const url = `${this.experimentUrl}/create`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExperimentService');

    this._loading.set(true);

    try {
      const response = await firstValueFrom(
        this.http.post<{ message: string, experiment: SearchExperimentsDto }>(url, createExperimentDto, { context })
          .pipe(finalize(() => this._loading.set(false)))
      );

      this._submitted.set(false);
      this._recentExperiments.set([response.experiment, ...this._recentExperiments()]);
      toast.success(response.message);
    } catch (error) {
      this._loading.set(false);
    }
  }

  /** PATCH */

  /**
   * Update the featured status of an experiment
   * Updates the UI and state management after the update
   *
   * @param experiment The experiment to update
   * @param historial Boolean indicating if the experiment is from historial or home
   */
  toggleFeatured(experiment: SearchExperimentsDto, historial: boolean = false): void {
    const url = `${this.experimentUrl}/featured/update/${experiment.id}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExperimentService');

    this.http.patch<{ message: string }>(url, {}, { context })
      .subscribe((response) => {
        if (historial) {
          this._experiments.set(this._experiments().map(e => 
            e.id === experiment.id ? { ...e, featured: !e.featured } : e
          ));
          toast.success(response.message);
          return;
        }

        const fromSignal = experiment.featured ? this._featuredExperiments : this._recentExperiments;
        const toSignal = experiment.featured ? this._recentExperiments : this._featuredExperiments;

        const fromArray = fromSignal();
        const toArray = toSignal();

        if (fromArray.length > 6) {
          fromSignal.set(fromArray.filter(e => e.id !== experiment.id));
        } else {
          experiment.featured ? this.getFeaturedExperiments() : this.getRecentExperiments();
        }

        const updatedTo = [ { ...experiment, featured: !experiment.featured }, ...toArray ];
        toSignal.set(updatedTo);

        toast.success(response.message);
      });
  }

  /** DELETE */

  /**
   * Delete an experiment by ID
   * Updates the corresponding signal based on whether it's historial or home
   * Updates the UI and state management after deletion
   *
   * @param experiment The experiment to delete
   * @param historial Boolean indicating if the experiment is from historial or home
   */
  deleteExperiment(experiment: SearchExperimentsDto, historial: boolean = false): void {
    const url = `${this.experimentUrl}/delete/${experiment.id}`;

    const context = new HttpContext()
      .set(ORIGIN, 'ExperimentService');

    this.http.delete<{ message: string }>(url, { context })
      .subscribe((response) => {
        if (historial) {
          this._experiments.set(this._experiments().filter(e => e.id !== experiment.id));
          toast.success(response.message);
          return;
        }

        const targetSignal = experiment.featured ? this._featuredExperiments : this._recentExperiments;
        const targetArray = targetSignal();

        if (targetArray.length > 6) {
          targetSignal.set(targetArray.filter(e => e.id !== experiment.id));
        } else {
          experiment.featured ? this.getFeaturedExperiments() : this.getRecentExperiments();
        }

        toast.success(response.message);
      });
  }

  // ------------------ Auxiliary Methods --------------

  /**
   * Indicate if the experiment form has been submitted
   */
  submit(): void {
    this._submitted.set(true);
  }

  /**
   * Cancel the form submission
   */
  cancelSubmit(): void {
    this._submitted.set(false);
  }
}