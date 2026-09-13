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


interface PersonaEstadistica {

  nombre: string;

  total: number;

  numeroGastos: number;

}


@Component({
  selector: 'app-estadisticas-personas',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './estadisticas-personas.html',

  styleUrl: './estadisticas-personas.scss'
})
export class EstadisticasPersonas
implements
AfterViewInit,
OnDestroy {


  /*
   * =====================
   * REFERENCIA AL CANVAS
   * =====================
   */

  @ViewChild(
    'graficoPersonas'
  )
  graficoPersonas?:
  ElementRef<HTMLCanvasElement>;


  /*
   * =====================
   * DATOS
   * =====================
   */

  grupoId!: number;


  gastos: any[] = [];


  personas:
  PersonaEstadistica[] = [];


  totalGastado = 0;


  personaMayorGasto = '';


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
         * a actualizar el HTML
         * antes de crear el gráfico.
         */

        this.changeDetector
        .detectChanges();


        setTimeout(
          () => {


            if (
              this.personas.length > 0
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
          'Error cargando gastos por persona:',
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


    /*
     * Calculamos
     * el total gastado.
     */

    this.totalGastado =
    this.gastos.reduce(

      (
        total,
        gasto
      ) => {


        return (

          total +

          (
            Number(
              gasto.importe
            ) || 0
          )

        );

      },

      0

    );


    /*
     * Agrupamos
     * los gastos por persona.
     */

    this.agruparGastosPorPersona();


    /*
     * Si no hay personas.
     */

    if (
      this.personas.length === 0
    ) {


      this.personaMayorGasto =
      'Sin datos';


      this.importeMayorGasto =
      0;


      return;

    }


    /*
     * Buscamos la persona
     * que más dinero ha pagado.
     */

    const mayor =
    this.personas.reduce(

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


    this.personaMayorGasto =
    mayor.nombre;


    this.importeMayorGasto =
    mayor.total;

  }


  /*
   * =====================
   * OBTENER NOMBRE
   * =====================
   */

  obtenerNombrePersona(
    gasto: any
  ): string {


    /*
     * Según Gasto.java,
     * cada gasto tiene:
     *
     * public Usuario pagador;
     */

    if (
      !gasto.pagador
    ) {


      return 'Sin identificar';

    }


    /*
     * Según Usuario.java,
     * el usuario tiene:
     *
     * public String nombre;
     */

    if (
      gasto.pagador.nombre
    ) {


      return gasto.pagador.nombre;

    }


    /*
     * Como alternativa,
     * usamos el email.
     */

    if (
      gasto.pagador.email
    ) {


      return gasto.pagador.email;

    }


    return 'Sin identificar';

  }


  /*
   * =====================
   * AGRUPAR POR PERSONA
   * =====================
   */

  agruparGastosPorPersona(): void {


    const mapaPersonas =
    new Map<
      string,
      PersonaEstadistica
    >();


    this.gastos.forEach(

      (
        gasto
      ) => {


        const nombre =
        this.obtenerNombrePersona(
          gasto
        );


        /*
         * Si la persona todavía
         * no existe, la creamos.
         */

        if (
          !mapaPersonas.has(
            nombre
          )
        ) {


          mapaPersonas.set(

            nombre,

            {

              nombre,

              total:
              0,

              numeroGastos:
              0

            }

          );

        }


        const persona =
        mapaPersonas.get(
          nombre
        );


        if (
          persona
        ) {


          /*
           * Sumamos el importe.
           */

          persona.total +=

          Number(
            gasto.importe
          ) || 0;


          /*
           * Sumamos un gasto.
           */

          persona.numeroGastos +=
          1;

        }


      }

    );


    /*
     * Convertimos el Map
     * en array.
     *
     * Ordenamos de mayor
     * a menor gasto.
     */

    this.personas =

    Array
    .from(
      mapaPersonas.values()
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
     * Comprobamos que
     * exista el canvas.
     */

    if (
      !this.graficoPersonas
    ) {


      console.error(
        'No se ha encontrado el canvas del gráfico.'
      );


      return;

    }


    /*
     * Si ya existe un gráfico,
     * lo destruimos.
     */

    if (
      this.grafico
    ) {


      this.grafico.destroy();


      this.grafico =
      null;

    }


    /*
     * Nombres de las personas.
     */

    const etiquetas =
    this.personas.map(

      (
        persona
      ) => {


        return persona.nombre;

      }

    );


    /*
     * Totales pagados.
     */

    const datos =
    this.personas.map(

      (
        persona
      ) => {


        return persona.total;

      }

    );


    /*
     * Configuración
     * del gráfico.
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
            'Pagado (€)',


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


                /*
                 * TypeScript considera
                 * que el valor puede
                 * ser null.
                 */

                if (
                  valor === null ||
                  valor === undefined
                ) {


                  return '0,00 €';

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

              }

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
     * Creamos
     * el gráfico.
     */

    this.grafico =

    new Chart(

      this.graficoPersonas
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