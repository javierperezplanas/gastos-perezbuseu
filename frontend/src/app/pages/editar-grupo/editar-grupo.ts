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


  cargando: boolean = false;

  subiendoFoto: boolean = false;

  eliminando: boolean = false;

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

  }


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
