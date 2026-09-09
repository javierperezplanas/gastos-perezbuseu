import {
  Injectable
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  tap
} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class Auth {


  private apiUrl =
  'http://localhost:8080/api/auth';


  private usuarioSubject =
  new BehaviorSubject<any>(
    this.obtenerUsuarioGuardado()
  );


  usuario$ =
  this.usuarioSubject.asObservable();


  constructor(

    private http: HttpClient

  ) {}


  login(
    email: string,
    password: string
  ): Observable<any> {


    return this.http.post<any>(
      `${this.apiUrl}/login`,
      {
        email,
        password
      }
    )
    .pipe(

      tap(
        (usuario) => {


          localStorage.setItem(
            'usuario',
            JSON.stringify(usuario)
          );


          this.usuarioSubject.next(
            usuario
          );

        }
      )

    );

  }


  obtenerUsuario(): any {


    return this.usuarioSubject.value;

  }


  cerrarSesion(): void {


    localStorage.removeItem(
      'usuario'
    );


    this.usuarioSubject.next(
      null
    );

  }


  private obtenerUsuarioGuardado(): any {


    const usuario =
    localStorage.getItem(
      'usuario'
    );


    if (!usuario) {

      return null;

    }


    return JSON.parse(
      usuario
    );

  }

}
