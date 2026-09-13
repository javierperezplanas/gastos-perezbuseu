import {
  AfterViewInit,
  ChangeDetectorRef,
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


interface MesEstadistica {

  clave: string;

  nombre: string;

  total: number;

  numeroGastos: number;

}


@Component({
  selector: 'app-estadisticas-mensual',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './estadisticas-mensual.html',

  styleUrl: './estadisticas-mensual.scss'
})
export class EstadisticasMensual
implements
AfterViewInit,
OnDestroy {


  /*
   * =====================
   * REFERENCIA AL CANVAS
   * =====================
   */

  @ViewChild(
    'graficoMensual'
  )
  graficoMensual?:
  ElementRef<HTMLCanvasElement>;


  /*
   * =====================
   * DATOS
   * =====================
   */

  grupoId!: number;


  gastos: any[] = [];


  meses:
  MesEstadistica[] = [];


  totalGastado = 0;


  numeroMeses = 0;


  mesMayorGasto = '';


  importeMayorGasto = 0;


  cargando = true;


  error = '';


  grafico:
  Chart<'bar'> | null = null;


  constructor(

    private route:
    ActivatedRoute,

    private location:
    Location,

    private gastosService:
    Gastos,

    private changeDetector:
    ChangeDetectorRef

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


        this.calcularEstadisticas();


        this.cargando =
        false;


        /*
         * Forzamos a Angular
         * a actualizar el HTML.
         */

        this.changeDetector
        .detectChanges();


        /*
         * Esperamos a que
         * aparezca el canvas.
         */

        setTimeout(
          () => {


            if (
              this.meses.length > 0
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
          'Error cargando gastos mensuales:',
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
   * CALCULAR ESTADÍSTICAS
   * =====================
   */

  calcularEstadisticas(): void {


    this.totalGastado =
    this.gastos.reduce(

      (
        total,
        gasto
      ) => {


        const importe =
        Number(
          gasto.importe
        ) || 0;


        return (
          total +
          importe
        );

      },

      0

    );


    this.agruparGastosPorMes();


    this.numeroMeses =
    this.meses.length;


    if (
      this.meses.length === 0
    ) {


      this.mesMayorGasto =
      'Sin datos';


      this.importeMayorGasto =
      0;


      return;

    }


    const mayor =
    this.meses.reduce(

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


    this.mesMayorGasto =
    mayor.nombre;


    this.importeMayorGasto =
    mayor.total;

  }


  /*
   * =====================
   * OBTENER FECHA
   * =====================
   */

  obtenerFechaGasto(
    gasto: any
  ): Date | null {


    /*
     * El backend utiliza
     * fechaHora.
     *
     * Mantenemos fecha como
     * alternativa por compatibilidad.
     */

    const valorFecha =

      gasto.fechaHora ||

      gasto.fecha ||

      null;


    if (
      !valorFecha
    ) {


      return null;

    }


    /*
     * Si ya es una fecha.
     */

    if (
      valorFecha instanceof Date
    ) {


      if (
        isNaN(
          valorFecha.getTime()
        )
      ) {


        return null;

      }


      return valorFecha;

    }


    /*
     * Convertimos la fecha.
     */

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
   * AGRUPAR POR MES
   * =====================
   */

  agruparGastosPorMes(): void {


    const mapaMeses =
    new Map<
      string,
      MesEstadistica
    >();


    this.gastos.forEach(

      (
        gasto
      ) => {


        /*
         * Obtenemos la fecha.
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


        const numeroMes =
        fecha.getMonth();


        /*
         * Clave para ordenar.
         *
         * Ejemplo:
         * 2026-09
         */

        const clave =
        `${anio}-${String(
          numeroMes + 1
        ).padStart(
          2,
          '0'
        )}`;


        /*
         * Creamos el mes
         * si todavía no existe.
         */

        if (
          !mapaMeses.has(
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


          mapaMeses.set(

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
                ),


              total:
              0,


              numeroGastos:
              0


            }

          );

        }


        const mes =
        mapaMeses.get(
          clave
        );


        if (
          mes
        ) {


          mes.total +=

          Number(
            gasto.importe
          ) || 0;


          mes.numeroGastos +=
          1;

        }


      }

    );


    /*
     * Convertimos el Map
     * en un array.
     */

    this.meses =

    Array
    .from(
      mapaMeses.values()
    )
    .sort(

      (
        a,
        b
      ) => {


        return (
          a.clave.localeCompare(
            b.clave
          )
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
     * Comprobamos que existe
     * el canvas.
     */

    if (
      !this.graficoMensual
    ) {


      console.error(
        'No se ha encontrado el canvas del gráfico.'
      );


      return;

    }


    /*
     * Si existe un gráfico
     * anterior lo eliminamos.
     */

    if (
      this.grafico
    ) {


      this.grafico.destroy();


      this.grafico =
      null;

    }


    /*
     * ETIQUETAS
     */

    const etiquetas =
    this.meses.map(

      (
        mes
      ) => {


        return mes.nombre;

      }

    );


    /*
     * DATOS
     */

    const datos =
    this.meses.map(

      (
        mes
      ) => {


        return mes.total;

      }

    );


    /*
     * CONFIGURACIÓN
     */

    const configuracion:
    ChartConfiguration<'bar'> = {


      type:
      'bar',


      data: {


        labels:
        etiquetas,


        datasets: [

          {


            label:
            'Gasto (€)',


            data:
            datos,


            backgroundColor:
            'rgba(47, 158, 148, 0.75)',


            borderColor:
            '#2f9e94',


            borderWidth:
            1,


            borderRadius:
            8,


            borderSkipped:
            false


          }

        ]

      },


      options: {


        responsive:
        true,


        maintainAspectRatio:
        false,


        animation: {


          duration:
          500


        },


        plugins: {


          legend: {


            display:
            false

          },


          tooltip: {


            backgroundColor:
            '#263238',


            padding:
            12,


            callbacks: {


              label: (

                context
              ) => {


                const valor =
                context.parsed.y;


                if (
                  valor === null ||
                  valor === undefined
                ) {


                  return (
                    '0,00 €'
                  );

                }


                return (
                  `${valor.toFixed(
                    2
                  )} €`
                );

              }

            }

          }

        },


        scales: {


          x: {


            grid: {


              display:
              false

            },


            border: {


              display:
              false

            },


            ticks: {


              color:
              '#718096',


              font: {


                size:
                12

              },


              maxRotation:
              45,


              minRotation:
              0

            }

          },


          y: {


            beginAtZero:
            true,


            grid: {


              color:
              '#edf0f1'

            },


            border: {


              display:
              false

            },


            ticks: {


              color:
              '#718096',


              font: {


                size:
                12

              },


              callback: (

                value
              ) => {


                return (
                  `${value} €`
                );

              }

            }

          }

        }

      }

    };


    /*
     * CREAR GRÁFICO
     */

    this.grafico =

    new Chart(

      this.graficoMensual
      .nativeElement,

      configuracion

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


    if (
      this.grafico
    ) {


      this.grafico.destroy();


      this.grafico =
      null;

    }

  }


}