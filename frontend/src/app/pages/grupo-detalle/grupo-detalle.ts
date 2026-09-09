import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router,
  RouterLink
} from '@angular/router';

import {
  Gastos
} from '../../services/gastos';

import {
  Grupos as GruposService
} from '../../services/grupos';


@Component({
  selector: 'app-grupo-detalle',

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './grupo-detalle.html',

  styleUrl: './grupo-detalle.scss'
})
export class GrupoDetalle
implements OnInit {


  grupoId: number = 0;


  grupo: any = null;


  gastos: any[] = [];


  miembros: any[] = [];


  totalGastado: number = 0;


  cargando: boolean = true;


  constructor(

    private route: ActivatedRoute,

      private router: Router,

        private gastosService: Gastos,

          private gruposService: GruposService

  ) {}


  ngOnInit(): void {


    /*
     * Obtenemos el ID
     * del grupo desde la URL.
     */
    this.grupoId =
    Number(
      this.route.snapshot.paramMap.get(
        'id'
      )
    );


    this.cargarGrupo();


    this.cargarGastos();


    this.cargarMiembros();

  }


  /*
   * Cargar información
   * del grupo.
   */
  cargarGrupo(): void {


    this.gruposService
    .obtenerGrupo(
      this.grupoId
    )
    .subscribe({

      next: (grupo: any) => {


        console.log(
          'Grupo recibido:',
          grupo
        );


        this.grupo =
        grupo;

      },


      error: (error: any) => {


        console.error(
          'Error cargando grupo:',
          error
        );

      }

    });

  }


  /*
   * Cargar gastos
   * del grupo.
   */
  cargarGastos(): void {


    this.gastosService
    .obtenerGastosPorGrupo(
      this.grupoId
    )
    .subscribe({

      next: (respuesta: any[]) => {


        console.log(
          'Gastos recibidos:',
          respuesta
        );


        this.gastos =
        respuesta;


        this.calcularTotal();


        this.cargando =
        false;

      },


      error: (error: any) => {


        console.error(
          'Error obteniendo gastos:',
          error
        );


        this.cargando =
        false;

      }

    });

  }


  /*
   * Cargar miembros
   * del grupo.
   */
  cargarMiembros(): void {


    this.gruposService
    .obtenerMiembros(
      this.grupoId
    )
    .subscribe({

      next: (miembros: any[]) => {


        console.log(
          'Miembros recibidos:',
          miembros
        );


        this.miembros =
        miembros;

      },


      error: (error: any) => {


        console.error(
          'Error obteniendo miembros:',
          error
        );

      }

    });

  }


  /*
   * Calcular el total
   * gastado.
   */
  calcularTotal(): void {


    this.totalGastado =
    0;


    for (
      const gasto of this.gastos
    ) {


      this.totalGastado +=
      Number(
        gasto.importe
      );

    }

  }


  /*
   * Obtener sólo
   * los últimos gastos.
   */
  obtenerUltimosGastos(): any[] {


    return this.gastos
    .slice()
    .reverse()
    .slice(0, 5);

  }


  /*
   * Icono según
   * categoría.
   */
  obtenerIconoCategoria(
    categoria: string
  ): string {


    switch (categoria) {


      case 'GENERAL':

        return '🌐';


      case 'ALIMENTOS':

        return '🛒';


      case 'RESTAURANTES':

        return '🍽️';


      case 'OTROS':

        return '📦';


      default:

        return '💸';

    }

  }


  /*
   * Editar gasto.
   */
  editarGasto(
    gastoId: number
  ): void {


    this.router.navigate([
      '/grupos',
      this.grupoId,
      'editar-gasto',
      gastoId
    ]);

  }


  /*
   * Eliminar gasto.
   */
  eliminarGasto(
    gastoId: number
  ): void {


    const confirmar =
    confirm(
      '¿Seguro que quieres eliminar este gasto?'
    );


    if (!confirmar) {

      return;

    }


    this.gastosService
    .eliminarGasto(
      gastoId
    )
    .subscribe({

      next: () => {


        console.log(
          'Gasto eliminado correctamente'
        );


        this.cargarGastos();

      },


      error: (error: any) => {


        console.error(
          'Error eliminando gasto:',
          error
        );


        alert(
          'No se ha podido eliminar el gasto'
        );

      }

    });

  }


  /*
   * Obtener iniciales
   * para el avatar.
   */
  obtenerIniciales(
    miembro: any
  ): string {


    if (
      !miembro?.usuario?.nombre
    ) {

      return '?';

    }


    return miembro.usuario.nombre
    .charAt(0)
    .toUpperCase();

  }

}
