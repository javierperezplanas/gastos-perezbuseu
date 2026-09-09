import {
  inject
} from '@angular/core';

import {
  CanActivateFn,
  Router
} from '@angular/router';

import {
  Auth
} from '../services/auth';


export const loginGuard: CanActivateFn =
() => {


  const authService =
  inject(Auth);


  const router =
  inject(Router);


  const usuario =
  authService.obtenerUsuario();


  /*
   * Si ya hay un usuario
   * conectado, vamos a grupos.
   */
  if (usuario) {

    return router.createUrlTree([
      '/grupos'
    ]);

  }


  /*
   * Si no hay usuario,
   * permitimos ver el login.
   */
  return true;

};
