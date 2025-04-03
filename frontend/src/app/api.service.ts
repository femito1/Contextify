import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = '/api';

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