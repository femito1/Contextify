import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface Language {
  value: string;
  viewValue: string;
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NgOptimizedImage,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  languages: Language[] = [
    { value: 'en', viewValue: 'English' },
    { value: 'it', viewValue: 'Italian' }
  ];
  selectedLanguage = 'en';
  
  inputText = '';
  candidateLabels: string[] = ['positive', 'negative', 'neutral'];
  classificationResults: any;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private apiService: ApiService,
    private translate: TranslateService
  ) {
    translate.setDefaultLang('en');
    translate.use('en');
  }

  changeLanguage() {
    this.translate.use(this.selectedLanguage);
    console.log('Language changed to:', this.selectedLanguage); // For debugging
  }

  onTextChanged(text: string) {
    this.inputText = text;
  }

  onLabelAdded(label: string) {
    if (!this.candidateLabels.includes(label)) {
      this.candidateLabels = [...this.candidateLabels, label];
    }
  }

  onLabelRemoved(label: string) {
    this.candidateLabels = this.candidateLabels.filter(l => l !== label);
  }

  classifyText() {
    if (!this.inputText.trim()) {
      this.errorMessage = 'Please enter some text to classify';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    this.apiService.classifyText(this.inputText, this.candidateLabels).subscribe({
      next: (response) => {
        this.classificationResults = response;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Classification failed. Please try again.';
        this.isLoading = false;
        console.error('API Error:', err);
      }
    });
  }

  checkApiHealth() {
    this.apiService.checkHealth().subscribe({
      next: (response) => console.log('API Health:', response),
      error: (err) => console.error('Health Check Failed:', err)
    });
  }
}