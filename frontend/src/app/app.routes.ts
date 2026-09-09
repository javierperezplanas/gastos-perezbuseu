import { Routes } from '@angular/router';

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
  NuevoGasto
} from './pages/nuevo-gasto/nuevo-gasto';

import {
  EditarGasto
} from './pages/editar-gasto/editar-gasto';

import {
  Balances
} from './pages/balances/balances';

import {
  Actividad
} from './pages/actividad/actividad';

import {
  authGuard
} from './guards/auth-guard';

import {
  loginGuard
} from './guards/login-guard';


export const routes: Routes = [


  /*
   * LOGIN
   *
   * Si ya hay sesión,
   * redirige a grupos.
   */
  {
    path: 'login',

    component: Login,

    canActivate: [
      loginGuard
    ]
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
 *
 * Esta ruta debe ir después
 * de las rutas más específicas.
 */
{
  path: 'grupos/:id',

  component: GrupoDetalle,

  canActivate: [
    authGuard
  ]
}

];
