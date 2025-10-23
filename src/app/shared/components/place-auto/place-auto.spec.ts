import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceAuto } from './place-auto';

describe('PlaceAuto', () => {
  let component: PlaceAuto;
  let fixture: ComponentFixture<PlaceAuto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceAuto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaceAuto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
