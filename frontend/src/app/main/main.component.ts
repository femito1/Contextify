import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InputFormComponent } from '../input-form/input-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../api.service';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'] 
})
export class MainComponent {
  languages: Language[] = [
    {value: 'English', viewValue: 'English'},
    {value: 'Italian', viewValue: 'Italian'},
  ];
  selectedLanguage = this.languages[0].value;
  
  // New properties for classification
  inputText = '';
  candidateLabels: string[] = ['positive', 'negative', 'neutral'];
  classificationResults: any;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private apiService: ApiService) {}

  // Handle text input changes from InputFormComponent
  onTextChanged(text: string) {
    this.inputText = text;
  }

  // Handle label additions
  onLabelAdded(label: string) {
    if (!this.candidateLabels.includes(label)) {
      this.candidateLabels = [...this.candidateLabels, label];
    }
  }

  // Handle label removals
  onLabelRemoved(label: string) {
    this.candidateLabels = this.candidateLabels.filter(l => l !== label);
  }

  // Classify the text using Flask API
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

  // Check backend health status
  checkApiHealth() {
    this.apiService.checkHealth().subscribe({
      next: (response) => console.log('API Health:', response),
      error: (err) => console.error('Health Check Failed:', err)
    });
  }
}