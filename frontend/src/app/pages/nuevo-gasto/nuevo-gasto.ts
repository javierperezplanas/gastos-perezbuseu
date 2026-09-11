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


  /*
   * Datos del gasto.
   */

  descripcion: string = '';


  categoria: string = '';


  importe: number | null = null;


  pagador: string = '';


  /*
   * Fecha y hora.
   *
   * Formato:
   * YYYY-MM-DDTHH:mm
   */
  fecha: string =
  this.obtenerFechaHoraActual();


  /*
   * Tipo de división.
   */
  tipoDivision: string =
  'IGUAL';


/*
 * ID del grupo actual.
 */
grupoId: number = 0;


/*
 * Miembros del grupo.
 */
miembros: any[] = [];


/*
 * Todos los miembros
 * participan automáticamente.
 *
 * No se muestran en pantalla.
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
 * Devuelve la fecha y hora actual
 * en formato compatible con:
 *
 * input type="datetime-local"
 */
obtenerFechaHoraActual(): string {


  const ahora =
  new Date();


  const anio =
  ahora.getFullYear();


  const mes =
  String(
    ahora.getMonth() + 1
  ).padStart(
    2,
    '0'
  );


  const dia =
  String(
    ahora.getDate()
  ).padStart(
    2,
    '0'
  );


  const hora =
  String(
    ahora.getHours()
  ).padStart(
    2,
    '0'
  );


  const minutos =
  String(
    ahora.getMinutes()
  ).padStart(
    2,
    '0'
  );


  return (
    `${anio}-${mes}-${dia}`
    +
    `T${hora}:${minutos}`
  );

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


  /*
   * Cargamos los miembros
   * del grupo.
   */
  this.cargarMiembros();

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
       * Todos los miembros
       * participan automáticamente.
       */
      this.participantesIds =
      miembros.map(
        (miembro: any) =>
        miembro.usuario.id
      );


      console.log(
        'Participantes:',
        this.participantesIds
      );

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
      gasto.descripcion
      ?? '';


      this.categoria =
      gasto.categoria
      ?? '';


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
       * para datetime-local.
       */
      if (
        gasto.fechaHora
      ) {


        this.fecha =
        gasto.fechaHora.substring(
          0,
          16
        );

      }


      /*
       * Recuperamos el tipo
       * de división.
       */
      if (
        gasto.tipoDivision
      ) {


        this.tipoDivision =
        gasto.tipoDivision;

      } else {


        this.tipoDivision =
        'IGUAL';

      }


      console.log(
        'Gasto cargado:',
        gasto
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


  /*
   * Validamos los campos.
   */
  if (

    !this.descripcion.trim()

    ||

    !this.categoria

    ||

    this.importe === null

    ||

    this.importe <= 0

    ||

    !this.pagador

    ||

    !this.fecha

  ) {


    alert(
      'Por favor, rellena '
      +
      'todos los campos.'
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
      'El grupo debe tener '
      +
      'al menos un miembro.'
    );


    return;

  }


  /*
   * Construimos el gasto
   * para enviarlo al backend.
   */
  const gasto = {


    descripcion:
    this.descripcion.trim(),


    importe:
    this.importe,


    categoria:
    this.categoria,


    /*
     * datetime-local devuelve:
     *
     * YYYY-MM-DDTHH:mm
     *
     * Añadimos los segundos.
     */
    fechaHora:
    this.fecha + ':00',


    grupoId:
    this.grupoId,


    pagadorId:
    Number(
      this.pagador
    ),


    /*
     * Todos los miembros
     * del grupo participan.
     */
    participantesIds:
    this.participantesIds,


    tipoDivision:
    this.tipoDivision

  };


  console.log(
    'Enviando gasto:',
    gasto
  );


  /*
   * EDITAR GASTO.
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
   * CREAR GASTO.
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
