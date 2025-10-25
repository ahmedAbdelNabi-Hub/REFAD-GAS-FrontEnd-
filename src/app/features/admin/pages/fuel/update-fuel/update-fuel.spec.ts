import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateFuel } from './update-fuel';

describe('UpdateFuel', () => {
  let component: UpdateFuel;
  let fixture: ComponentFixture<UpdateFuel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateFuel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateFuel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
