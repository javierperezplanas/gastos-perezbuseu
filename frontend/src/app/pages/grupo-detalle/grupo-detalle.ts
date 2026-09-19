

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
  FormsModule
} from '@angular/forms';
import { marked } from 'marked';

import {
  forkJoin,
  of
} from 'rxjs';

import {
  catchError
} from 'rxjs/operators';

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
    FormsModule,
    RouterLink
  ],

  templateUrl: './grupo-detalle.html',

  styleUrl: './grupo-detalle.scss'
})
export class GrupoDetalle
implements OnInit {


  /*
   * ID del grupo.
   */
  grupoId: number = 0;


  /*
   * Información del grupo.
   */
  grupo: any = null;


  /*
   * Lista de gastos.
   *
   * Cada gasto se carga después
   * individualmente para obtener
   * también los repartos.
   */
  gastos: any[] = [];


  /*
   * Gastos agrupados por mes.
   */
  gastosPorMes: any[] = [];


  /*
   * Miembros del grupo.
   */
  miembros: any[] = [];


  /*
   * Total gastado.
   */
  totalGastado: number = 0;


  /*
   * Saldo del usuario
   * actualmente conectado.
   */
  saldoUsuario: number = 0;


  /*
   * Usuario conectado.
   */
  usuarioActual: any = null;


  /*
   * Estado de carga.
   */
  cargando: boolean = true;


  /*
   * Texto utilizado para buscar
   * gastos por descripción.
   */
  textoBusqueda: string = '';


  /*
   * Total de los gastos encontrados
   * en la búsqueda.
   */
  totalBusqueda: number = 0;


  /*
   * Análisis mediante inteligencia artificial.
   */
  analisisIA: string = '';
  analisisIAHtml: string = '';

  cargandoAnalisisIA: boolean = false;

  errorAnalisisIA: string = '';



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


    /*
     * Obtenemos el usuario
     * actualmente conectado.
     */
    this.usuarioActual =
    this.authService.obtenerUsuario();


    console.log(
      'Usuario actual:',
      this.usuarioActual
    );


    this.cargarGrupo();


    this.cargarGastos();


    this.cargarMiembros();


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

      next: (
        grupo: any
      ) => {


        console.log(
          'Grupo recibido:',
          grupo
        );


        this.grupo =
        grupo;

      },


      error: (
        error: any
      ) => {


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
   *
   * Primero obtenemos la lista
   * de gastos.
   *
   * Después obtenemos el detalle
   * completo de cada gasto para
   * disponer de gasto.repartos.
   */
  cargarGastos(): void {


    this.cargando =
    true;


    this.gastosService
    .obtenerGastosPorGrupo(
      this.grupoId
    )
    .subscribe({

      next: (
        respuesta: any[]
      ) => {


        console.log(
          'Lista inicial de gastos:',
          respuesta
        );


        /*
         * Si no hay gastos,
         * terminamos aquí.
         */
        if (

          !respuesta

          ||

          respuesta.length === 0

        ) {


          this.gastos =
          [];


          this.gastosPorMes =
          [];


          this.calcularTotal();


          this.cargando =
          false;


          return;

        }


        /*
         * Para cada gasto obtenemos
         * su detalle completo.
         *
         * El detalle contiene
         * gasto.repartos.
         */
        const peticiones =
        respuesta.map(

          (gasto: any) =>

            this.gastosService
            .obtenerGasto(
              gasto.id
            )
            .pipe(

              /*
               * Si falla un gasto,
               * mantenemos los datos
               * originales para no
               * romper toda la lista.
               */
              catchError(

                (
                  error: any
                ) => {


                  console.error(
                    'Error obteniendo detalle del gasto:',
                    gasto.id,
                    error
                  );


                  return of(
                    gasto
                  );

                }

              )

            )

        );


        /*
         * Ejecutamos todas las
         * peticiones.
         */
        forkJoin(
          peticiones
        )
        .subscribe({

          next: (
            gastosCompletos: any[]
          ) => {


            console.log(
              'Gastos completos con repartos:',
              gastosCompletos
            );


            this.gastos =
            gastosCompletos;


            /*
             * Ordenamos y agrupamos
             * los gastos por mes.
             */
            this.agruparGastosPorMes();


            /*
             * Calculamos el total.
             */
            this.calcularTotal();


            this.cargando =
            false;

          },


          error: (
            error: any
          ) => {


            console.error(
              'Error obteniendo los detalles de los gastos:',
              error
            );


            this.gastos =
            respuesta;


            this.agruparGastosPorMes();


            this.calcularTotal();


            this.cargando =
            false;

          }

        });

      },


      error: (
        error: any
      ) => {


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

      next: (
        miembros: any[]
      ) => {


        console.log(
          'Miembros recibidos:',
          miembros
        );


        this.miembros =
        miembros;

      },


      error: (
        error: any
      ) => {


        console.error(
          'Error obteniendo miembros:',
          error
        );

      }

    });

  }


  /*
   * Cargar el saldo
   * del usuario conectado.
   */
  cargarSaldoUsuario(): void {


    const usuario =
    this.usuarioActual;


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


        const balanceUsuario =
        balances.find(

          (balance: any) =>

            Number(
              balance.usuarioId
            )

            ===

            Number(
              usuario.id
            )

            ||

            Number(
              balance.idUsuario
            )

            ===

            Number(
              usuario.id
            )

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
   * Agrupar gastos
   * por mes.
   */
  /*
   * Buscar gastos por descripción.
   *
   * La búsqueda se realiza en tiempo real,
   * ignorando mayúsculas, minúsculas y
   * acentos.
   */
  buscarGastos(): void {

    const texto =
      this.normalizarTexto(
        this.textoBusqueda
      );


    if (!texto) {

      this.totalBusqueda = 0;

      this.agruparGastosPorMes();

      return;

    }


    const gastosFiltrados =
      this.gastos.filter(

        (gasto: any) =>

          this.normalizarTexto(
            gasto.descripcion
          ).includes(
            texto
          )

      );


    this.totalBusqueda =
      gastosFiltrados.reduce(
        (
          total: number,
          gasto: any
        ) =>
          total +
          Number(
            gasto.importe || 0
          ),
        0
      );

    this.totalBusqueda =
      Math.round(
        this.totalBusqueda * 100
      ) / 100;


    this.agruparGastosPorMes(
      gastosFiltrados
    );

  }


  /*
   * Analizar los gastos mediante
   * inteligencia artificial.
   */
  analizarGastosIA(): void {

    this.cargandoAnalisisIA = true;
    this.errorAnalisisIA = '';
    this.analisisIA = '';
    this.analisisIAHtml = '';


    this.gastosService
      .analizarGastosIA(this.grupoId)
      .subscribe({

        next: (
          respuesta: { analisis: string }
        ) => {

          this.analisisIA =
  respuesta.analisis;

this.analisisIAHtml =
  marked.parse(
    respuesta.analisis
  ) as string;
          this.cargandoAnalisisIA = false;

        },

        error: (
          error: any
        ) => {

          console.error(
            'Error realizando análisis IA:',
            error
          );

          this.errorAnalisisIA =
            'No se ha podido realizar el análisis.';

          this.cargandoAnalisisIA = false;

        }

      });

  }


  /*
   * Normalizar texto para la búsqueda.
   *
   * Elimina acentos y convierte
   * todo a minúsculas.
   */
  normalizarTexto(
    texto: string
  ): string {

    return (
      texto || ''
    )
    .toString()
    .normalize('NFD')
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .trim();

  }


  /*
   * Agrupar gastos
   * por mes.
   *
   * Puede recibir una lista concreta
   * de gastos para permitir la búsqueda.
   */
  agruparGastosPorMes(
    gastosParaAgrupar: any[] = this.gastos
  ): void {


    /*
     * Ordenamos primero los gastos
     * del más reciente al más antiguo.
     */
    const gastosOrdenados =
      gastosParaAgrupar
      .slice()
      .sort(

        (
          a: any,
          b: any
        ) => {


          const fechaA =
            new Date(
              a.fechaHora
            ).getTime();


          const fechaB =
            new Date(
              b.fechaHora
            ).getTime();


          const diferenciaFecha =
            fechaB
            -
            fechaA;


          if (
            diferenciaFecha !== 0
          ) {

            return diferenciaFecha;

          }


          return (

            Number(
              b.id
            )

            -

            Number(
              a.id
            )

          );

        }

      );


    const grupos =
      new Map<
        string,
        any[]
      >();


    for (
      const gasto
      of gastosOrdenados
    ) {


      const fecha =
        new Date(
          gasto.fechaHora
        );


      const clave =

        fecha.getFullYear()

        +

        '-'

        +

        String(
          fecha.getMonth() + 1
        ).padStart(
          2,
          '0'
        );


      if (

        !grupos.has(
          clave
        )

      ) {


        grupos.set(
          clave,
          []
        );

      }


      grupos.get(
        clave
      )?.push(
        gasto
      );

    }


    this.gastosPorMes =
      [];


    grupos.forEach(

      (
        gastos: any[],
        clave: string
      ) => {


        const partes =
          clave.split(
            '-'
          );


        const anio =
          Number(
            partes[0]
          );


        const mes =
          Number(
            partes[1]
          )
          -
          1;


        const fecha =
          new Date(
            anio,
            mes,
            1
          );


        const nombre =
          fecha.toLocaleDateString(

            'es-ES',

            {

              month: 'long',

              year: 'numeric'

            }

          );


        this.gastosPorMes.push({

          nombre:

            nombre.charAt(0)
            .toUpperCase()

            +

            nombre.slice(1),


          gastos:
            gastos

        });

      }

    );

  }

  /*
   * Calcular el total
   * gastado.
   */
  calcularTotal(): void {


    this.totalGastado =
    0;


    for (
      const gasto
      of this.gastos
    ) {


      this.totalGastado +=
      Number(
        gasto.importe
      );

    }

  }


  /*
   * Comprobar si el gasto
   * ha sido pagado por el
   * usuario actual.
   *
   * IMPORTANTE:
   * El backend devuelve
   * pagadorId.
   */
  esPagador(
    gasto: any
  ): boolean {


    if (

      !this.usuarioActual

      ||

      !gasto

    ) {


      return false;

    }


    return (

      Number(
        gasto.pagadorId
      )

      ===

      Number(
        this.usuarioActual.id
      )

    );

  }


  /*
   * Comprobar si debemos
   * mostrar PRESTASTE.
   *
   * Prestaste significa que
   * el usuario actual fue
   * quien pagó el gasto.
   */
  esPrestaste(
    gasto: any
  ): boolean {


    return this.esPagador(
      gasto
    );

  }


  /*
   * Comprobar si debemos
   * mostrar PEDISTE.
   *
   * Pediste significa que
   * otra persona pagó el
   * gasto y al usuario
   * actual le corresponde
   * una parte.
   */
  esPediste(
    gasto: any
  ): boolean {


    if (

      this.esPagador(
        gasto
      )

    ) {


      return false;

    }


    return (

      this.obtenerRepartoUsuarioActual(
        gasto
      )

      >

      0

    );

  }


  /*
   * Obtener el reparto
   * del usuario actual.
   *
   * Usamos directamente el
   * importe calculado por
   * el backend.
   */
  obtenerRepartoUsuarioActual(
    gasto: any
  ): number {


    if (

      !this.usuarioActual

      ||

      !gasto

      ||

      !gasto.repartos

    ) {


      return 0;

    }


    const reparto =
    gasto.repartos.find(

      (reparto: any) =>

        Number(
          reparto.usuarioId
        )

        ===

        Number(
          this.usuarioActual.id
        )

    );


    if (!reparto) {


      return 0;

    }


    return Number(
      reparto.importe
    );

  }


  /*
   * Obtener la cantidad
   * que el usuario actual
   * ha prestado.
   *
   * La cantidad prestada es
   * exactamente la suma de
   * los repartos de las otras
   * personas.
   *
   * De esta forma usamos los
   * importes exactos calculados
   * por el backend y respetamos
   * correctamente los céntimos
   * del redondeo.
   */
  obtenerCantidadPrestaste(
    gasto: any
  ): number {


    if (

      !gasto

      ||

      !this.usuarioActual

      ||

      !gasto.repartos

    ) {


      return 0;

    }


    /*
     * TOTAL_A_PAGADOR.
     *
     * El pagador ha adelantado
     * todo el importe.
     */
    if (

      gasto.tipoDivision
      ===
      'TOTAL_A_PAGADOR'

    ) {


      return Number(
        gasto.importe
      );

    }


    /*
     * Sumamos los repartos
     * de todas las personas
     * excepto el usuario actual.
     */
    let prestado =
    0;


    for (
      const reparto
      of gasto.repartos
    ) {


      if (

        Number(
          reparto.usuarioId
        )

        !==

        Number(
          this.usuarioActual.id
        )

      ) {


        prestado +=
        Number(
          reparto.importe
        );

      }

    }


    /*
     * Evitamos posibles errores
     * de precisión decimal de
     * JavaScript.
     */
    prestado =
    Math.round(
      prestado * 100
    )
    /
    100;


    return prestado;

  }


  /*
   * Obtener la cantidad
   * que el usuario actual
   * ha pedido.
   *
   * Usamos directamente
   * el reparto calculado
   * por el backend.
   */
  obtenerCantidadPediste(
    gasto: any
  ): number {


    return this.obtenerRepartoUsuarioActual(
      gasto
    );

  }


  /*
   * Obtener el día
   * del gasto.
   */
  obtenerDia(
    gasto: any
  ): string {


    if (

      !gasto

      ||

      !gasto.fechaHora

    ) {


      return '';

    }


    const fecha =
    new Date(
      gasto.fechaHora
    );


    return String(
      fecha.getDate()
    );

  }


  /*
   * Obtener el mes corto.
   */
  obtenerMesCorto(
    gasto: any
  ): string {


    if (

      !gasto

      ||

      !gasto.fechaHora

    ) {


      return '';

    }


    const fecha =
    new Date(
      gasto.fechaHora
    );


    const meses = [

      'ene',
      'feb',
      'mar',
      'abr',
      'may',
      'jun',
      'jul',
      'ago',
      'sept',
      'oct',
      'nov',
      'dic'

    ];


    return meses[
      fecha.getMonth()
    ];

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