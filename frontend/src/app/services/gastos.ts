import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class Gastos {


  private apiUrl =
  'http://localhost:8080/api/gastos';


  constructor(
    private http: HttpClient
  ) {}


  crearGasto(gasto: any) {

    return this.http.post(
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


  eliminarGasto(
    gastoId: number
  ) {

    return this.http.delete(
      `${this.apiUrl}/${gastoId}`
    );

  }


}
