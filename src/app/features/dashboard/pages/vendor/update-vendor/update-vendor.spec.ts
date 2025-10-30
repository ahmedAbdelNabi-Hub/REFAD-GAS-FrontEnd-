import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateVendor } from './update-vendor';

describe('UpdateVendor', () => {
  let component: UpdateVendor;
  let fixture: ComponentFixture<UpdateVendor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateVendor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateVendor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
