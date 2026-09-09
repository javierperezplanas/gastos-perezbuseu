import { Component, OnInit } from '@angular/core';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { CommonModule } from '@angular/common';

import { Gastos } from '../../services/gastos';


@Component({
  selector: 'app-balances',

  imports: [
    CommonModule
  ],

  templateUrl: './balances.html',

  styleUrl: './balances.scss',
})

export class Balances implements OnInit {


  grupoId: number = 1;


  balances: any[] = [];


  liquidaciones: any[] = [];


  cargando: boolean = true;


  error: string = '';


  constructor(

    private route: ActivatedRoute,

      private router: Router,

        private gastosService: Gastos

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


  volver(): void {


    this.router.navigate([
      '/grupos',
      this.grupoId
    ]);

  }

}
