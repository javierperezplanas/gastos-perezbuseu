import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Gastos
} from '../../services/gastos';


@Component({
  selector: 'app-gasto-detalle',

  imports: [
    CommonModule
  ],

  templateUrl: './gasto-detalle.html',

  styleUrl: './gasto-detalle.scss'
})
export class GastoDetalle
implements OnInit {


  /*
   * ID del grupo.
   */
  grupoId: number = 0;


  /*
   * ID del gasto.
   */
  gastoId: number = 0;


  /*
   * Datos del gasto.
   */
  gasto: any = null;


  /*
   * Indica si estamos
   * cargando los datos.
   */
  cargando: boolean = true;


  /*
   * Indica si estamos
   * eliminando el gasto.
   */
  eliminando: boolean = false;


  /*
   * Mensaje de error.
   */
  error: string = '';


  /*
   * Gastos del grupo.
   *
   * Se utilizan para calcular
   * la tendencia de los últimos
   * tres meses.
   */
  gastosGrupo: any[] = [];


  /*
   * Datos de la tendencia.
   */
  tendencia: any[] = [];


  /*
   * Indica si estamos cargando
   * la tendencia.
   */
  cargandoTendencia: boolean = false;


  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private gastosService: Gastos

  ) {}


  ngOnInit(): void {


    /*
     * Obtenemos el ID
     * del grupo.
     */
    this.grupoId =
    Number(
      this.route.snapshot.paramMap.get(
        'id'
      )
    );


    /*
     * Obtenemos el ID
     * del gasto.
     */
    this.gastoId =
    Number(
      this.route.snapshot.paramMap.get(
        'gastoId'
      )
    );


    /*
     * Cargamos el gasto.
     */
    this.cargarGasto();

  }


  /*
   * =====================
   *
   * CARGAR GASTO
   *
   * =====================
   */
  cargarGasto(): void {


    this.cargando =
    true;


    this.error =
    '';


    this.gastosService
    .obtenerGasto(
      this.gastoId
    )
    .subscribe({

      next: (gasto: any) => {


        console.log(
          'Gasto recibido:',
          gasto
        );


        console.log(
          'Tipo de división:',
          gasto.tipoDivision
        );


        console.log(
          'Repartos:',
          gasto.repartos
        );


        /*
         * Guardamos el gasto.
         */
        this.gasto =
        gasto;


        /*
         * Terminamos la carga
         * del gasto principal.
         */
        this.cargando =
        false;


        /*
         * Cargamos la tendencia
         * de la categoría.
         */
        this.cargarTendencia();

      },


      error: (error: any) => {


        console.error(
          'Error cargando gasto:',
          error
        );


        this.error =
        'No se ha podido cargar el gasto.';


        this.cargando =
        false;

      }

    });

  }


  /*
   * =====================
   *
   * CARGAR TENDENCIA
   *
   * =====================
   */
  cargarTendencia(): void {


    /*
     * Si todavía no tenemos
     * el gasto no hacemos nada.
     */
    if (!this.gasto) {

      return;

    }


    this.cargandoTendencia =
    true;


    /*
     * Obtenemos todos los gastos
     * del grupo.
     */
    this.gastosService
    .obtenerGastosPorGrupo(
      this.grupoId
    )
    .subscribe({

      next: (gastos: any[]) => {


        console.log(
          'Gastos del grupo para tendencia:',
          gastos
        );


        /*
         * Guardamos los gastos.
         */
        this.gastosGrupo =
        gastos || [];


        /*
         * Calculamos los últimos
         * tres meses.
         */
        this.calcularTendencia();


        this.cargandoTendencia =
        false;

      },


      error: (error: any) => {


        console.error(
          'Error cargando tendencia:',
          error
        );


        /*
         * No mostramos error en toda
         * la página porque el gasto
         * principal sigue funcionando.
         */
        this.tendencia =
        [];


        this.cargandoTendencia =
        false;

      }

    });

  }


  /*
   * =====================
   *
   * CALCULAR TENDENCIA
   *
   * =====================
   */
  calcularTendencia(): void {


    /*
     * Fecha actual.
     */
    const fechaActual =
    new Date();


    /*
     * Creamos los últimos
     * tres meses.
     */
    const meses: any[] =
    [];


    /*
     * Recorremos:
     *
     * - Hace 2 meses
     * - Hace 1 mes
     * - Mes actual
     */
    for (

      let i = 2;

      i >= 0;

      i--

    ) {


      const fecha =
      new Date(

        fechaActual.getFullYear(),

        fechaActual.getMonth() - i,

        1

      );


      const anio =
      fecha.getFullYear();


      const mes =
      fecha.getMonth();


      /*
       * Nombre corto.
       */
      const nombre =
      this.obtenerNombreMes(
        mes
      );


      /*
       * Calculamos el total
       * de la categoría durante
       * ese mes.
       */
      const total =
      this.gastosGrupo
      .filter(
        (gasto: any) => {


          /*
           * Debe ser de la misma
           * categoría.
           */
          if (

            gasto.categoria !==
            this.gasto.categoria

          ) {

            return false;

          }


          /*
           * Debe tener fecha.
           */
          if (!gasto.fechaHora) {

            return false;

          }


          const fechaGasto =
          new Date(
            gasto.fechaHora
          );


          return (

            fechaGasto.getFullYear()
            ===
            anio

            &&

            fechaGasto.getMonth()
            ===
            mes

          );

        }
      )
      .reduce(

        (
          total: number,

          gasto: any
        ) => {


          return (

            total +

            Number(
              gasto.importe || 0
            )

          );

        },

        0

      );


      meses.push({

        nombre:
        nombre,

        total:
        total,

        anio:
        anio,

        mes:
        mes

      });

    }


    /*
     * Calculamos el mayor importe.
     *
     * Nos sirve para calcular
     * el tamaño de las barras.
     */
    const mayorTotal =
    Math.max(

      ...meses.map(
        mes => mes.total
      ),

      0

    );


    /*
     * Añadimos el porcentaje
     * de cada barra.
     */
    this.tendencia =
    meses.map(
      mes => {


        let porcentaje =
        0;


        if (

          mayorTotal > 0

        ) {


          porcentaje =

          (
            mes.total /

            mayorTotal

          )

          *

          100;

        }


        return {

          ...mes,

          porcentaje:
          porcentaje

        };

      }
    );


    console.log(
      'Tendencia calculada:',
      this.tendencia
    );

  }


  /*
   * =====================
   *
   * NOMBRE DEL MES
   *
   * =====================
   */
  obtenerNombreMes(
    mes: number
  ): string {


    const meses = [

      'Ene',

      'Feb',

      'Mar',

      'Abr',

      'May',

      'Jun',

      'Jul',

      'Ago',

      'Sep',

      'Oct',

      'Nov',

      'Dic'

    ];


    return (
      meses[mes]
      ||
      ''
    );

  }


  /*
   * =====================
   *
   * EDITAR GASTO
   *
   * =====================
   */
  editarGasto(): void {


    this.router.navigate([
      '/grupos',
      this.grupoId,
      'editar-gasto',
      this.gastoId
    ]);

  }


  /*
   * =====================
   *
   * ELIMINAR GASTO
   *
   * =====================
   */
  eliminarGasto(): void {


    const confirmar =
    confirm(
      '¿Seguro que quieres eliminar este gasto?'
    );


    if (!confirmar) {

      return;

    }


    this.eliminando =
    true;


    this.error =
    '';


    this.gastosService
    .eliminarGasto(
      this.gastoId
    )
    .subscribe({

      next: () => {


        console.log(
          'Gasto eliminado correctamente'
        );


        /*
         * Volvemos al grupo.
         */
        this.router.navigate([
          '/grupos',
          this.grupoId
        ]);

      },


      error: (error: any) => {


        console.error(
          'Error eliminando gasto:',
          error
        );


        this.error =
        'No se ha podido eliminar el gasto.';


        this.eliminando =
        false;

      }

    });

  }


  /*
   * =====================
   *
   * VOLVER
   *
   * =====================
   */
  volver(): void {


    this.router.navigate([
      '/grupos',
      this.grupoId
    ]);

  }


  /*
   * =====================
   *
   * ICONO CATEGORÍA
   *
   * =====================
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
   * =====================
   *
   * NOMBRE CATEGORÍA
   *
   * =====================
   */
  obtenerNombreCategoria(
    categoria: string
  ): string {


    switch (categoria) {


      case 'GENERAL':

        return 'General';


      case 'ALIMENTOS':

        return 'Alimentos';


      case 'RESTAURANTES':

        return 'Restaurantes';


      case 'OTROS':

        return 'Otros';


      default:

        return (
          categoria
          ||
          'Sin categoría'
        );

    }

  }


  /*
   * =====================
   *
   * NOMBRE DIVISIÓN
   *
   * =====================
   */
  obtenerNombreTipoDivision(
    tipoDivision: string
  ): string {


    switch (tipoDivision) {


      case 'IGUAL':

        return 'Dividido por igual';


      case 'TOTAL_A_PAGADOR':

        return 'Se te debe la cantidad total';


      default:

        return 'Dividido por igual';

    }

  }


}