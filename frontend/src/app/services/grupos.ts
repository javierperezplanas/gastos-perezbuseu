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
export class Grupos {


  private readonly apiUrl =
  'http://localhost:8080/api/grupos';


  private readonly usuariosApiUrl =
  'http://localhost:8080/api/usuarios';


  constructor(

    private http: HttpClient

  ) {}


  /*
   * Obtener los grupos
   * de un usuario.
   */
  obtenerGruposPorUsuario(
    usuarioId: number
  ): Observable<any[]> {


    return this.http.get<any[]>(
      `${this.apiUrl}/usuario/${usuarioId}`
    );

  }


  /*
   * Obtener un grupo
   * por su ID.
   */
  obtenerGrupo(
    grupoId: number
  ): Observable<any> {


    return this.http.get<any>(
      `${this.apiUrl}/${grupoId}`
    );

  }


  /*
   * Crear un nuevo grupo.
   */
  crearGrupo(
    grupo: any
  ): Observable<any> {


    return this.http.post<any>(
      this.apiUrl,
      grupo
    );

  }


  /*
   * Obtener los miembros
   * de un grupo.
   */
  obtenerMiembros(
    grupoId: number
  ): Observable<any[]> {


    return this.http.get<any[]>(
      `${this.apiUrl}/${grupoId}/miembros`
    );

  }


  /*
   * Buscar un usuario
   * por su email.
   */
  buscarUsuarioPorEmail(
    email: string
  ): Observable<any> {


    return this.http.get<any>(
      `${this.usuariosApiUrl}/email/${encodeURIComponent(email)}`
    );

  }


  /*
   * Añadir un miembro
   * a un grupo.
   */
  anadirMiembro(
    grupoId: number,
    usuarioId: number
  ): Observable<any> {


    return this.http.post<any>(
      `${this.apiUrl}/${grupoId}/miembros/${usuarioId}`,
      {}
    );

  }


  /*
   * Eliminar un miembro
   * de un grupo.
   *
   * Esto NO elimina
   * al usuario de la BBDD.
   */
  eliminarMiembro(
    grupoId: number,
    usuarioId: number
  ): Observable<any> {


    return this.http.delete<any>(
      `${this.apiUrl}/${grupoId}/miembros/${usuarioId}`
    );

  }


  /*
   * Actualizar un grupo.
   */
  actualizarGrupo(
    grupoId: number,
    nombre: string,
    descripcion: string
  ): Observable<any> {


    return this.http.put<any>(
      `${this.apiUrl}/${grupoId}`,
      {
        nombre,
        descripcion
      }
    );

  }


  /*
   * Eliminar un grupo.
   *
   * El backend eliminará:
   *
   * - Repartos.
   * - Gastos.
   * - Pagos.
   * - Miembros del grupo.
   * - El grupo.
   *
   * Los usuarios NO se eliminan.
   */
  eliminarGrupo(
    grupoId: number
  ): Observable<any> {


    return this.http.delete<any>(
      `${this.apiUrl}/${grupoId}`
    );

  }


  /*
   * Subir la foto
   * de un grupo.
   */
  subirFoto(
    grupoId: number,
    archivo: File
  ): Observable<any> {


    const formData =
    new FormData();


    formData.append(
      'foto',
      archivo
    );


    return this.http.post<any>(
      `${this.apiUrl}/${grupoId}/foto`,
      formData
    );

  }

}
