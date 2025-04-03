import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabelsProbsTable } from './labels-probs.component';

describe('LabelsProbsComponent', () => {
  let component: LabelsProbsTable;
  let fixture: ComponentFixture<LabelsProbsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelsProbsTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabelsProbsTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
