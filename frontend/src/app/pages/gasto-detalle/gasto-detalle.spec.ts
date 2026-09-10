import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GastoDetalle } from './gasto-detalle';

describe('GastoDetalle', () => {
  let component: GastoDetalle;
  let fixture: ComponentFixture<GastoDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GastoDetalle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GastoDetalle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
