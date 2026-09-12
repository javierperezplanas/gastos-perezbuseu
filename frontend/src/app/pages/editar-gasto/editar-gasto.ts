import { Component, OnInit } from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Gastos
} from '../../services/gastos';


@Component({
  selector: 'app-editar-gasto',

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './editar-gasto.html',

  styleUrl: './editar-gasto.scss',
})
export class EditarGasto implements OnInit {


  gastoId: number = 0;


  grupoId: number = 1;


  descripcion: string = '';


  categoria: string = '';


  importe: number = 0;


  pagador: number = 0;


  fecha: string = '';


  /*
   * Tipo de división del gasto.
   */
  tipoDivision: string = 'IGUAL';


  /*
   * Participantes originales
   * del gasto.
   */
  participantesIds: number[] = [];


  cargando: boolean = true;


  guardando: boolean = false;


  error: string = '';


  constructor(

    private route: ActivatedRoute,

      private router: Router,

        private gastosService: Gastos

  ) {}


  ngOnInit(): void {


    const gastoIdParam =
    this.route.snapshot.paramMap.get(
      'gastoId'
    );


    if (!gastoIdParam) {

      this.error =
      'No se ha indicado el gasto.';


      this.cargando =
      false;


      return;

    }


    this.gastoId =
    Number(gastoIdParam);


    this.cargarGasto();

  }


  cargarGasto(): void {


    this.cargando =
    true;


    this.error =
    '';


    this.gastosService
    .obtenerGasto(
      this.gastoId
    )
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
        gasto.importe;


        this.pagador =
        gasto.pagadorId;


        this.grupoId =
        gasto.grupoId;


        /*
         * Recuperamos el tipo de división actual.
         */
        this.tipoDivision =
        gasto.tipoDivision
        ?? 'IGUAL';


        /*
         * El backend devuelve los
         * participantes dentro de
         * la lista "repartos".
         */
        this.participantesIds =
        gasto.repartos
        ? gasto.repartos.map(
          (reparto: any) =>
          reparto.usuarioId
        )
        : [];


        /*
         * El backend devuelve
         * fechaHora.
         *
         * Nos quedamos solo
         * con YYYY-MM-DD.
         */
        this.fecha =
        gasto.fechaHora
        ? gasto.fechaHora.substring(
          0,
          10
        )
        : '';


    console.log(
      'Participantes:',
      this.participantesIds
    );


    this.cargando =
    false;

      },


      error: (error: any) => {


        console.error(
          'Error cargando gasto:',
          error
        );


        this.error =
        'No se ha podido cargar el gasto.';


          this.cargando =
          false;

      }

    });

  }


  guardarCambios(): void {


    if (
      !this.descripcion.trim()
    ) {

      alert(
        'La descripción es obligatoria.'
      );


      return;

    }


    if (
      !this.categoria
    ) {

      alert(
        'Debes seleccionar una categoría.'
      );


      return;

    }


    if (
      !this.importe ||
      this.importe <= 0
    ) {

      alert(
        'El importe debe ser mayor que cero.'
      );


      return;

    }


    if (
      !this.pagador
    ) {

      alert(
        'Debes seleccionar quién ha pagado.'
      );


      return;

    }


    if (
      !this.fecha
    ) {

      alert(
        'Debes seleccionar una fecha.'
      );


      return;

    }


    if (
      !this.participantesIds ||
      this.participantesIds.length === 0
    ) {

      alert(
        'El gasto debe tener al menos un participante.'
      );


      return;

    }


    const gasto = {

      descripcion:
      this.descripcion,


      categoria:
      this.categoria,


      importe:
      this.importe,


      /*
       * El backend espera fechaHora.
       */
      fechaHora:
      this.fecha + 'T00:00:00',


      notas:
      '',


      grupoId:
      this.grupoId,


      pagadorId:
      this.pagador,


      /*
       * Enviamos los participantes
       * obtenidos desde repartos.
       */
      participantesIds:
      this.participantesIds,


      /*
       * Tipo de división seleccionado.
       */
      tipoDivision:
      this.tipoDivision

    };


    console.log(
      'Gasto que se va a actualizar:',
      gasto
    );


    this.guardando =
    true;


    this.gastosService
    .actualizarGasto(
      this.gastoId,
      gasto
    )
    .subscribe({

      next: (response: any) => {


        console.log(
          'Gasto actualizado:',
          response
        );


        this.guardando =
        false;


        this.router.navigate([
          '/grupos',
          this.grupoId
        ]);

      },


      error: (error: any) => {


        console.error(
          'Error actualizando gasto:',
          error
        );


        this.guardando =
        false;


        alert(
          'No se ha podido actualizar el gasto.'
        );

      }

    });

  }


  volver(): void {


    this.router.navigate([
      '/grupos',
      this.grupoId
    ]);

  }

}