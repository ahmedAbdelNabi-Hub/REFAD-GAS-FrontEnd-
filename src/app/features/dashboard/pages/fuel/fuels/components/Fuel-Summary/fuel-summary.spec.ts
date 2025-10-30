import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelSummary } from './fuel-summary';

describe('FuelSummary', () => {
  let component: FuelSummary;
  let fixture: ComponentFixture<FuelSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuelSummary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuelSummary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
