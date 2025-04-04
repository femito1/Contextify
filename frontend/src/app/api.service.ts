import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of, map } from 'rxjs';

export interface ClassificationResponse {
  success: boolean;
  results: { [key: string]: number };
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
    // If the input is empty or too short, return common categories
    if (!partialInput || partialInput.length < 2) {
      return of(this.commonCategories.slice(0, 15));
    }

    // Set up query parameters
    let params = new HttpParams()
      .set('query', partialInput);
    
    // Add text context if available
    if (textContext) {
      params = params.set('text', textContext);
    }

    // Call the backend API
    return this.http.get<SuggestionsResponse>(`${this.apiUrl}/suggest-labels`, { params })
      .pipe(
        // Extract just the suggestions array from the response
        map(response => {
          if (response && response.success && response.suggestions) {
            return response.suggestions;
          }
          return [];
        }),
        catchError(error => {
          console.error('Error fetching label suggestions:', error);
          // Fallback to local filtering if the API fails
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
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      
      // Try to extract more specific error message from response if available
      if (error.error && typeof error.error === 'object' && 'error' in error.error) {
        errorMessage = error.error.error;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}