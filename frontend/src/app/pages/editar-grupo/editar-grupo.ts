import {
  Component,
  OnInit
} from '@angular/core';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Grupos as GruposService
} from '../../services/grupos';


@Component({
  selector: 'app-editar-grupo',

  imports: [
    FormsModule
  ],

  templateUrl: './editar-grupo.html',

  styleUrl: './editar-grupo.scss',
})
export class EditarGrupo
implements OnInit {


  grupoId: number = 0;


  nombre: string = '';


  descripcion: string = '';


  /*
   * Ruta de la foto
   * del grupo.
   */
  foto: string = '';


  /*
   * Archivo seleccionado
   * por el usuario.
   */
  fotoSeleccionada:
  File | null = null;


  /*
   * Miembros del grupo.
   */
  miembros: any[] = [];


  /*
   * Email para buscar
   * un nuevo miembro.
   */
  emailNuevoMiembro: string = '';


  /*
   * Usuario encontrado
   * mediante el email.
   */
  usuarioEncontrado: any = null;


  cargando: boolean = false;


  subiendoFoto: boolean = false;


  eliminando: boolean = false;


  buscandoUsuario: boolean = false;


  agregandoMiembro: boolean = false;


  eliminandoMiembroId:
  number | null = null;


  error: string = '';


  constructor(

    private route: ActivatedRoute,

      private router: Router,

        private gruposService: GruposService

  ) {}


  ngOnInit(): void {


    /*
     * Obtenemos el ID
     * de la URL.
     */
    this.grupoId =
    Number(
      this.route.snapshot.paramMap.get(
        'id'
      )
    );


    /*
     * Cargamos los datos
     * del grupo.
     */
    this.cargarGrupo();


    /*
     * Cargamos los miembros.
     */
    this.cargarMiembros();

  }


  /*
   * Cargar los datos
   * del grupo.
   */
  cargarGrupo(): void {


    this.cargando =
    true;


    this.error =
    '';


    this.gruposService
    .obtenerGrupo(
      this.grupoId
    )
    .subscribe({

      next: (grupo) => {


        console.log(
          'Grupo recibido:',
          grupo
        );


        this.nombre =
        grupo.nombre;


        this.descripcion =
        grupo.descripcion;


        this.foto =
        grupo.foto || '';


        this.cargando =
        false;

      },


      error: (error) => {


        console.error(
          'Error cargando grupo:',
          error
        );


        this.error =
        'No se ha podido cargar el grupo.';


          this.cargando =
          false;

      }

    });

  }


  /*
   * Cargar los miembros
   * del grupo.
   */
  cargarMiembros(): void {


    this.gruposService
    .obtenerMiembros(
      this.grupoId
    )
    .subscribe({

      next: (miembros) => {


        console.log(
          'Miembros recibidos:',
          miembros
        );


        this.miembros =
        miembros;

      },


      error: (error) => {


        console.error(
          'Error cargando miembros:',
          error
        );


        this.error =
        'No se han podido cargar los miembros.';

      }

    });

  }


  /*
   * Buscar un usuario
   * utilizando su email.
   */
  buscarUsuario(): void {


    this.error =
    '';


    this.usuarioEncontrado =
    null;


    const email =
    this.emailNuevoMiembro.trim();


    if (!email) {


      this.error =
      'Introduce el email del usuario.';


    return;

    }


    this.buscandoUsuario =
    true;


    this.gruposService
    .buscarUsuarioPorEmail(
      email
    )
    .subscribe({

      next: (usuario) => {


        console.log(
          'Usuario encontrado:',
          usuario
        );


        this.usuarioEncontrado =
        usuario;


        this.buscandoUsuario =
        false;

      },


      error: (error) => {


        console.error(
          'Usuario no encontrado:',
          error
        );


        this.usuarioEncontrado =
        null;


        this.buscandoUsuario =
        false;


        this.error =
        'No existe ningún usuario con ese email.';

      }

    });

  }


  /*
   * Añadir el usuario
   * encontrado al grupo.
   */
  anadirMiembro(): void {


    if (
      !this.usuarioEncontrado
    ) {

      return;

    }


    this.error =
    '';


    /*
     * Comprobamos que el usuario
     * no sea ya miembro.
     */
    const yaEsMiembro =
    this.miembros.some(
      (miembro) =>
      miembro.usuario.id
      ===
      this.usuarioEncontrado.id
    );


    if (yaEsMiembro) {


      this.error =
      'Este usuario ya pertenece al grupo.';


    return;

    }


    this.agregandoMiembro =
    true;


    this.gruposService
    .anadirMiembro(
      this.grupoId,
      this.usuarioEncontrado.id
    )
    .subscribe({

      next: (miembro) => {


        console.log(
          'Miembro añadido:',
          miembro
        );


        this.agregandoMiembro =
        false;


        /*
         * Limpiamos la búsqueda.
         */
        this.emailNuevoMiembro =
        '';


    this.usuarioEncontrado =
    null;


    /*
     * Recargamos los miembros.
     */
    this.cargarMiembros();

      },


      error: (error) => {


        console.error(
          'Error añadiendo miembro:',
          error
        );


        this.agregandoMiembro =
        false;


        this.error =
        'No se ha podido añadir el miembro.';

      }

    });

  }


  /*
   * Eliminar un miembro
   * del grupo.
   *
   * El usuario NO se elimina
   * de la base de datos.
   */
  eliminarMiembro(
    miembro: any
  ): void {


    const confirmar =
    confirm(
      '¿Seguro que quieres eliminar a '
      +
      miembro.usuario.nombre
      +
      ' del grupo?'
    );


    if (!confirmar) {


      return;

    }


    this.error =
    '';


    this.eliminandoMiembroId =
    miembro.usuario.id;


    this.gruposService
    .eliminarMiembro(
      this.grupoId,
      miembro.usuario.id
    )
    .subscribe({

      next: () => {


        console.log(
          'Miembro eliminado correctamente'
        );


        this.eliminandoMiembroId =
        null;


        /*
         * Recargamos los miembros.
         */
        this.cargarMiembros();

      },


      error: (error) => {


        console.error(
          'Error eliminando miembro:',
          error
        );


        this.eliminandoMiembroId =
        null;


        this.error =
        'No se ha podido eliminar el miembro.';

      }

    });

  }


  /*
   * Detecta la imagen
   * seleccionada.
   */
  seleccionarFoto(
    evento: Event
  ): void {


    const input =
    evento.target as HTMLInputElement;


    if (
      !input.files
      ||
      input.files.length === 0
    ) {


      return;

    }


    const archivo =
    input.files[0];


    /*
     * Comprobamos que sea
     * una imagen.
     */
    if (
      !archivo.type.startsWith(
        'image/'
      )
    ) {


      this.error =
      'El archivo seleccionado debe ser una imagen.';


        return;

    }


    this.error =
    '';


    this.fotoSeleccionada =
    archivo;

  }


  /*
   * Sube la foto
   * al backend.
   */
  subirFoto(): void {


    if (
      !this.fotoSeleccionada
    ) {


      return;

    }


    this.error =
    '';


    this.subiendoFoto =
    true;


    this.gruposService
    .subirFoto(
      this.grupoId,
      this.fotoSeleccionada
    )
    .subscribe({

      next: (grupo) => {


        console.log(
          'Foto subida:',
          grupo
        );


        this.foto =
        grupo.foto;


        this.fotoSeleccionada =
        null;


        this.subiendoFoto =
        false;

      },


      error: (error) => {


        console.error(
          'Error subiendo foto:',
          error
        );


        this.error =
        'No se ha podido subir la foto.';


          this.subiendoFoto =
          false;

      }

    });

  }


  /*
   * Guardar los cambios
   * del grupo.
   */
  guardar(): void {


    this.error =
    '';


    if (
      !this.nombre.trim()
    ) {


      this.error =
      'El nombre del grupo es obligatorio.';


    return;

    }


    this.cargando =
    true;


    this.gruposService
    .actualizarGrupo(
      this.grupoId,
      this.nombre,
      this.descripcion
    )
    .subscribe({

      next: (grupo) => {


        console.log(
          'Grupo actualizado:',
          grupo
        );


        this.cargando =
        false;


        this.router.navigate([
          '/grupos',
          this.grupoId
        ]);

      },


      error: (error) => {


        console.error(
          'Error actualizando grupo:',
          error
        );


        this.error =
        'No se ha podido guardar el grupo.';


          this.cargando =
          false;

      }

    });

  }


  /*
   * Eliminar el grupo.
   */
  eliminarGrupo(): void {


    const confirmar =
    confirm(
      '¿Seguro que quieres eliminar este grupo?\n\n'
      +
      'Se eliminarán también los gastos, '
      +
      'pagos y miembros asociados al grupo.\n\n'
      +
      'Los usuarios no se eliminarán.'
    );


    if (!confirmar) {


      return;

    }


    this.error =
    '';


    this.eliminando =
    true;


    this.gruposService
    .eliminarGrupo(
      this.grupoId
    )
    .subscribe({

      next: () => {


        console.log(
          'Grupo eliminado correctamente'
        );


        this.eliminando =
        false;


        /*
         * Volvemos a la lista
         * de grupos.
         */
        this.router.navigate([
          '/grupos'
        ]);

      },


      error: (error) => {


        console.error(
          'Error eliminando grupo:',
          error
        );


        this.error =
        'No se ha podido eliminar el grupo.';


          this.eliminando =
          false;

      }

    });

  }


  cancelar(): void {


    this.router.navigate([
      '/grupos',
      this.grupoId
    ]);

  }

}
