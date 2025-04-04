import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InputFormComponent } from '../input-form/input-form.component';
import { LabelsProbsTable } from '../labels-probs/labels-probs.component';
import { CommonModule } from '@angular/common';
import { ApiService, ClassificationResponse } from '../api.service';

@Component({
  standalone: true,
  selector: 'app-output',
  imports: [RouterModule, InputFormComponent, LabelsProbsTable, CommonModule],
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.scss'],
})
export class OutputComponent implements OnInit {
  predictedLabel = "";
  predictedProb = 0;
  inputText: string = '';
  userLabels: string[] = [];
  novelSuggestions: string = '';
  loading = true;
  error: string | null = null;
  classificationResults: {[key: string]: number} = {};
  language: string = '';
  spellingError: boolean = false;
  spellingCorrections: {[key: string]: string} = {};

  constructor(private router: Router, private apiService: ApiService) {
    const nav = this.router.getCurrentNavigation();
    this.inputText = nav?.extras.state?.['inputText'] ?? '';
    this.userLabels = nav?.extras.state?.['userLabels'] ?? [];
  }

  ngOnInit() {
    if (this.inputText && this.userLabels.length > 0) {
      this.classifyText();
    } else {
      this.error = "Missing text or labels for classification";
      this.loading = false;
    }
  }

  classifyText() {
    this.loading = true;
    this.error = null;
    this.spellingError = false;
    this.spellingCorrections = {};
    
    this.apiService.classifyText(this.inputText, this.userLabels).subscribe({
      next: (response: any) => {
        if (response.success && response.results) {
          // Convert tuple array to classificationResults dictionary
          this.classificationResults = {};
          response.results.predicted_labels.forEach(([label, prob]: [string, number]) => {
            this.classificationResults[label] = prob;
          });
  
          this.language = response.language || '';
          
          // Set predicted label and probability from best_label
          this.predictedLabel = response.results.best_label;
          this.predictedProb = Math.round(this.classificationResults[this.predictedLabel] * 100);
  
          // Handle novel suggestions
          this.novelSuggestions = response.results.novel_suggestions;
        } else {
          this.error = response.error || "Unknown error occurred";
          
          if (response.spelling_suggestions) {
            this.spellingError = true;
            this.spellingCorrections = response.spelling_suggestions;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || "Error connecting to the classification service";
        this.loading = false;
      }
    });
  }

  useSpellingCorrections() {
    // Replace misspelled labels with their corrections
    if (Object.keys(this.spellingCorrections).length > 0) {
      const correctedLabels = [...this.userLabels];
      
      for (let i = 0; i < correctedLabels.length; i++) {
        const label = correctedLabels[i];
        if (this.spellingCorrections[label]) {
          correctedLabels[i] = this.spellingCorrections[label];
        }
      }
      
      this.userLabels = correctedLabels;
      this.classifyText(); // Retry with corrected labels
    }
  }

  goBack(): void {
    this.router.navigate(['/'], {
      state: {
        userLabels: this.userLabels,
        inputText: this.inputText
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/home']);
  }
}