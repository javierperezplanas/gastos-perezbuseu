import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class Pagos {


  private apiUrl =
  'http://localhost:8080/api/pagos';


  constructor(
    private http: HttpClient
  ) {}


  /*
   * Registrar un pago de deuda.
   */
  registrarPago(
    pago: any
  ) {

    return this.http.post<any>(
      this.apiUrl,
      pago
    );

  }


  /*
   * Obtener los pagos
   * de un grupo.
   */
  obtenerPagosPorGrupo(
    grupoId: number
  ) {

    return this.http.get<any[]>(
      `${this.apiUrl}/grupo/${grupoId}`
    );

  }


  /*
   * Eliminar un pago de deuda.
   */
  eliminarPago(
    pagoId: number
  ) {

    return this.http.delete(
      `${this.apiUrl}/${pagoId}`
    );

  }

}
