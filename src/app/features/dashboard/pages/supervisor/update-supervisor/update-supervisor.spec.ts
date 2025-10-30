import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateSupervisor } from './update-supervisor';

describe('UpdateSupervisor', () => {
  let component: UpdateSupervisor;
  let fixture: ComponentFixture<UpdateSupervisor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateSupervisor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateSupervisor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
