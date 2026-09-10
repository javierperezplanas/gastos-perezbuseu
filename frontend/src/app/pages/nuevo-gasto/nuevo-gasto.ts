import {
  Component,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  Gastos
} from '../../services/gastos';

import {
  Grupos
} from '../../services/grupos';


@Component({
  selector: 'app-nuevo-gasto',

  imports: [
    FormsModule
  ],

  templateUrl: './nuevo-gasto.html',

  styleUrl: './nuevo-gasto.scss',
})
export class NuevoGasto
implements OnInit {


  descripcion: string = '';


  categoria: string = '';


  importe: number | null = null;


  pagador: string = '';


  fecha: string =
  this.obtenerFechaActual();


  /*
   * ID del grupo actual.
   */
  grupoId: number = 0;


  /*
   * Miembros del grupo.
   */
  miembros: any[] = [];


  /*
   * Participantes del gasto.
   */
  participantesIds: number[] = [];


  /*
   * Si tiene valor,
   * estamos editando un gasto.
   */
  gastoId: number | null = null;


  constructor(

    private router: Router,

      private route: ActivatedRoute,

        private gastosService: Gastos,

          private gruposService: Grupos

  ) {}


  /*
   * Devuelve la fecha actual
   * en formato YYYY-MM-DD.
   */
  obtenerFechaActual(): string {


    const hoy =
    new Date();


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


    /*
     * Obtenemos el ID del grupo
     * desde la URL.
     */
    const grupoIdParam =
    this.route.snapshot.paramMap.get(
      'id'
    );


    if (!grupoIdParam) {


      alert(
        'No se ha encontrado el grupo.'
      );


      this.router.navigate([
        '/grupos'
      ]);


      return;

    }


    this.grupoId =
    Number(
      grupoIdParam
    );


    console.log(
      'Grupo actual:',
      this.grupoId
    );


    /*
     * Cargamos los miembros
     * reales del grupo.
     */
    this.cargarMiembros();


    /*
     * Comprobamos si estamos
     * editando un gasto.
     */
    const gastoIdParam =
    this.route.snapshot.paramMap.get(
      'gastoId'
    );


    if (gastoIdParam) {


      this.gastoId =
      Number(
        gastoIdParam
      );


      this.cargarGasto();

    }

  }


  /*
   * Carga los miembros
   * del grupo actual.
   */
  cargarMiembros(): void {


    this.gruposService
    .obtenerMiembros(
      this.grupoId
    )
    .subscribe({

      next: (
        miembros: any[]
      ) => {


        console.log(
          'Miembros del grupo:',
          miembros
        );


        this.miembros =
        miembros;


        /*
         * Si estamos creando
         * un gasto, inicialmente
         * participan todos
         * los miembros.
         */
        if (
          this.gastoId === null
        ) {


          this.participantesIds =
          miembros.map(
            (miembro: any) =>
            miembro.usuario.id
          );


          console.log(
            'Participantes iniciales:',
            this.participantesIds
          );

        }

      },


      error: (
        error: any
      ) => {


        console.error(
          'Error cargando miembros:',
          error
        );


        alert(
          'No se han podido cargar '
          +
          'los miembros del grupo.'
        );

      }

    });

  }


  /*
   * Carga un gasto
   * cuando estamos editándolo.
   */
  cargarGasto(): void {


    if (
      this.gastoId === null
    ) {

      return;

    }


    this.gastosService
    .obtenerGasto(
      this.gastoId
    )
    .subscribe({

      next: (
        gasto: any
      ) => {


        console.log(
          'Gasto recibido:',
          gasto
        );


        this.descripcion =
        gasto.descripcion;


        this.categoria =
        gasto.categoria;


        this.importe =
        Number(
          gasto.importe
        );


        this.pagador =
        String(
          gasto.pagadorId
        );


        /*
         * Convertimos la fecha
         * para el input type="date".
         */
        if (
          gasto.fechaHora
        ) {


          this.fecha =
          gasto.fechaHora.substring(
            0,
            10
          );

        }


        /*
         * Recuperamos los participantes
         * desde los repartos.
         */
        if (
          gasto.repartos
        ) {


          this.participantesIds =
          gasto.repartos.map(
            (reparto: any) =>
            reparto.usuarioId
          );

        }


        console.log(
          'Participantes:',
          this.participantesIds
        );

      },


      error: (
        error: any
      ) => {


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


  /*
   * Guarda o actualiza
   * un gasto.
   */
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


    /*
     * Comprobamos que haya
     * participantes.
     */
    if (
      this.participantesIds.length === 0
    ) {


      alert(
        'Debe haber al menos '
        +
        'un participante.'
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


      /*
       * Usamos el grupo
       * de la URL.
       */
      grupoId:
      this.grupoId,


      pagadorId:
      Number(
        this.pagador
      ),


      participantesIds:
      this.participantesIds

    };


    console.log(
      'Enviando gasto:',
      gasto
    );


    /*
     * EDITAR GASTO
     */
    if (
      this.gastoId !== null
    ) {


      this.gastosService
      .actualizarGasto(
        this.gastoId,
        gasto
      )
      .subscribe({

        next: (
          respuesta: any
        ) => {


          console.log(
            'Gasto actualizado:',
            respuesta
          );


          this.router.navigate([
            '/grupos',
            this.grupoId
          ]);

        },


        error: (
          error: any
        ) => {


          console.error(
            'Error actualizando gasto:',
            error
          );


          alert(
            'Ha ocurrido un error '
            +
            'al actualizar el gasto.'
          );

        }

      });


      return;

    }


    /*
     * CREAR GASTO
     */
    this.gastosService
    .crearGasto(
      gasto
    )
    .subscribe({

      next: (
        respuesta: any
      ) => {


        console.log(
          'Gasto creado correctamente:',
          respuesta
        );


        this.router.navigate([
          '/grupos',
          this.grupoId
        ]);

      },


      error: (
        error: any
      ) => {


        console.error(
          'Error creando gasto:',
          error
        );


        alert(
          'Ha ocurrido un error '
          +
          'al guardar el gasto.'
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
