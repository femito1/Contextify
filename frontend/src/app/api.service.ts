import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of, map } from 'rxjs';

export interface ClassificationResult {
  label: string;
  probability: number;
  likelihood: number;
}

export interface NovelSuggestions {
  similar_predefined_labels?: [string, number][];
  keyword_suggestions?: [string, number][];
}

export interface ClassificationResponse {
  success: boolean;
  results?: {
    predictions: ClassificationResult[];
    best_label: ClassificationResult;
    novel_suggestions?: NovelSuggestions;
  };
  language?: string;
  error?: string;
  spelling_suggestions?: { [key: string]: string };
}

export interface HealthResponse {
  status: string;
  version: string;
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: string[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';

  // Common categories for suggestions (as a fallback when backend doesn't provide suggestions)
  private commonCategories = [
    'arts', 'business', 'education', 'entertainment', 'environment', 
    'finance', 'food', 'health', 'lifestyle', 'music', 'news', 'politics', 
    'science', 'sports', 'technology', 'travel', 'weather', 'gaming', 
    'fashion', 'history', 'literature', 'medicine', 'movies', 'nature',
    'philosophy', 'photography', 'religion', 'shopping', 'social media',
    'television', 'theater', 'wildlife', 'cooking', 'cars', 'space',
    'mathematics', 'programming', 'psychology', 'economy', 'geography'
  ];

  constructor(private http: HttpClient) { }

  classifyText(text: string, labels: string[]): Observable<ClassificationResponse> {
    return this.http.post<ClassificationResponse>(`${this.apiUrl}/classify`, { text, labels })
      .pipe(
        catchError(this.handleError)
      );
  }

  checkHealth(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(`${this.apiUrl}/health`)
      .pipe(
        catchError(this.handleError)
      );
  }

  suggestLabels(partialInput: string, textContext: string = ''): Observable<string[]> {
    if (!partialInput || partialInput.length < 2) {
      return of(this.commonCategories.slice(0, 15));
    }

    let params = new HttpParams()
      .set('query', partialInput);
    
    if (textContext) {
      params = params.set('text', textContext);
    }

    return this.http.get<SuggestionsResponse>(`${this.apiUrl}/suggest-labels`, { params })
      .pipe(
        map(response => {
          if (response && response.success && response.suggestions) {
            return response.suggestions;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching label suggestions:', error);
          const filteredCategories = this.commonCategories
            .filter(cat => cat.toLowerCase().includes(partialInput.toLowerCase()))
            .slice(0, 10);
          return of(filteredCategories);
        })
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      if (error.error && typeof error.error === 'object' && 'error' in error.error) {
        errorMessage = error.error.error;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}