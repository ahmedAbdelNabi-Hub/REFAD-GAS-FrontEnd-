import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopFuelCompaniesChartComponent } from './top-fuel-companies-chart-component';

describe('TopFuelCompaniesChartComponent', () => {
  let component: TopFuelCompaniesChartComponent;
  let fixture: ComponentFixture<TopFuelCompaniesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopFuelCompaniesChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopFuelCompaniesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
