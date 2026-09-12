import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';


@Injectable({
  providedIn: 'root',
})
export class Actividades {


  private apiUrl =
  '/api/actividades';


  constructor(
    private http: HttpClient
  ) {}


  obtenerActividadesPorGrupo(
    grupoId: number
  ) {

    return this.http.get<any[]>(
      `${this.apiUrl}/grupo/${grupoId}`
    );

  }

}
