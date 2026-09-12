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


  /*
   * Indica si estamos en
   * modo registro.
   *
   * false = Login
   * true = Registro
   */
  modoRegistro: boolean = false;


  nombre: string = '';


  email: string = '';


  password: string = '';


  confirmarPassword: string = '';


  cargando: boolean = false;


  error: string = '';


  constructor(

    private router: Router,

    private authService: Auth

  ) {}


  /*
   * Cambiar entre login
   * y registro.
   */
  cambiarModo(): void {


    this.modoRegistro =
    !this.modoRegistro;


    this.error = '';

    this.nombre = '';

    this.email = '';

    this.password = '';

    this.confirmarPassword = '';

  }


  /*
   * Ir a recuperar contraseña.
   */
  recuperarPassword(): void {


    this.router.navigate([
      '/recuperar-password'
    ]);

  }


  /*
   * Iniciar sesión.
   */
  iniciarSesion(): void {


    this.error = '';


    if (
      !this.email.trim()
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
      this.email.trim(),
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


  /*
   * Crear una cuenta.
   */
  registrarse(): void {


    this.error = '';


    if (
      !this.nombre.trim()
    ) {

      this.error =
      'Introduce tu nombre.';

      return;

    }


    if (
      !this.email.trim()
    ) {

      this.error =
      'Introduce tu email.';

      return;

    }


    if (
      !this.password
    ) {

      this.error =
      'Introduce una contraseña.';

      return;

    }


    if (
      this.password !==
      this.confirmarPassword
    ) {

      this.error =
      'Las contraseñas no coinciden.';

      return;

    }


    this.cargando =
    true;


    this.authService
    .register(
      this.nombre.trim(),
      this.email.trim(),
      this.password
    )
    .subscribe({

      next: (usuario: any) => {


        console.log(
          'Usuario registrado:',
          usuario
        );


        this.cargando =
        false;


        this.router.navigate([
          '/grupos'
        ]);

      },


      error: (error: any) => {


        console.error(
          'Error registrando:',
          error
        );


        this.cargando =
        false;


        this.error =
        error?.error?.details
        ||
        error?.error?.message
        ||
        'No se ha podido crear la cuenta.';

      }

    });

  }

}