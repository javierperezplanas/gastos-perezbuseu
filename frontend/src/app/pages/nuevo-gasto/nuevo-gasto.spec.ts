import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoGasto } from './nuevo-gasto';

describe('NuevoGasto', () => {
  let component: NuevoGasto;
  let fixture: ComponentFixture<NuevoGasto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoGasto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NuevoGasto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
