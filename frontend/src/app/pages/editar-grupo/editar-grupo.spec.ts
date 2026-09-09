import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarGrupo } from './editar-grupo';

describe('EditarGrupo', () => {
  let component: EditarGrupo;
  let fixture: ComponentFixture<EditarGrupo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarGrupo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditarGrupo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
