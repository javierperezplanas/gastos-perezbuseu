import {
  Component
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  Auth
} from '../../services/auth';

import {
  Grupos as GruposService
} from '../../services/grupos';


@Component({
  selector: 'app-nuevo-grupo',

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './nuevo-grupo.html',

  styleUrl: './nuevo-grupo.scss'
})
export class NuevoGrupo {


  nombre: string = '';


  descripcion: string = '';


  cargando: boolean = false;


  error: string = '';


  constructor(

    private router: Router,

      private gruposService: GruposService,

        private authService: Auth

  ) {}


  guardar(): void {


    this.error = '';


    /*
     * Comprobamos el nombre.
     */
    if (!this.nombre.trim()) {


      this.error =
      'El nombre del grupo es obligatorio.';


    return;

    }


    this.cargando =
    true;


    /*
     * Obtenemos el usuario
     * que ha iniciado sesión.
     */
    const usuario =
    this.authService.obtenerUsuario();


    /*
     * Comprobamos que exista
     * un usuario conectado.
     */
    if (!usuario) {


      this.error =
      'No hay ningún usuario conectado.';


    this.cargando =
    false;


    return;

    }


    /*
     * Datos que enviamos
     * al backend.
     */
    const grupo = {

      nombre:
      this.nombre.trim(),

      descripcion:
      this.descripcion.trim(),

      usuarioId:
      usuario.id

    };


    this.gruposService
    .crearGrupo(
      grupo
    )
    .subscribe({

      next: (
        grupoCreado: any
      ) => {


        console.log(
          'Grupo creado:',
          grupoCreado
        );


        this.cargando =
        false;


        /*
         * Volvemos a la lista
         * de grupos.
         */
        this.router.navigate([
          '/grupos'
        ]);

      },


      error: (
        error: any
      ) => {


        console.error(
          'Error creando grupo:',
          error
        );


        this.cargando =
        false;


        this.error =
        'No se ha podido crear el grupo.';

      }

    });

  }


  cancelar(): void {


    this.router.navigate([
      '/grupos'
    ]);

  }

}
