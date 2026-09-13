import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild
} from '@angular/core';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  ActivatedRoute
} from '@angular/router';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

import {
  Gastos
} from '../../services/gastos';


Chart.register(
  ...registerables
);


@Component({
  selector: 'app-estadisticas-categorias',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './estadisticas-categorias.html',

  styleUrl: './estadisticas-categorias.scss'
})
export class EstadisticasCategorias
implements
AfterViewInit,
OnDestroy {


  /*
   * =====================
   * REFERENCIA AL CANVAS
   * =====================
   */

  @ViewChild(
    'graficoCategorias'
  )
  graficoCategorias?: ElementRef<
    HTMLCanvasElement
  >;


  /*
   * =====================
   * DATOS
   * =====================
   */

  grupoId!: number;


  /*
   * Todos los gastos
   * del grupo.
   */

  gastos: any[] = [];


  /*
   * Gastos después de
   * aplicar el filtro
   * del mes.
   */

  gastosFiltrados: any[] = [];


  /*
   * Categorías calculadas
   * según el filtro actual.
   */

  categorias: any[] = [];


  /*
   * Meses disponibles
   * para el selector.
   */

  mesesDisponibles: any[] = [];


  /*
   * Mes seleccionado.
   *
   * "todos" =
   * mostrar todos los gastos.
   */

  mesSeleccionado = 'todos';


  totalGastado = 0;


  numeroCategorias = 0;


  categoriaMayorGasto = '';


  importeMayorGasto = 0;


  cargando = true;


  error = '';


  grafico: Chart | null = null;


  constructor(

    private route:
    ActivatedRoute,

    private location:
    Location,

    private gastosService:
    Gastos

  ) {}


  /*
   * =====================
   * INICIALIZACIÓN
   * =====================
   */

  ngAfterViewInit(): void {


    this.grupoId =
    Number(
      this.route.snapshot.paramMap.get(
        'id'
      )
    );


    if (
      !this.grupoId
    ) {


      this.error =
      'No se ha podido identificar el grupo.';


      this.cargando =
      false;


      return;

    }


    this.cargarGastos();

  }


  /*
   * =====================
   * CARGAR GASTOS
   * =====================
   */

  cargarGastos(): void {


    this.cargando =
    true;


    this.error =
    '';


    this.gastosService
    .obtenerGastosPorGrupo(
      this.grupoId
    )
    .subscribe({


      next: (
        gastos
      ) => {


        this.gastos =
        gastos || [];


        /*
         * Obtenemos los meses
         * disponibles.
         */

        this.obtenerMesesDisponibles();


        /*
         * Aplicamos el filtro
         * inicial.
         */

        this.aplicarFiltroMes();


        /*
         * Indicamos que la
         * carga ha terminado.
         */

        this.cargando =
        false;


        /*
         * Esperamos a que Angular
         * termine de pintar
         * completamente la vista.
         *
         * Esto evita que el gráfico
         * aparezca en blanco en
         * algunas ocasiones,
         * especialmente en móvil.
         */

        setTimeout(
          () => {


            if (
              this.gastosFiltrados.length > 0
            ) {


              this.crearGrafico();

            }


          },
          100
        );

      },


      error: (
        error
      ) => {


        console.error(
          'Error cargando gastos por categoría:',
          error
        );


        this.error =
        'No se han podido cargar los gastos del grupo.';


        this.cargando =
        false;

      }


    });

  }


  /*
   * =====================
   * OBTENER FECHA DEL GASTO
   * =====================
   *
   * El backend utiliza:
   *
   * fechaHora
   *
   * Mantenemos también
   * compatibilidad con
   * fecha por si en algún
   * momento cambia.
   */

  obtenerFechaGasto(
    gasto: any
  ): Date | null {


    const valorFecha =

    gasto.fechaHora
    ||
    gasto.fecha;


    if (
      !valorFecha
    ) {


      return null;

    }


    const fecha =
    new Date(
      valorFecha
    );


    if (
      isNaN(
        fecha.getTime()
      )
    ) {


      return null;

    }


    return fecha;

  }


  /*
   * =====================
   * OBTENER MESES
   * DISPONIBLES
   * =====================
   */

  obtenerMesesDisponibles(): void {


    const meses =
    new Map<
      string,
      any
    >();


    this.gastos.forEach(

      (
        gasto
      ) => {


        /*
         * Obtenemos la fecha
         * del gasto.
         */

        const fecha =
        this.obtenerFechaGasto(
          gasto
        );


        if (
          !fecha
        ) {


          return;

        }


        const anio =
        fecha.getFullYear();


        const mes =
        fecha.getMonth();


        /*
         * Ejemplo:
         *
         * 2026-09
         */

        const clave =
        `${anio}-${String(
          mes + 1
        ).padStart(
          2,
          '0'
        )}`;


        if (
          !meses.has(
            clave
          )
        ) {


          const nombre =
          new Intl.DateTimeFormat(

            'es-ES',

            {
              month: 'long',
              year: 'numeric'
            }

          )
          .format(
            fecha
          );


          meses.set(

            clave,

            {

              clave,

              nombre:

              nombre.charAt(
                0
              )
              .toUpperCase()
              +

              nombre.slice(
                1
              )

            }

          );

        }

      }

    );


    /*
     * Convertimos el Map
     * en array.
     *
     * Ordenamos los meses
     * del más reciente
     * al más antiguo.
     */

    this.mesesDisponibles =

    Array
    .from(
      meses.values()
    )
    .sort(

      (
        a,
        b
      ) => {


        return (
          b.clave.localeCompare(
            a.clave
          )
        );

      }

    );

  }


  /*
   * =====================
   * CAMBIAR MES
   * =====================
   */

  cambiarMes(
    event: Event
  ): void {


    const select =
    event.target as HTMLSelectElement;


    this.mesSeleccionado =
    select.value;


    /*
     * Aplicamos el nuevo filtro.
     */

    this.aplicarFiltroMes();


    /*
     * Esperamos a que Angular
     * actualice la vista.
     */

    setTimeout(
      () => {


        if (
          this.gastosFiltrados.length > 0
        ) {


          this.crearGrafico();

        }


        else {


          this.destruirGrafico();

        }


      },
      50
    );

  }


  /*
   * =====================
   * APLICAR FILTRO
   * =====================
   */

  aplicarFiltroMes(): void {


    /*
     * TODOS LOS MESES
     */

    if (
      this.mesSeleccionado ===
      'todos'
    ) {


      this.gastosFiltrados =
      [
        ...this.gastos
      ];

    }


    /*
     * MES CONCRETO
     */

    else {


      this.gastosFiltrados =

      this.gastos.filter(

        (
          gasto
        ) => {


          /*
           * Obtenemos la fecha
           * del gasto.
           */

          const fecha =
          this.obtenerFechaGasto(
            gasto
          );


          if (
            !fecha
          ) {


            return false;

          }


          const anio =
          fecha.getFullYear();


          const mes =
          fecha.getMonth();


          const clave =
          `${anio}-${String(
            mes + 1
          ).padStart(
            2,
            '0'
          )}`;


          return (

            clave ===
            this.mesSeleccionado

          );

        }

      );

    }


    /*
     * Recalculamos todas
     * las estadísticas.
     */

    this.calcularEstadisticas();

  }


  /*
   * =====================
   * CALCULAR
   * ESTADÍSTICAS
   * =====================
   */

  calcularEstadisticas(): void {


    this.totalGastado =

    this.gastosFiltrados.reduce(

      (
        total,
        gasto
      ) => {


        return (

          total +

          (

            Number(
              gasto.importe
            )
            ||
            0

          )

        );

      },

      0

    );


    this.agruparGastosPorCategoria();


    this.numeroCategorias =
    this.categorias.length;


    /*
     * Reiniciamos los datos
     * de la categoría mayor.
     */

    this.categoriaMayorGasto =
    '';


    this.importeMayorGasto =
    0;


    if (
      this.categorias.length > 0
    ) {


      const mayor =

      this.categorias.reduce(

        (
          anterior,
          actual
        ) => {


          if (
            actual.total >
            anterior.total
          ) {


            return actual;

          }


          return anterior;

        }

      );


      this.categoriaMayorGasto =
      mayor.nombre;


      this.importeMayorGasto =
      mayor.total;

    }

  }


  /*
   * =====================
   * AGRUPAR POR CATEGORÍA
   * =====================
   */

  agruparGastosPorCategoria(): void {


    const categorias =
    new Map<
      string,
      any
    >();


    this.gastosFiltrados.forEach(

      (
        gasto
      ) => {


        /*
         * Obtenemos la categoría.
         *
         * Si no existe,
         * usamos "Sin categoría".
         */

        const nombre =

        gasto.categoria?.nombre
        ||
        gasto.categoria
        ||
        'Sin categoría';


        if (
          !categorias.has(
            nombre
          )
        ) {


          categorias.set(

            nombre,

            {

              nombre,

              total: 0,

              numeroGastos: 0

            }

          );

        }


        const categoriaActual =

        categorias.get(
          nombre
        );


        categoriaActual.total +=

        Number(
          gasto.importe
        )
        ||
        0;


        categoriaActual.numeroGastos +=
        1;

      }

    );


    /*
     * Convertimos el Map
     * en array.
     *
     * Ordenamos de mayor
     * a menor gasto.
     */

    this.categorias =

    Array
    .from(
      categorias.values()
    )
    .sort(

      (
        a,
        b
      ) => {


        return (
          b.total -
          a.total
        );

      }

    );

  }


  /*
   * =====================
   * CREAR GRÁFICO
   * =====================
   */

  crearGrafico(): void {


    /*
     * Destruimos el gráfico
     * anterior si existe.
     */

    this.destruirGrafico();


    /*
     * Comprobamos que el
     * canvas exista.
     */

    if (
      !this.graficoCategorias
    ) {


      /*
       * Si Angular todavía no
       * ha creado el canvas,
       * esperamos un poco más.
       */

      setTimeout(
        () => {


          if (
            this.gastosFiltrados.length > 0
          ) {


            this.crearGrafico();

          }


        },
        50
      );


      return;

    }


    const etiquetas =

    this.categorias.map(

      (
        categoria
      ) =>

      categoria.nombre

    );


    const datos =

    this.categorias.map(

      (
        categoria
      ) =>

      categoria.total

    );


    const configuracion:
    ChartConfiguration<'doughnut'> = {

      type:
      'doughnut',


      data: {


        labels:
        etiquetas,


        datasets: [

          {

            data:
            datos,


            backgroundColor: [

              '#2f9e94',

              '#4dabf7',

              '#ffd43b',

              '#ff922b',

              '#f06595',

              '#9775fa',

              '#69db7c',

              '#74c0fc',

              '#e599f7',

              '#ffa94d'

            ],


            borderColor:
            '#ffffff',


            borderWidth:
            3

          }

        ]

      },


      options: {


        responsive:
        true,


        maintainAspectRatio:
        false,


        plugins: {


          legend: {


            position:
            'bottom',


            labels: {


              padding:
              18,


              usePointStyle:
              true,


              pointStyle:
              'circle',


              font: {


                size:
                13

              }

            }

          },


          tooltip: {


            callbacks: {


              label: (

                context
              ) => {


                const valor =

                Number(
                  context.parsed
                )
                ||
                0;


                const porcentaje =

                this.totalGastado > 0

                ?

                (

                  valor /
                  this.totalGastado

                )
                *
                100

                :

                0;


                return (

                  `${context.label}: ` +

                  `${valor.toFixed(
                    2
                  )} € ` +

                  `(${porcentaje.toFixed(
                    1
                  )}%)`

                );

              }

            }

          }

        }

      }

    };


    this.grafico =

    new Chart(

      this.graficoCategorias
      .nativeElement,

      configuracion

    );

  }


  /*
   * =====================
   * DESTRUIR GRÁFICO
   * =====================
   */

  destruirGrafico(): void {


    if (
      this.grafico
    ) {


      this.grafico.destroy();


      this.grafico =
      null;

    }

  }


  /*
   * =====================
   * OBTENER PORCENTAJE
   * =====================
   */

  obtenerPorcentaje(
    totalCategoria: number
  ): number {


    if (
      this.totalGastado <= 0
    ) {


      return 0;

    }


    return (

      totalCategoria /
      this.totalGastado

    )
    *
    100;

  }


  /*
   * =====================
   * TEXTO DEL PERIODO
   * =====================
   */

  obtenerPeriodoActual(): string {


    if (
      this.mesSeleccionado ===
      'todos'
    ) {


      return 'Todos los meses';

    }


    const mes =

    this.mesesDisponibles.find(

      (
        item
      ) =>

      item.clave ===
      this.mesSeleccionado

    );


    return (

      mes?.nombre
      ||
      'Mes seleccionado'

    );

  }


  /*
   * =====================
   * VOLVER
   * =====================
   */

  volver(): void {


    this.location.back();

  }


  /*
   * =====================
   * DESTRUIR COMPONENTE
   * =====================
   */

  ngOnDestroy(): void {


    this.destruirGrafico();

  }


}