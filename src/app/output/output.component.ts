import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InputFormComponent } from '../input-form/input-form.component';
import { LabelsProbsTable } from '../labels-probs/labels-probs.component';

@Component({
  standalone: true,
  selector: 'app-output',
  imports: [RouterModule, InputFormComponent, LabelsProbsTable],
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.scss'],
})
export class OutputComponent {
  predictedLabel = "cinema";
  predictedProb = 98;
  inputText: string = '';
  userLabels: string[] = [];

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.inputText = nav?.extras.state?.['inputText'] ?? '';
    this.userLabels = nav?.extras.state?.['userLabels'] ?? [];
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