import {
  Routes
} from '@angular/router';

import {
  Login
} from './pages/login/login';

import {
  Grupos
} from './pages/grupos/grupos';

import {
  GrupoDetalle
} from './pages/grupo-detalle/grupo-detalle';

import {
  GastoDetalle
} from './pages/gasto-detalle/gasto-detalle';

import {
  NuevoGrupo
} from './pages/nuevo-grupo/nuevo-grupo';

import {
  NuevoGasto
} from './pages/nuevo-gasto/nuevo-gasto';

import {
  EditarGasto
} from './pages/editar-gasto/editar-gasto';

import {
  EditarGrupo
} from './pages/editar-grupo/editar-grupo';

import {
  Balances
} from './pages/balances/balances';

import {
  Actividad
} from './pages/actividad/actividad';

import {
  RecuperarPassword
} from './pages/recuperar-password/recuperar-password';

import {
  RestablecerPassword
} from './pages/restablecer-password/restablecer-password';

import {
  authGuard
} from './guards/auth-guard';

import {
  loginGuard
} from './guards/login-guard';


export const routes: Routes = [


  /*
   * LOGIN
   */
  {
    path: 'login',

    component: Login,

    canActivate: [
      loginGuard
    ]
  },


  /*
   * RECUPERAR CONTRASEÑA
   */
  {
    path: 'recuperar-password',

    component: RecuperarPassword
  },


  /*
   * RESTABLECER CONTRASEÑA
   */
  {
    path: 'restablecer-password',

    component: RestablecerPassword
  },


  /*
   * PÁGINA INICIAL
   */
  {
    path: '',

    redirectTo: 'login',

    pathMatch: 'full'
  },


  /*
   * GRUPOS
   */
  {
    path: 'grupos',

    component: Grupos,

    canActivate: [
      authGuard
    ]
  },


  /*
   * NUEVO GRUPO
   */
  {
    path: 'grupos/nuevo',

    component: NuevoGrupo,

    canActivate: [
      authGuard
    ]
  },


  /*
   * NUEVO GASTO
   */
  {
    path: 'grupos/:id/nuevo-gasto',

    component: NuevoGasto,

    canActivate: [
      authGuard
    ]
  },


  /*
   * DETALLE DEL GASTO
   */
  {
    path: 'grupos/:id/gastos/:gastoId',

    component: GastoDetalle,

    canActivate: [
      authGuard
    ]
  },


  /*
   * EDITAR GASTO
   */
  {
    path: 'grupos/:id/editar-gasto/:gastoId',

    component: EditarGasto,

    canActivate: [
      authGuard
    ]
  },


  /*
   * EDITAR GRUPO
   */
  {
    path: 'grupos/:id/editar',

    component: EditarGrupo,

    canActivate: [
      authGuard
    ]
  },


  /*
   * ACTIVIDAD
   */
  {
    path: 'grupos/:id/actividad',

    component: Actividad,

    canActivate: [
      authGuard
    ]
  },


  /*
   * BALANCES
   */
  {
    path: 'grupos/:id/balances',

    component: Balances,

    canActivate: [
      authGuard
    ]
  },


  /*
   * DETALLE DEL GRUPO
   */
  {
    path: 'grupos/:id',

    component: GrupoDetalle,

    canActivate: [
      authGuard
    ]
  }

];