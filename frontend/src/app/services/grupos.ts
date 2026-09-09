import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Grupos {

  private readonly apiUrl =
  'http://localhost:8080/api/grupos';

  constructor(
    private http: HttpClient
  ) {}

  obtenerGrupos() {

    return this.http.get<any[]>(
      this.apiUrl
    );

  }

}
