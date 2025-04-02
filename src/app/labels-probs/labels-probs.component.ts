import {AfterViewInit, Component, ViewChild, inject} from '@angular/core';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {LiveAnnouncer} from '@angular/cdk/a11y';

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
  standalone: true,
  selector: 'app-labels-probs',
  styleUrl: './labels-probs.component.scss',
  templateUrl: './labels-probs.component.html',
  imports: [MatTableModule, MatSortModule],
})
export class LabelsProbsTable implements
AfterViewInit {
  private _liveAnnouncer = inject(LiveAnnouncer);

  displayedColumns: string[] = ['position', 'label', 'probability'];
  dataSource = new MatTableDataSource(ELEMENT_DATA);

  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  announceSortChange(sortState: Sort) {

    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
