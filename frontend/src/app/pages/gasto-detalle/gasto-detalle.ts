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
   * =====================
   *
   * ID DEL GRUPO
   *
   * =====================
   */
  grupoId: number = 0;


  /*
   * =====================
   *
   * ID DEL GASTO
   *
   * =====================
   */
  gastoId: number = 0;


  /*
   * =====================
   *
   * DATOS DEL GASTO
   *
   * =====================
   */
  gasto: any = null;


  /*
   * =====================
   *
   * CARGANDO
   *
   * =====================
   */
  cargando: boolean = true;


  /*
   * =====================
   *
   * ELIMINANDO
   *
   * =====================
   */
  eliminando: boolean = false;


  /*
   * =====================
   *
   * ERROR
   *
   * =====================
   */
  error: string = '';


  /*
   * =====================
   *
   * TENDENCIA
   *
   * =====================
   *
   * Últimos tres meses
   * de gastos de la misma
   * categoría.
   */
  tendencia: any[] = [];


  /*
   * Indica si estamos
   * cargando la tendencia.
   */
  cargandoTendencia: boolean = false;


  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private gastosService: Gastos

  ) {}


  /*
   * =====================
   *
   * INICIALIZACIÓN
   *
   * =====================
   */
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
         * Terminamos la carga.
         */
        this.cargando =
        false;


        /*
         * Cargamos la tendencia
         * de los últimos 3 meses.
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
   *
   * Calculamos los gastos
   * de la misma categoría
   * durante los últimos
   * tres meses.
   */
  cargarTendencia(): void {


    /*
     * Si todavía no tenemos
     * el gasto, no hacemos nada.
     */
    if (!this.gasto) {

      return;

    }


    this.cargandoTendencia =
    true;


    /*
     * Obtenemos todos los
     * gastos del grupo.
     */
    this.gastosService
    .obtenerGastosPorGrupo(
      this.grupoId
    )
    .subscribe({

      next: (gastos: any[]) => {


        /*
         * Calculamos los datos
         * de los últimos 3 meses.
         */
        this.calcularTendencia(
          gastos
        );


        this.cargandoTendencia =
        false;

      },


      error: (error: any) => {


        console.error(
          'Error cargando tendencia:',
          error
        );


        /*
         * No mostramos error general.
         * Simplemente dejamos la
         * tendencia vacía.
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
  calcularTendencia(
    gastos: any[]
  ): void {


    if (!this.gasto) {

      this.tendencia =
      [];


      return;

    }


    /*
     * Fecha del gasto actual.
     */
    const fechaGasto =
    new Date(
      this.gasto.fechaHora
    );


    /*
     * Creamos los últimos
     * tres meses.
     */
    const meses: any[] =
    [];


    /*
     * Meses empezando por
     * el más antiguo.
     */
    for (

      let i = 2;

      i >= 0;

      i--

    ) {


      const fecha =
      new Date(
        fechaGasto.getFullYear(),
        fechaGasto.getMonth() - i,
        1
      );


      meses.push({

        mes:
        fecha.getMonth(),


        anio:
        fecha.getFullYear(),


        nombre:
        this.obtenerNombreMes(
          fecha.getMonth()
        ),


        total:
        0,


        porcentaje:
        0

      });

    }


    /*
     * Recorremos todos
     * los gastos.
     */
    for (
      const gasto of gastos
    ) {


      /*
       * Solo queremos gastos
       * de la misma categoría.
       */
      if (

        gasto.categoria
        !==
        this.gasto.categoria

      ) {

        continue;

      }


      /*
       * Fecha del gasto.
       */
      const fecha =
      new Date(
        gasto.fechaHora
      );


      /*
       * Buscamos el mes
       * correspondiente.
       */
      const mes =
      meses.find(

        (item: any) =>

          item.mes
          ===
          fecha.getMonth()

          &&

          item.anio
          ===
          fecha.getFullYear()

      );


      /*
       * Si pertenece a uno
       * de los tres meses,
       * sumamos el importe.
       */
      if (mes) {


        mes.total +=
        Number(
          gasto.importe
          || 0
        );

      }

    }


    /*
     * Buscamos el importe
     * máximo.
     */
    const maximo =
    Math.max(

      ...meses.map(
        (mes: any) =>
        mes.total
      ),

      0

    );


    /*
     * Calculamos el porcentaje
     * para la barra gráfica.
     */
    for (
      const mes of meses
    ) {


      if (maximo > 0) {


        mes.porcentaje =
        (
          mes.total
          /
          maximo
        )
        *
        100;


      } else {


        mes.porcentaje =
        0;

      }

    }


    /*
     * Guardamos el resultado.
     */
    this.tendencia =
    meses;

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

      'Enero',

      'Febrero',

      'Marzo',

      'Abril',

      'Mayo',

      'Junio',

      'Julio',

      'Agosto',

      'Septiembre',

      'Octubre',

      'Noviembre',

      'Diciembre'

    ];


    return meses[mes];

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
      '¿Seguro que quieres eliminar el gasto?'
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
   * VOLVER AL GRUPO
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

        return categoria
        || 'Sin categoría';

    }

  }


  /*
   * =====================
   *
   * NOMBRE TIPO DIVISIÓN
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


  /*
   * =====================
   *
   * BALANCE DEL PARTICIPANTE
   *
   * =====================
   *
   * Para mostrar el balance
   * del detalle utilizamos
   * DIRECTAMENTE el importe
   * que ya tiene asignado
   * cada participante.
   *
   * NO recalculamos nada.
   *
   * Ejemplo:
   *
   * Gasto: 40,95 €
   *
   * Javi:
   * reparto = 20,48 €
   *
   * Miriam:
   * reparto = 20,47 €
   */
  obtenerBalance(
    reparto: any
  ): number {


    return Number(
      reparto.importe
      || 0
    );

  }


  /*
   * =====================
   *
   * TEXTO DEL BALANCE
   *
   * =====================
   *
   * Si el usuario es quien
   * ha pagado el gasto:
   *
   * Prestaste.
   *
   * Si no es el pagador:
   *
   * Pediste.
   */
  obtenerTextoBalance(
    reparto: any
  ): string {


    if (!this.gasto) {

      return '';

    }


    /*
     * El pagador adelantó
     * el dinero.
     */
    if (

      reparto.usuarioId
      ===
      this.gasto.pagadorId

    ) {

      return 'Prestaste';

    }


    /*
     * El resto de participantes
     * deben su parte.
     */
    return 'Pediste';

  }


  /*
   * =====================
   *
   * CLASE DEL BALANCE
   *
   * =====================
   */
  obtenerClaseBalance(
    reparto: any
  ): string {


    if (!this.gasto) {

      return 'balance-saldado';

    }


    /*
     * Pagador.
     */
    if (

      reparto.usuarioId
      ===
      this.gasto.pagadorId

    ) {

      return 'balance-favor';

    }


    /*
     * Resto de participantes.
     */
    return 'balance-debe';

  }


}