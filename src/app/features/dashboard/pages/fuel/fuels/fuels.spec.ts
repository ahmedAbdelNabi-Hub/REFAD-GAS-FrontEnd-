import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Fuels } from './fuels';

describe('Fuels', () => {
  let component: Fuels;
  let fixture: ComponentFixture<Fuels>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Fuels]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Fuels);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
