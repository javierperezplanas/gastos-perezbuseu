import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class Gastos {


  private apiUrl =
  '/api/gastos';


  private gruposApiUrl =
  '/api/grupos';


  constructor(
    private http: HttpClient
  ) {}


  crearGasto(
    gasto: any
  ) {

    return this.http.post<any>(
      this.apiUrl,
      gasto
    );

  }


  obtenerGastosPorGrupo(
    grupoId: number
  ) {

    return this.http.get<any[]>(
      `${this.apiUrl}/grupo/${grupoId}`
    );

  }


  obtenerGasto(
    gastoId: number
  ) {

    return this.http.get<any>(
      `${this.apiUrl}/${gastoId}`
    );

  }


  actualizarGasto(
    gastoId: number,
    gasto: any
  ) {

    return this.http.put<any>(
      `${this.apiUrl}/${gastoId}`,
      gasto
    );

  }


  eliminarGasto(
    gastoId: number
  ) {

    return this.http.delete(
      `${this.apiUrl}/${gastoId}`
    );

  }


  obtenerBalances(
    grupoId: number
  ) {

    return this.http.get<any[]>(
      `${this.apiUrl}/grupo/${grupoId}/balances`
    );

  }


  obtenerLiquidaciones(
    grupoId: number
  ) {

    return this.http.get<any[]>(
      `${this.gruposApiUrl}/${grupoId}/liquidacion`
    );

  }


}
