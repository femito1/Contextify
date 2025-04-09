import { AfterViewInit, Component, ViewChild, inject, OnChanges, SimpleChanges, Input } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface LabelProbability {
  label: string;
  probability: number;
  likelihood: number;
}

export interface SuggestedLabels {
  position: number;
  label: string;
  probability: number;
  likelihood: number;
}

@Component({
  standalone: true,
  selector: 'app-labels-probs',
  styleUrl: './labels-probs.component.scss',
  templateUrl: './labels-probs.component.html',
  imports: [MatTableModule, MatSortModule, CommonModule, TranslateModule],
})
export class LabelsProbsTable implements AfterViewInit, OnChanges {
  private _liveAnnouncer = inject(LiveAnnouncer);
  @Input() classificationResults: LabelProbability[] = [];
  @Input() showLikelihood = true;


  constructor(private translate: TranslateService) {}

  displayedColumns: string[] = ['position', 'label', 'probability'];
  dataSource = new MatTableDataSource<SuggestedLabels>();

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    if (this.showLikelihood) {
      this.displayedColumns = ['position', 'label', 'likelihood', 'probability'];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classificationResults']) {
      this.updateDataSource();
    }
  }

  private updateDataSource(): void {
    const generatedData: SuggestedLabels[] = this.classificationResults.map((result, index) => ({
      position: index + 1,
      label: result.label,
      probability: Math.round(result.probability * 100),
      likelihood: Math.round(result.likelihood * 100)
    }));
    
    // Sort by probability (descending)
    generatedData.sort((a, b) => b.probability - a.probability);
    
    // Re-assign positions after sorting
    generatedData.forEach((item, index) => {
      item.position = index + 1;
    });
    
    this.dataSource = new MatTableDataSource(generatedData);
    
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }

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