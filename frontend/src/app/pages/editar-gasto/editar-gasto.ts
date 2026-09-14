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
export class EditarGasto
implements OnInit {


  /*
   * ID del gasto.
   */
  gastoId: number = 0;


  /*
   * ID del grupo.
   */
  grupoId: number = 1;


  /*
   * Descripción.
   */
  descripcion: string = '';


  /*
   * Categoría.
   */
  categoria: string = '';


  /*
   * Importe.
   */
  importe: number = 0;


  /*
   * Usuario que ha pagado.
   */
  pagador: number = 0;


  /*
   * Fecha del gasto.
   *
   * Formato:
   * YYYY-MM-DD
   */
  fecha: string = '';


  /*
   * Hora del gasto.
   *
   * Formato:
   * HH:mm
   */
  hora: string = '';


  /*
   * Tipo de división del gasto.
   */
  tipoDivision: string = 'IGUAL';


  /*
   * Participantes originales
   * del gasto.
   */
  participantesIds: number[] = [];


  /*
   * Indica si estamos
   * cargando los datos.
   */
  cargando: boolean = true;


  /*
   * Indica si estamos
   * guardando.
   */
  guardando: boolean = false;


  /*
   * Mensaje de error.
   */
  error: string = '';


  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private gastosService: Gastos

  ) {}


  ngOnInit(): void {


    /*
     * Obtenemos el ID
     * del gasto.
     */
    const gastoIdParam =
    this.route.snapshot.paramMap.get(
      'gastoId'
    );


    /*
     * Comprobamos que exista.
     */
    if (!gastoIdParam) {


      this.error =
      'No se ha indicado el gasto.';


      this.cargando =
      false;


      return;

    }


    /*
     * Guardamos el ID.
     */
    this.gastoId =
    Number(
      gastoIdParam
    );


    /*
     * Cargamos el gasto.
     */
    this.cargarGasto();

  }


  /*
   * Cargar los datos
   * del gasto.
   */
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


        /*
         * Datos básicos.
         */
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
         * Recuperamos el tipo
         * de división actual.
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
         * En algunos tipos de división,
         * como TOTAL_A_PAGADOR, el pagador
         * puede no aparecer en los repartos.
         *
         * Lo añadimos para que, si se cambia
         * posteriormente a IGUAL, participe
         * correctamente en el reparto.
         */
        if (

          this.pagador

          &&

          !this.participantesIds.includes(
            this.pagador
          )

        ) {


          this.participantesIds.push(
            this.pagador
          );

        }


        /*
         * Recuperamos la fecha
         * y la hora originales.
         *
         * Ejemplo recibido:
         *
         * 2026-09-13T08:20:00
         */
        if (gasto.fechaHora) {


          /*
           * Fecha:
           *
           * 2026-09-13
           */
          this.fecha =
          gasto.fechaHora.substring(
            0,
            10
          );


          /*
           * Hora:
           *
           * 08:20
           */
          this.hora =
          gasto.fechaHora.substring(
            11,
            16
          );


        } else {


          /*
           * Valores por defecto.
           */
          this.fecha =
          '';


          this.hora =
          '00:00';

        }


        console.log(
          'Fecha:',
          this.fecha
        );


        console.log(
          'Hora:',
          this.hora
        );


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


  /*
   * Guardar los cambios.
   */
  guardarCambios(): void {


    /*
     * Validamos la descripción.
     */
    if (
      !this.descripcion.trim()
    ) {


      alert(
        'La descripción es obligatoria.'
      );


      return;

    }


    /*
     * Validamos la categoría.
     */
    if (
      !this.categoria
    ) {


      alert(
        'Debes seleccionar una categoría.'
      );


      return;

    }


    /*
     * Validamos el importe.
     */
    if (

      !this.importe

      ||

      this.importe <= 0

    ) {


      alert(
        'El importe debe ser mayor que cero.'
      );


      return;

    }


    /*
     * Validamos el pagador.
     */
    if (
      !this.pagador
    ) {


      alert(
        'Debes seleccionar quién ha pagado.'
      );


      return;

    }


    /*
     * Validamos la fecha.
     */
    if (
      !this.fecha
    ) {


      alert(
        'Debes seleccionar una fecha.'
      );


      return;

    }


    /*
     * Validamos la hora.
     */
    if (
      !this.hora
    ) {


      alert(
        'Debes seleccionar una hora.'
      );


      return;

    }


    /*
     * Validamos que existan
     * participantes.
     */
    if (

      !this.participantesIds

      ||

      this.participantesIds.length === 0

    ) {


      alert(
        'El gasto debe tener al menos un participante.'
      );


      return;

    }


    /*
     * Construimos la fechaHora.
     *
     * Ejemplo:
     *
     * Fecha:
     * 2026-09-13
     *
     * Hora:
     * 08:20
     *
     * Resultado:
     * 2026-09-13T08:20:00
     */
    const fechaHora =
    this.fecha
    +
    'T'
    +
    this.hora
    +
    ':00';


    /*
     * Construimos el gasto.
     */
    const gasto = {


      descripcion:
      this.descripcion,


      categoria:
      this.categoria,


      importe:
      this.importe,


      /*
       * Fecha y hora completas.
       */
      fechaHora:
      fechaHora,


      notas:
      '',


      grupoId:
      this.grupoId,


      pagadorId:
      this.pagador,


      /*
       * Participantes.
       */
      participantesIds:
      this.participantesIds,


      /*
       * Tipo de división.
       */
      tipoDivision:
      this.tipoDivision

    };


    console.log(
      'Gasto que se va a actualizar:',
      gasto
    );


    /*
     * Indicamos que estamos
     * guardando.
     */
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


        /*
         * Volvemos al grupo.
         */
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


  /*
   * Volver al grupo.
   */
  volver(): void {


    this.router.navigate([

      '/grupos',

      this.grupoId

    ]);

  }

}