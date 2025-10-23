import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Supervisors } from './supervisors';

describe('Supervisors', () => {
  let component: Supervisors;
  let fixture: ComponentFixture<Supervisors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Supervisors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Supervisors);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
