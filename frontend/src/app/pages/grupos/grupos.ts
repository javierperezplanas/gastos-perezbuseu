import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

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
  selector: 'app-grupos',

  imports: [
    CommonModule
  ],

  templateUrl: './grupos.html',

  styleUrl: './grupos.scss'
})
export class Grupos
implements OnInit {


  grupos: any[] = [];


  cargando: boolean = false;


  error: string = '';


  constructor(

    private router: Router,

      private authService: Auth,

        private gruposService: GruposService

  ) {}


  ngOnInit(): void {


    this.cargarGrupos();

  }


  /*
   * Cargar los grupos
   * del usuario conectado.
   */
  cargarGrupos(): void {


    const usuario =
    this.authService.obtenerUsuario();


    /*
     * Comprobamos que haya
     * un usuario conectado.
     */
    if (!usuario) {


      console.error(
        'No hay ningún usuario conectado.'
      );


      this.error =
      'No hay ningún usuario conectado.';


  return;

    }


    console.log(
      'Usuario conectado:',
      usuario
    );


    console.log(
      'ID del usuario:',
      usuario.id
    );


    this.cargando =
    true;


    this.error =
    '';


    this.gruposService
    .obtenerGruposPorUsuario(
      usuario.id
    )
    .subscribe({

      next: (
        grupos: any[]
      ) => {


        console.log(
          'Grupos recibidos:',
          grupos
        );


        this.grupos =
        grupos;


        this.cargando =
        false;

      },


      error: (
        error: any
      ) => {


        console.error(
          'Error cargando grupos:',
          error
        );


        this.error =
        'No se han podido cargar los grupos.';


          this.cargando =
          false;

      }

    });

  }


  /*
   * Ir a la página para
   * crear un nuevo grupo.
   */
  nuevoGrupo(): void {


    this.router.navigate([
      '/grupos/nuevo'
    ]);

  }


  /*
   * Abrir el detalle
   * de un grupo.
   */
  abrirGrupo(
    grupoId: number
  ): void {


    this.router.navigate([
      '/grupos',
      grupoId
    ]);

  }

}
