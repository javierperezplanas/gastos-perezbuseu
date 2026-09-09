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


@Component({
  selector: 'app-login',

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './login.html',

  styleUrl: './login.scss',
})
export class Login {


  email: string = '';


  password: string = '';


  cargando: boolean = false;


  error: string = '';


  constructor(

    private router: Router,

      private authService: Auth

  ) {}


  iniciarSesion(): void {


    this.error = '';


    /*
     * Comprobamos que se hayan
     * introducido los datos.
     */
    if (
      !this.email
      ||
      !this.password
    ) {

      this.error =
      'Introduce el email y la contraseña.';

    return;

    }


    this.cargando =
    true;


    this.authService
    .login(
      this.email,
      this.password
    )
    .subscribe({

      next: (respuesta: any) => {


        console.log(
          'Login correcto:',
          respuesta
        );


        this.cargando =
        false;


        /*
         * El usuario ya ha sido
         * guardado por Auth.
         *
         * Vamos a los grupos.
         */
        this.router.navigate([
          '/grupos'
        ]);

      },


      error: (error: any) => {


        console.error(
          'Error en login:',
          error
        );


        this.cargando =
        false;


        this.error =
        'Email o contraseña incorrectos.';

      }

    });

  }

}
