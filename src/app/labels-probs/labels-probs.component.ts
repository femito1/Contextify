import { Component } from '@angular/core';
import {MatTableModule} from '@angular/material/table';

export interface SuggestedLabels {
  label: string;
  position: number;
  probability: number;
}

const ELEMENT_DATA: SuggestedLabels[] = [
  {position: 1, label: 'sports', probability: 91},
  {position: 2, label: 'politics', probability: 80},
  {position: 3, label: 'netflix', probability: 70},
  {position: 4, label: 'food', probability: 57},
  {position: 5, label: 'drinks', probability: 46},
  {position: 6, label: 'geography', probability: 25},
  {position: 7, label: 'maths', probability: 23},
  {position: 8, label: 'science', probability: 20},
  {position: 9, label: 'travel', probability: 5},
  {position: 10, label: 'comics', probability: 0.3},
];

/**
 * @title Table with columns defined using a for loop instead of statically written in the template.
 */
@Component({
  selector: 'app-labels-probs',
  styleUrl: './labels-probs.component.scss',
  templateUrl: './labels-probs.component.html',
  imports: [MatTableModule],
})
export class LabelsProbsTable {
  columns = [
    {
      columnDef: 'position',
      header: 'Ranking',
      cell: (label: SuggestedLabels) => `${label.position}`,
    },
    {
      columnDef: 'label',
      header: 'Suggested Label',
      cell: (label: SuggestedLabels) => `${label.label}`,
    },
    {
      columnDef: 'probability',
      header: 'Probability (%)',
      cell: (label: SuggestedLabels) => `${label.probability}`,
    },

  ];
  dataSource = ELEMENT_DATA;
  displayedColumns = this.columns.map(c => c.columnDef);
}
