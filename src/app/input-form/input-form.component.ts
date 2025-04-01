import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './input-form.component.html',
  styleUrl: './input-form.component.scss'
})
export class InputFormComponent {
  userInput=" ";

  onSubmit() {
    console.log(this.userInput);
  }

}
