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


export const authGuard: CanActivateFn =
() => {


  const authService =
  inject(Auth);


  const router =
  inject(Router);


  const usuario =
  authService.obtenerUsuario();


  /*
   * Si hay usuario,
   * permitimos entrar.
   */
  if (usuario) {

    return true;

  }


  /*
   * Si no hay usuario,
   * enviamos al login.
   */
  return router.createUrlTree([
    '/login'
  ]);

};
