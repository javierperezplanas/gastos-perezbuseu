import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnalisisIa } from './analisis-ia';

describe('AnalisisIa', () => {
  let component: AnalisisIa;
  let fixture: ComponentFixture<AnalisisIa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnalisisIa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnalisisIa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
