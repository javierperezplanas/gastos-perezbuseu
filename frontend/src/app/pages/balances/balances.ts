import { Component, OnInit } from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Gastos
} from '../../services/gastos';

import {
  Pagos
} from '../../services/pagos';


@Component({
  selector: 'app-balances',

  imports: [
    CommonModule,
    FormsModule
  ],

  templateUrl: './balances.html',

  styleUrl: './balances.scss',
})

export class Balances implements OnInit {


  grupoId: number = 1;


  balances: any[] = [];


  liquidaciones: any[] = [];


  pagos: any[] = [];


  deudaSeleccionada: any = null;


  importePago: number = 0;


  cargando: boolean = true;


  error: string = '';


  constructor(

    private route: ActivatedRoute,

      private router: Router,

        private gastosService: Gastos,

          private pagosService: Pagos

  ) {}


  ngOnInit(): void {


    const grupoIdParam =
    this.route.snapshot.paramMap.get(
      'id'
    );


    if (grupoIdParam) {

      this.grupoId =
      Number(grupoIdParam);

    }


    this.cargarBalances();

    this.cargarLiquidaciones();

    this.cargarPagos();

  }


  cargarBalances(): void {


    this.cargando = true;

    this.error = '';


    this.gastosService
    .obtenerBalances(this.grupoId)
    .subscribe({

      next: (balances: any[]) => {


        console.log(
          'Balances recibidos:',
          balances
        );


        this.balances =
        balances;


        this.cargando =
        false;

      },


      error: (error: any) => {


        console.error(
          'Error cargando balances:',
          error
        );


        this.error =
        'No se han podido cargar los balances.';


          this.cargando =
          false;

      }

    });

  }


  cargarLiquidaciones(): void {


    this.gastosService
    .obtenerLiquidaciones(this.grupoId)
    .subscribe({

      next: (liquidaciones: any[]) => {


        console.log(
          'Liquidaciones recibidas:',
          liquidaciones
        );


        this.liquidaciones =
        liquidaciones;

      },


      error: (error: any) => {


        console.error(
          'Error cargando liquidaciones:',
          error
        );

      }

    });

  }


  cargarPagos(): void {


    this.pagosService
    .obtenerPagosPorGrupo(
      this.grupoId
    )
    .subscribe({

      next: (pagos: any[]) => {


        console.log(
          'Pagos recibidos:',
          pagos
        );


        this.pagos =
        pagos;

      },


      error: (error: any) => {


        console.error(
          'Error cargando pagos:',
          error
        );

      }

    });

  }


  seleccionarDeuda(
    liquidacion: any
  ): void {


    this.deudaSeleccionada =
    liquidacion;


    /*
     * Por defecto proponemos
     * pagar toda la deuda.
     */
    this.importePago =
    liquidacion.importe;

  }


  cancelarPago(): void {


    this.deudaSeleccionada =
    null;


    this.importePago =
    0;

  }


  registrarPago(): void {


    if (!this.deudaSeleccionada) {

      return;

    }


    if (
      !this.importePago
      ||
      this.importePago <= 0
    ) {

      alert(
        'El importe debe ser mayor que cero.'
      );

      return;

    }


    /*
     * No permitir pagar más
     * de lo que se debe.
     */
    if (
      this.importePago >
      this.deudaSeleccionada.importe
    ) {

      alert(
        'No puedes pagar un importe superior a la deuda pendiente.'
      );

      return;

    }


    const pago = {

      grupoId:
      this.grupoId,


      deudorId:
      this.deudaSeleccionada.deudorId,


      acreedorId:
      this.deudaSeleccionada.acreedorId,


      importe:
      this.importePago

    };


    this.pagosService
    .registrarPago(pago)
    .subscribe({

      next: (response: any) => {


        console.log(
          'Pago registrado:',
          response
        );


        /*
         * Cerramos el formulario.
         */
        this.cancelarPago();


        /*
         * Recargamos toda la información.
         */
        this.recargarDatos();

      },


      error: (error: any) => {


        console.error(
          'Error registrando pago:',
          error
        );


        alert(
          'No se ha podido registrar el pago.'
        );

      }

    });

  }


  /*
   * Eliminar un pago de deuda.
   */
  eliminarPago(
    pago: any
  ): void {


    const confirmar =
    confirm(
      `¿Seguro que quieres eliminar el pago de ${pago.importe} € de ${pago.nombreDeudor} a ${pago.nombreAcreedor}?`
    );


    if (!confirmar) {

      return;

    }


    this.pagosService
    .eliminarPago(
      pago.id
    )
    .subscribe({

      next: () => {


        console.log(
          'Pago eliminado correctamente.'
        );


        /*
         * Recargamos balances,
         * deudas e historial.
         */
        this.recargarDatos();

      },


      error: (error: any) => {


        console.error(
          'Error eliminando pago:',
          error
        );


        alert(
          'No se ha podido eliminar el pago.'
        );

      }

    });

  }


  /*
   * Recargar todos los datos
   * de la página.
   */
  recargarDatos(): void {


    this.cargarBalances();

    this.cargarLiquidaciones();

    this.cargarPagos();

  }


  volver(): void {


    this.router.navigate([
      '/grupos',
      this.grupoId
    ]);

  }

}
