import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCar } from './add-car';

describe('AddCar', () => {
  let component: AddCar;
  let fixture: ComponentFixture<AddCar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
