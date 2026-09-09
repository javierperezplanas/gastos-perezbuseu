import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class Pagos {


  private apiUrl =
  'http://localhost:8080/api/pagos';


  constructor(
    private http: HttpClient
  ) {}


  registrarPago(
    pago: any
  ) {

    return this.http.post<any>(
      this.apiUrl,
      pago
    );

  }


  obtenerPagosPorGrupo(
    grupoId: number
  ) {

    return this.http.get<any[]>(
      `${this.apiUrl}/grupo/${grupoId}`
    );

  }

}
