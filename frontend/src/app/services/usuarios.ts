import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Usuarios {


  private readonly apiUrl =
  'http://localhost:8080/api/usuarios';


  constructor(

    private http: HttpClient

  ) {}


  /*
   * Buscar un usuario
   * por su email.
   */
  buscarPorEmail(
    email: string
  ): Observable<any> {


    return this.http.get<any>(
      `${this.apiUrl}/email/${email}`
    );

  }

}
