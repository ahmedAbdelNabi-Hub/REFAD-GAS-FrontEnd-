import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateStation } from './update-station';

describe('UpdateStation', () => {
  let component: UpdateStation;
  let fixture: ComponentFixture<UpdateStation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateStation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateStation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
