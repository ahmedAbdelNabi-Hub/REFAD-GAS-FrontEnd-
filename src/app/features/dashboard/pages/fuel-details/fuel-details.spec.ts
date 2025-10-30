import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuelDetails } from './fuel-details';

describe('FuelDetails', () => {
  let component: FuelDetails;
  let fixture: ComponentFixture<FuelDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuelDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuelDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
