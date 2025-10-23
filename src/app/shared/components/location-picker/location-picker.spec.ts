import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationPicker } from './location-picker';

describe('LocationPicker', () => {
  let component: LocationPicker;
  let fixture: ComponentFixture<LocationPicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationPicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationPicker);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
