import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { InputFormComponent } from './input-form/input-form.component';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-root',
  standalone: true, 
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [NgOptimizedImage, InputFormComponent, FormsModule]
})
export class AppComponent {
  title = 'us3App';
  inputType = "text";
  
  }

