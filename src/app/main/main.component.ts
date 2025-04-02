import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InputFormComponent } from '../input-form/input-form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

interface Language {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NgOptimizedImage, MatFormFieldModule, MatInputModule, FormsModule, MatSelectModule],
  templateUrl: './main.component.html',
  styleUrls:["./main.component.scss"] 
})
export class MainComponent {
  languages: Language[] = [
    {value: 'English', viewValue: 'English'},
    {value: 'Italian', viewValue: 'Italian'},
  ];
  selectedLanguage = this.languages[0].value;

}
