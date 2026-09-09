import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { Gastos } from '../../services/gastos';


@Component({
  selector: 'app-nuevo-gasto',

  imports: [
    FormsModule
  ],

  templateUrl: './nuevo-gasto.html',

  styleUrl: './nuevo-gasto.scss',
})

export class NuevoGasto implements OnInit {


  descripcion: string = '';

  categoria: string = '';

  importe: number | null = null;

  pagador: string = '';

  fecha: string = this.obtenerFechaActual();


  /*
   * Si tiene valor,
   * estamos editando un gasto.
   */
  gastoId: number | null = null;


  constructor(

    private router: Router,

      private route: ActivatedRoute,

        private gastosService: Gastos

  ) {}


  /*
   * Devuelve la fecha actual
   * en formato YYYY-MM-DD.
   *
   * Es el formato que necesita
   * un input type="date".
   */
  obtenerFechaActual(): string {


    const hoy = new Date();


    const anio =
    hoy.getFullYear();


    const mes =
    String(
      hoy.getMonth() + 1
    ).padStart(
      2,
      '0'
    );


    const dia =
    String(
      hoy.getDate()
    ).padStart(
      2,
      '0'
    );


    return `${anio}-${mes}-${dia}`;

  }


  ngOnInit(): void {


    const gastoIdParam =
    this.route.snapshot.paramMap.get(
      'gastoId'
    );


    /*
     * Si existe gastoId,
     * estamos editando.
     */
    if (gastoIdParam) {


      this.gastoId =
      Number(gastoIdParam);


      this.cargarGasto();

    }

  }


  cargarGasto(): void {


    if (this.gastoId === null) {

      return;

    }


    this.gastosService
    .obtenerGasto(this.gastoId)
    .subscribe({

      next: (gasto: any) => {


        console.log(
          'Gasto recibido:',
          gasto
        );


        this.descripcion =
        gasto.descripcion;


        this.categoria =
        gasto.categoria;


        this.importe =
        Number(gasto.importe);


        /*
         * El backend devuelve
         * pagadorId.
         */
        this.pagador =
        String(
          gasto.pagadorId
        );


        /*
         * Convertimos la fecha
         * para el input type="date".
         */
        if (gasto.fechaHora) {


          this.fecha =
          gasto.fechaHora.substring(
            0,
            10
          );

        }

      },


      error: (error: any) => {


        console.error(
          'Error cargando gasto:',
          error
        );


        alert(
          'No se ha podido cargar el gasto.'
        );

      }

    });

  }


  guardarGasto(): void {


    if (
      !this.descripcion ||
      !this.categoria ||
      !this.importe ||
      !this.pagador ||
      !this.fecha
    ) {


      alert(
        'Por favor, rellena todos los campos.'
      );


      return;

    }


    const gasto = {


      descripcion:
      this.descripcion,


      importe:
      this.importe,


      categoria:
      this.categoria,


      fechaHora:
      this.fecha + 'T00:00:00',


      notas: '',


      grupoId: 1,


      pagadorId:
      Number(
        this.pagador
      ),


      participantesIds: [
        1,
        2
      ]

    };


    console.log(
      'Enviando gasto:',
      gasto
    );


    /*
     * EDITAR GASTO
     */
    if (this.gastoId !== null) {


      this.gastosService
      .actualizarGasto(
        this.gastoId,
        gasto
      )
      .subscribe({

        next: (respuesta: any) => {


          console.log(
            'Gasto actualizado:',
            respuesta
          );


          this.router.navigate([
            '/grupos',
            1
          ]);

        },


        error: (error: any) => {


          console.error(
            'Error actualizando gasto:',
            error
          );


          alert(
            'Ha ocurrido un error al actualizar el gasto.'
          );

        }

      });


      return;

    }


    /*
     * CREAR GASTO
     */
    this.gastosService
    .crearGasto(gasto)
    .subscribe({

      next: (respuesta: any) => {


        console.log(
          'Gasto creado correctamente:',
          respuesta
        );


        this.router.navigate([
          '/grupos',
          1
        ]);

      },


      error: (error: any) => {


        console.error(
          'Error creando gasto:',
          error
        );


        alert(
          'Ha ocurrido un error al guardar el gasto.'
        );

      }

    });

  }


  volver(): void {


    this.router.navigate([
      '/grupos',
      1
    ]);

  }

}
