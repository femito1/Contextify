import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet, Router} from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { InputFormComponent } from './input-form/input-form.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectionStrategy, inject, signal, untracked } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatChipInput, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ApiService } from './api.service';
import { Observable, debounceTime, distinctUntilChanged, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true, 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    InputFormComponent,
    RouterModule
  ],
})

export class AppComponent implements OnInit {
  
  title: any;
  readonly keywords = signal<string[]>([]);
  errorMessage = signal<string | null>(null);
  latestText: string = '';
  
  // For autocomplete
  labelCtrl = new FormControl('');
  filteredLabels: Observable<string[]>;
  allLabels: string[] = [];
    
  constructor(private router: Router, private apiService: ApiService) {
    const restoredText = history.state['inputText'];
    const restoredLabels = history.state['userLabels'];
  
    if (restoredText) {
      this.latestText = restoredText;
    }
  
    if (restoredLabels) {
      this.keywords.set(restoredLabels);
    }

    // Initialize filteredLabels with empty array
    this.filteredLabels = of([]);
  }

  ngOnInit() {
    // Set up autocomplete filtering
    this.filteredLabels = this.labelCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || typeof value !== 'string') {
          return of([]);
        }
        // Pass both the partial input and the current text content for context-aware suggestions
        return this.apiService.suggestLabels(value, this.latestText);
      })
    );
  }

  onTextChanged(text: string) {
    this.latestText = text;
    
    // Refresh suggestions when text changes
    // The debounce in the pipe prevents too many API calls
    if (this.labelCtrl.value) {
      this.labelCtrl.updateValueAndValidity();
    }
  }

  goToOutput(): void {
    const labels = this.keywords();
    if (labels.length === 0) {
      this.errorMessage.set("Please add at least one label");
      setTimeout(() => this.errorMessage.set(null), 3000);
      return;
    }
    
    this.router.navigate(['/output'], {
      state: {
        userLabels: labels,
        inputText: this.latestText
      }
    });
  }

  announcer = inject(LiveAnnouncer);

  removeKeyword(keyword: string) {
    this.keywords.update(keywords => {
      const index = keywords.indexOf(keyword);
      if (index < 0) {
        return keywords;
      }

      keywords.splice(index, 1);
      this.announcer.announce(`removed ${keyword}`);
      return [...keywords];
    });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
  
    if (value && !this.keywords().includes(value)) {
      this.keywords.update(keywords => [...keywords, value]);
      this.announcer.announce(`added ${value}`);
    } else if (this.keywords().includes(value)) {
      console.warn('Duplicate label:', value);
      this.errorMessage.set(`"${value}" is already added.`);
      setTimeout(() => this.errorMessage.set(null), 3000);
    }
  
    event.chipInput!.clear();
    this.labelCtrl.setValue('');
  }
  
  addLabelManually(labelInput: HTMLInputElement): void {
    const value = labelInput.value.trim();
  
    if (value && !this.keywords().includes(value)) {
      this.add({ value, chipInput: { clear: () => labelInput.value = '' } } as any);
    } else if (this.keywords().includes(value)) {
      console.warn('Duplicate label:', value);
      this.errorMessage.set(`"${value}" is already added.`);
      setTimeout(() => this.errorMessage.set(null), 3000);
    }
  }

  // Autocomplete selection handler
  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    if (!this.keywords().includes(value)) {
      this.keywords.update(keywords => [...keywords, value]);
      this.announcer.announce(`added ${value}`);
    } else {
      this.errorMessage.set(`"${value}" is already added.`);
      setTimeout(() => this.errorMessage.set(null), 3000);
    }
    this.labelCtrl.setValue('');
  }
}