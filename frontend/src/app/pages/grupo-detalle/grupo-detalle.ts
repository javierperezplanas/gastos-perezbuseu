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

import {
  Auth
} from '../../services/auth';


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


  /*
   * Saldo del usuario
   * actualmente conectado.
   */
  saldoUsuario: number = 0;


  cargando: boolean = true;


  constructor(

    private route: ActivatedRoute,

      private router: Router,

        private gastosService: Gastos,

          private gruposService: GruposService,

            private authService: Auth

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


    /*
     * Cargamos el saldo
     * del usuario conectado.
     */
    this.cargarSaldoUsuario();

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
   * Cargar el saldo del
   * usuario conectado.
   */
  cargarSaldoUsuario(): void {


    const usuario =
    this.authService.obtenerUsuario();


    if (!usuario) {


      console.error(
        'No hay usuario conectado.'
      );


      return;

    }


    console.log(
      'Usuario conectado:',
      usuario
    );


    this.gastosService
    .obtenerBalances(
      this.grupoId
    )
    .subscribe({

      next: (
        balances: any[]
      ) => {


        console.log(
          'Balances recibidos:',
          balances
        );


        /*
         * Buscamos el balance
         * correspondiente al
         * usuario conectado.
         */
        const balanceUsuario =
        balances.find(

          (balance: any) =>

          balance.usuarioId ===
          usuario.id

          ||

          balance.idUsuario ===
          usuario.id

        );


        if (balanceUsuario) {


          this.saldoUsuario =
          Number(
            balanceUsuario.saldo
          );


          console.log(
            'Saldo del usuario:',
            this.saldoUsuario
          );


        } else {


          console.warn(
            'No se ha encontrado '
            +
            'el balance del usuario.'
          );


          this.saldoUsuario =
          0;

        }

      },


      error: (
        error: any
      ) => {


        console.error(
          'Error obteniendo saldo:',
          error
        );


        this.saldoUsuario =
        0;

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
   * Ver el detalle
   * de un gasto.
   */
  verGasto(
    gastoId: number
  ): void {


    this.router.navigate([
      '/grupos',
      this.grupoId,
      'gastos',
      gastoId
    ]);

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
