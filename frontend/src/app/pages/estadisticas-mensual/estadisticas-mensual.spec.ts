import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasMensual } from './estadisticas-mensual';

describe('EstadisticasMensual', () => {
  let component: EstadisticasMensual;
  let fixture: ComponentFixture<EstadisticasMensual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadisticasMensual]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadisticasMensual);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
