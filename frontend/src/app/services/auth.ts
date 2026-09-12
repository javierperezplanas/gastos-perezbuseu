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
  '/api/auth';


  private usuarioSubject =
  new BehaviorSubject<any>(
    this.obtenerUsuarioGuardado()
  );


  usuario$ =
  this.usuarioSubject.asObservable();


  constructor(

    private http: HttpClient

  ) {}


  /*
   * Iniciar sesión.
   */
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


  /*
   * Registrar un nuevo usuario.
   *
   * Después del registro,
   * iniciamos sesión automáticamente.
   */
  register(
    nombre: string,
    email: string,
    password: string
  ): Observable<any> {


    return this.http.post<any>(
      `${this.apiUrl}/register`,
      {
        nombre,
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


  /*
   * Solicitar recuperación
   * de contraseña.
   */
  solicitarResetPassword(
    email: string
  ): Observable<any> {


    return this.http.post<any>(
      `${this.apiUrl}/forgot-password`,
      {
        email
      }
    );

  }


  /*
   * Restablecer contraseña
   * usando el token del correo.
   */
  restablecerPassword(
    token: string,
    password: string
  ): Observable<any> {


    return this.http.post<any>(
      `${this.apiUrl}/reset-password`,
      {
        token,
        password
      }
    );

  }


  /*
   * Obtener el usuario
   * actualmente conectado.
   */
  obtenerUsuario(): any {


    return this.usuarioSubject.value;

  }


  /*
   * Cerrar sesión.
   */
  cerrarSesion(): void {


    localStorage.removeItem(
      'usuario'
    );


    this.usuarioSubject.next(
      null
    );

  }


  /*
   * Recuperar el usuario
   * guardado al iniciar
   * la aplicación.
   */
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