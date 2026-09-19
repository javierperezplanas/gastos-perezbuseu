import {
  Component
} from '@angular/core';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  marked
} from 'marked';

import {
  Gastos
} from '../../services/gastos';

import {
  Grupos as GruposService
} from '../../services/grupos';


@Component({

  selector: 'app-analisis-ia',

  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],

  templateUrl: './analisis-ia.html',

  styleUrl: './analisis-ia.scss',

})


export class AnalisisIa {


  /*
   * =========================
   *
   * DATOS DEL GRUPO
   *
   * =========================
   */

  grupoId: number = 0;

  grupo: any = null;

  cargandoGrupo: boolean = true;


  /*
   * =========================
   *
   * PREGUNTA
   *
   * =========================
   */

  preguntaIA: string = '';

  respuestaPreguntaIA: string = '';

  respuestaPreguntaIAHtml: string = '';

  cargandoPreguntaIA: boolean = false;

  errorPreguntaIA: string = '';


  /*
   * =========================
   *
   * HISTORIAL
   *
   * =========================
   */

  historial: {
    pregunta: string;
    respuesta: string;
    respuestaHtml: string;
  }[] = [];


  /*
   * =========================
   *
   * CONSTRUCTOR
   *
   * =========================
   */

  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private gastosService: Gastos,

    private gruposService: GruposService

  ) {

  }


  /*
   * =========================
   *
   * INIT
   *
   * =========================
   */

  ngOnInit(): void {

    this.grupoId =
      Number(
        this.route.snapshot.paramMap.get('id')
      );

    this.cargarGrupo();

  }


  /*
   * =========================
   *
   * CARGAR GRUPO
   *
   * =========================
   */

  cargarGrupo(): void {

    this.cargandoGrupo = true;

    this.gruposService
      .obtenerGrupo(this.grupoId)
      .subscribe({

        next: (
          grupo: any
        ) => {

          this.grupo = grupo;

          this.cargandoGrupo = false;

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error cargando grupo:',
            error
          );

          this.cargandoGrupo = false;

        }

      });

  }


  /*
   * =========================
   *
   * PREGUNTAR A LA IA
   *
   * =========================
   */

  preguntarIA(): void {

    const pregunta =
      this.preguntaIA.trim();

    if (!pregunta) {

      return;

    }


    this.cargandoPreguntaIA = true;

    this.errorPreguntaIA = '';


    this.gastosService
      .responderPreguntaIA(
        this.grupoId,
        pregunta
      )
      .subscribe({

        next: (
          respuesta: {
            analisis: string
          }
        ) => {

          const respuestaTexto =
            respuesta.analisis;


          const respuestaHtml =
            marked.parse(
              respuestaTexto
            ) as string;


          /*
           * Guardamos la conversación
           */

          this.historial.push({

            pregunta: pregunta,

            respuesta: respuestaTexto,

            respuestaHtml: respuestaHtml

          });


          /*
           * Limpiamos la pregunta
           */

          this.preguntaIA = '';


          this.respuestaPreguntaIA =
            respuestaTexto;

          this.respuestaPreguntaIAHtml =
            respuestaHtml;


          this.cargandoPreguntaIA =
            false;

        },


        error: (
          error: any
        ) => {

          console.error(
            'Error realizando pregunta a la IA:',
            error
          );

          this.errorPreguntaIA =
            'No se ha podido responder a la pregunta.';

          this.cargandoPreguntaIA =
            false;

        }

      });

  }


  /*
   * =========================
   *
   * VOLVER AL GRUPO
   *
   * =========================
   */

  volverAlGrupo(): void {

    this.router.navigate([
      '/grupos',
      this.grupoId
    ]);

  }


}
