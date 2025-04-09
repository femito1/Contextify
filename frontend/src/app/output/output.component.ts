import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InputFormComponent } from '../input-form/input-form.component';
import { CommonModule } from '@angular/common';
import { ApiService, ClassificationResponse, ClassificationResult } from '../api.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
interface CombinedLabel {
  position: number;
  label: string;
  probability: number;
  likelihood: number;
  isSuggested: boolean;
}

@Component({
  standalone: true,
  selector: 'app-output',
  imports: [
    RouterModule, 
    InputFormComponent, 
    CommonModule, 
    MatTableModule, 
    MatSortModule,
    TranslateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './output.component.html',
  styleUrls: ['./output.component.scss'],
})
export class OutputComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  dataSource = new MatTableDataSource<CombinedLabel>([]);
  displayedColumns: string[] = ['position', 'label', 'likelihood', 'probability'];

  predictedLabel = "";
  predictedProb = 0;
  predictedLikelihood = 0;
  inputText: string = '';
  userLabels: string[] = [];
  novelSuggestions: any = null;
  loading = true;
  error: string | null = null;
  classificationResults: ClassificationResult[] = [];
  language: string = '';
  spellingError: boolean = false;
  spellingCorrections: { [key: string]: string } = {};
  combinedLabels: CombinedLabel[] = [];
  showCombinedTable = false;

  constructor(
    private router: Router,
    private apiService: ApiService,
    private _liveAnnouncer: LiveAnnouncer,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) {
    const nav = this.router.getCurrentNavigation();
    this.inputText = nav?.extras.state?.['inputText'] ?? '';
    this.userLabels = nav?.extras.state?.['userLabels'] ?? [];
  }

  ngOnInit() {
    if (this.inputText && this.userLabels.length > 0) {
      this.classifyText();
    } else if (this.inputText) {
      this.classifyText();
    } else {
      this.error = "Missing text for classification";
      this.loading = false;
    }
  }

  ngAfterViewInit() {
    this.setupSorting();
  }

  private setupSorting() {
    if (!this.sort) {
      setTimeout(() => this.setupSorting(), 100);
      return;
    }

    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item: CombinedLabel, property: string): string | number => {
      switch (property) {
        case 'position': return item.position;
        case 'label': return item.label.toLowerCase();
        case 'probability': return item.probability;
        case 'likelihood': return item.likelihood;
        default: return 0;
      }
    };

    // Trigger initial sort
    this.sort.active = 'likelihood';
    this.sort.direction = 'desc';
    this.sort.sortChange.emit({
      active: 'likelihood',
      direction: 'desc'
    });

    this.cdr.detectChanges();
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  // In output.component.ts, modify the classifyText method:
  classifyText() {
    this.loading = true;
    this.error = null;
    this.spellingError = false;
    this.spellingCorrections = {};
    this.combinedLabels = [];
    this.showCombinedTable = false;

    this.apiService.classifyText(this.inputText, this.userLabels).subscribe({
      next: (response: ClassificationResponse) => {
        if (response.success && response.results) {
          this.classificationResults = response.results.predictions || [];
          this.language = response.language || '';
          this.novelSuggestions = response.results.novel_suggestions || null;

          this.processLabels(response);

          // If no user labels were provided, only show suggested labels
          if (this.userLabels.length === 0 && this.combinedLabels.length > 0) {
            this.predictedLabel = this.combinedLabels[0].label;
            this.predictedProb = this.roundToPercent(this.combinedLabels[0].probability);
            this.predictedLikelihood = this.roundToPercent(this.combinedLabels[0].likelihood);
          }
          // If user labels were provided, show the best from user labels
          else if (this.combinedLabels.length > 0) {
            const bestUserLabel = this.combinedLabels.find(label => !label.isSuggested);
            if (bestUserLabel) {
              this.predictedLabel = bestUserLabel.label;
              this.predictedProb = this.roundToPercent(bestUserLabel.probability);
              this.predictedLikelihood = this.roundToPercent(bestUserLabel.likelihood);
            }
          }
        } else {
          this.error = response.error || "Unknown error occurred";
          if (response.spelling_suggestions) {
            this.spellingError = true;
            this.spellingCorrections = response.spelling_suggestions;
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message || "Error connecting to the classification service";
        this.loading = false;
      }
    });
  }

  // And update the processLabels method:
  private processLabels(response: ClassificationResponse) {
    // Process ALL input labels only if they were provided
    const inputLabelsData = this.userLabels.length > 0
      ? this.classificationResults.map(result => ({
        position: 0,
        label: result.label,
        probability: result.probability,
        likelihood: result.likelihood,
        isSuggested: false
      }))
      : [];

    // Process TOP 5 suggested labels
    let suggestedLabelsData: CombinedLabel[] = [];
    if (response.results.novel_suggestions) {
      const mapItem = (item: any): CombinedLabel => {
        if (Array.isArray(item)) {
          return {
            position: 0,
            label: item[0],
            probability: 0,
            likelihood: item[1],
            isSuggested: true
          };
        } else {
          return {
            position: 0,
            label: item.label,
            probability: item.probability || 0,
            likelihood: item.likelihood,
            isSuggested: true
          };
        }
      };

      // Predefined labels (top 5)
      if (response.results.novel_suggestions.similar_predefined_labels) {
        suggestedLabelsData = response.results.novel_suggestions.similar_predefined_labels
          .slice(0, 5)
          .map(mapItem);
      }

      // Keyword suggestions (top 5)
      if (response.results.novel_suggestions.keyword_suggestions) {
        suggestedLabelsData = suggestedLabelsData.concat(
          response.results.novel_suggestions.keyword_suggestions
            .slice(0, 5)
            .map(mapItem)
        );
      }
    }

    // Combine input (if any) with suggested labels, sort by likelihood
    this.combinedLabels = [...inputLabelsData, ...suggestedLabelsData]
      .sort((a, b) => b.likelihood - a.likelihood)
      .map((item, index) => ({
        ...item,
        position: index + 1
      }));

    this.dataSource.data = this.combinedLabels;
    this.showCombinedTable = this.combinedLabels.length > 0;

    if (this.sort) {
      this.sort.active = 'likelihood';
      this.sort.direction = 'desc';
      this.dataSource.sort = this.sort;
    }
  }

  roundToPercent(value: number): number {
    return Math.round(value * 100);
  }

  formatPercent(value: number): string {
    return `${this.roundToPercent(value)}%`;
  }

  useSpellingCorrections() {
    if (Object.keys(this.spellingCorrections).length > 0) {
      const correctedLabels = [...this.userLabels];

      for (let i = 0; i < correctedLabels.length; i++) {
        const label = correctedLabels[i];
        if (this.spellingCorrections[label]) {
          correctedLabels[i] = this.spellingCorrections[label];
        }
      }

      this.userLabels = correctedLabels;
      this.classifyText();
    }
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