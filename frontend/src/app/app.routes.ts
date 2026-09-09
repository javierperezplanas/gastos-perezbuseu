import { Routes } from '@angular/router';

import { Grupos } from './pages/grupos/grupos';
import { GrupoDetalle } from './pages/grupo-detalle/grupo-detalle';
import { NuevoGasto } from './pages/nuevo-gasto/nuevo-gasto';
import { Balances } from './pages/balances/balances';


export const routes: Routes = [

  {
    path: '',
    redirectTo: 'grupos',
    pathMatch: 'full'
  },


{
  path: 'grupos',
  component: Grupos
},


{
  path: 'grupos/:id',
  component: GrupoDetalle
},


{
  path: 'grupos/:id/nuevo-gasto',
  component: NuevoGasto
},


{
  path: 'grupos/:id/editar-gasto/:gastoId',
  component: NuevoGasto
},


{
  path: 'grupos/:id/balances',
  component: Balances
}

];
