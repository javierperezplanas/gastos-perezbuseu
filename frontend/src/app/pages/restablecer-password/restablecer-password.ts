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
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Auth
} from '../../services/auth';


@Component({
  selector: 'app-restablecer-password',

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './restablecer-password.html',

  styleUrl: './restablecer-password.scss',
})
export class RestablecerPassword {


  token: string = '';


  password: string = '';


  confirmarPassword: string = '';


  cargando: boolean = false;


  correcto: boolean = false;


  error: string = '';


  constructor(

    private route: ActivatedRoute,

      private router: Router,

        private authService: Auth

  ) {


    this.token =
    this.route.snapshot.queryParamMap.get(
      'token'
    )
    ?? '';

  }


  restablecer(): void {


    this.error = '';


    if (!this.token) {

      this.error =
      'El enlace no es válido.';

    return;

    }


    if (!this.password) {

      this.error =
      'Introduce una nueva contraseña.';

      return;

    }


    if (
      this.password.length < 6
    ) {

      this.error =
      'La contraseña debe tener al menos 6 caracteres.';

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
    .restablecerPassword(
      this.token,
      this.password
    )
    .subscribe({

      next: () => {


        this.cargando =
        false;


        this.correcto =
        true;

      },


      error: (error: any) => {


        console.error(
          'Error restableciendo contraseña:',
          error
        );


        this.cargando =
        false;


        this.error =
        error?.error?.details
        ||
        error?.error?.message
        ||
        'El enlace no es válido o ha caducado.';

      }

    });

  }


  volverLogin(): void {


    this.router.navigate([
      '/login'
    ]);

  }

}
