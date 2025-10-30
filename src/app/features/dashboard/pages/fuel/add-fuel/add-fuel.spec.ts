import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFuel } from './add-fuel';

describe('AddFuel', () => {
  let component: AddFuel;
  let fixture: ComponentFixture<AddFuel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFuel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFuel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
