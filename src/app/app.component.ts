import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { InputFormComponent } from './input-form/input-form.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ChangeDetectionStrategy, inject, signal, untracked } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatChipInput, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-root',
  standalone: true, 
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    InputFormComponent,
],

})

export class AppComponent {
  title: any

  readonly keywords = signal<string[]>([]);
  readonly formControl = new FormControl(['']);
  errorMessage = signal<string | null>(null);

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
    } else if (this.keywords().includes(value)) {
      console.warn('Duplicate label:', value);
      this.errorMessage.set(`"${value}" is already added.`);
      setTimeout(() => this.errorMessage.set(null), 3000);
    }
  
    event.chipInput!.clear();
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
  
  
  

}


