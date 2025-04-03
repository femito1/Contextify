import {AfterViewInit, Component, ViewChild, inject, OnChanges, SimpleChanges, Input} from '@angular/core';
import {MatSort, Sort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import { Router } from '@angular/router';
import { MatChipListbox, MatChipsModule } from '@angular/material/chips';
import { CommonModule } from '@angular/common';


export interface SuggestedLabels {
  label: string;
  position: number;
  probability: number;
}

/**
 * @title Table with columns defined using a for loop instead of statically written in the template.
 */
@Component({
  standalone: true,
  selector: 'app-labels-probs',
  styleUrl: './labels-probs.component.scss',
  templateUrl: './labels-probs.component.html',
  imports: [MatTableModule, MatSortModule, MatChipsModule, CommonModule],
})

export class LabelsProbsTable implements AfterViewInit, OnChanges {
  private _liveAnnouncer = inject(LiveAnnouncer);
  @Input() userLabels: string[] = [];
  @Input() classificationResults: {[key: string]: number} = {};

  displayedColumns: string[] = ['position', 'label', 'probability'];
  dataSource = new MatTableDataSource<SuggestedLabels>();

  @ViewChild(MatSort) sort!: MatSort;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userLabels'] || changes['classificationResults']) {
      this.updateDataSource();
    }
  }

  private updateDataSource(): void {
    const generatedData: SuggestedLabels[] = this.userLabels.map((label, index) => {
      // Get probability from the API results or default to 0
      const probability = this.classificationResults[label] || 0;
      
      return {
        position: index + 1,
        label,
        probability: Math.round(probability * 100) // Convert to percentage
      };
    });
    
    // Sort by probability (descending)
    generatedData.sort((a, b) => b.probability - a.probability);
    
    // Re-assign positions after sorting
    generatedData.forEach((item, index) => {
      item.position = index + 1;
    });
    
    this.dataSource = new MatTableDataSource(generatedData);
    
    // If we already have the sort set up, apply it
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
