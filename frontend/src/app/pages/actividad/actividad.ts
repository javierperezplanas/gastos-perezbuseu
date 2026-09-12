import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  Actividades
} from '../../services/actividades';


@Component({
  selector: 'app-actividad',

  imports: [
    CommonModule
  ],

  templateUrl: './actividad.html',

  styleUrl: './actividad.scss',
})
export class Actividad implements OnInit {


  grupoId: number = 1;


  actividades: any[] = [];


  cargando: boolean = true;


  error: string = '';


  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private actividadesService: Actividades

  ) {}


  ngOnInit(): void {


    const grupoIdParam =
    this.route.snapshot.paramMap.get(
      'id'
    );


    if (grupoIdParam) {

      this.grupoId =
      Number(grupoIdParam);

    }


    this.cargarActividades();

  }


  cargarActividades(): void {


    this.cargando =
    true;


    this.error =
    '';


    this.actividadesService
    .obtenerActividadesPorGrupo(
      this.grupoId
    )
    .subscribe({

      next: (respuesta: any[]) => {


        console.log(
          'Actividades recibidas:',
          respuesta
        );


        this.actividades =
        respuesta;


        this.cargando =
        false;

      },


      error: (error: any) => {


        console.error(
          'Error cargando actividades:',
          error
        );


        this.error =
        'No se ha podido cargar la actividad.';


        this.cargando =
        false;

      }

    });

  }


  vaciarActividad(): void {


    const confirmar =
    window.confirm(
      '¿Seguro que quieres eliminar toda la actividad? Esta acción no se puede deshacer.'
    );


    if (!confirmar) {

      return;

    }


    this.error =
    '';


    this.actividadesService
    .vaciarActividadesPorGrupo(
      this.grupoId
    )
    .subscribe({

      next: () => {


        this.actividades =
        [];


        console.log(
          'Actividad eliminada correctamente.'
        );

      },


      error: (error: any) => {


        console.error(
          'Error vaciando la actividad:',
          error
        );


        this.error =
        'No se ha podido vaciar la actividad.';

      }

    });

  }


  obtenerIcono(
    tipo: string
  ): string {


    switch (tipo) {


      case 'CREAR_GASTO':

        return '➕';


      case 'EDITAR_GASTO':

        return '✏️';


      case 'ELIMINAR_GASTO':

        return '🗑️';


      case 'REGISTRAR_PAGO':

        return '💰';


      default:

        return '📋';

    }

  }


  volver(): void {


    this.router.navigate([
      '/grupos',
      this.grupoId
    ]);

  }

}