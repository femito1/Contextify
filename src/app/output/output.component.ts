import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
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

}
