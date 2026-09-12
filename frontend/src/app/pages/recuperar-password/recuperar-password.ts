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
  selector: 'app-recuperar-password',

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './recuperar-password.html',

  styleUrl: './recuperar-password.scss',
})
export class RecuperarPassword {


  email: string = '';


  cargando: boolean = false;


  enviado: boolean = false;


  error: string = '';


  constructor(

    private authService: Auth,

      private router: Router

  ) {}


  solicitar(): void {


    this.error = '';


    if (
      !this.email.trim()
    ) {

      this.error =
      'Introduce tu email.';

    return;

    }


    this.cargando =
    true;


    this.authService
    .solicitarResetPassword(
      this.email.trim()
    )
    .subscribe({

      next: () => {


        this.cargando =
        false;


        this.enviado =
        true;

      },


      error: (error: any) => {


        console.error(
          'Error solicitando recuperación:',
          error
        );


        this.cargando =
        false;


        /*
         * Por seguridad, el backend
         * no debe revelar si el email
         * existe o no.
         *
         * Aun así, mostramos un
         * mensaje genérico.
         */
        this.enviado =
        true;

      }

    });

  }


  volverLogin(): void {


    this.router.navigate([
      '/login'
    ]);

  }

}
