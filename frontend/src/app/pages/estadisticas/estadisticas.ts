import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  Gastos
} from '../../services/gastos';


@Component({
  selector: 'app-estadisticas',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl: './estadisticas.html',

  styleUrl: './estadisticas.scss'
})
export class Estadisticas
implements OnInit {


  /*
   * =====================
   * DATOS
   * =====================
   */

  grupoId!: number;


  gastos: any[] = [];


  totalGastado = 0;


  gastoMedio = 0;


  cargando = true;


  error = '';


  constructor(

    private route:
    ActivatedRoute,

    private router:
    Router,

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

  ngOnInit(): void {


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


        this.calcularResumen();


        this.cargando =
        false;

      },


      error: (
        error
      ) => {


        console.error(
          'Error cargando estadísticas:',
          error
        );


        this.error =
        'No se han podido cargar las estadísticas del grupo.';


        this.cargando =
        false;

      }


    });

  }


  /*
   * =====================
   * CALCULAR RESUMEN
   * =====================
   */

  calcularResumen(): void {


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


    if (
      this.gastos.length > 0
    ) {


      this.gastoMedio =
      this.totalGastado /
      this.gastos.length;


    } else {


      this.gastoMedio =
      0;

    }

  }


  /*
   * =====================
   * CATEGORÍAS
   * =====================
   */

  verCategorias(): void {


    this.router.navigate(

      [
        '/grupos',
        this.grupoId,
        'estadisticas',
        'categorias'
      ]

    );

  }


  /*
   * =====================
   * GASTOS POR MES
   * =====================
   */

  verMensual(): void {


    this.router.navigate(

      [
        '/grupos',
        this.grupoId,
        'estadisticas',
        'mensual'
      ]

    );

  }


  /*
   * =====================
   * GASTOS POR PERSONA
   * =====================
   */

  verPersonas(): void {


    this.router.navigate(

      [
        '/grupos',
        this.grupoId,
        'estadisticas',
        'personas'
      ]

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


}