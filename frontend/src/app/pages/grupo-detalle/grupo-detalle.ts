import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { Gastos } from '../../services/gastos';


@Component({
  selector: 'app-grupo-detalle',

  imports: [
    CommonModule,
    RouterLink
  ],

  templateUrl: './grupo-detalle.html',

  styleUrl: './grupo-detalle.scss',
})

export class GrupoDetalle implements OnInit {


  gastos: any[] = [];

  totalGastado: number = 0;


  constructor(
    private gastosService: Gastos,
      private router: Router
  ) {}


  ngOnInit(): void {

    this.cargarGastos();

  }


  cargarGastos(): void {

    this.gastosService
    .obtenerGastosPorGrupo(1)
    .subscribe({

      next: (respuesta) => {

        console.log(
          'Gastos recibidos:',
          respuesta
        );

        this.gastos = respuesta;

        this.calcularTotal();

      },


      error: (error) => {

        console.error(
          'Error obteniendo gastos:',
          error
        );

      }

    });

  }


  calcularTotal(): void {

    this.totalGastado = 0;


    for (const gasto of this.gastos) {

      this.totalGastado +=
      Number(gasto.importe);

    }

  }


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


  editarGasto(
    gastoId: number
  ): void {

    this.router.navigate([
      '/grupos',
      1,
      'editar-gasto',
      gastoId
    ]);

  }


  eliminarGasto(
    gastoId: number
  ): void {


    const confirmar = confirm(
      '¿Seguro que quieres eliminar este gasto?'
    );


    if (!confirmar) {

      return;

    }


    this.gastosService
    .eliminarGasto(gastoId)
    .subscribe({

      next: () => {

        console.log(
          'Gasto eliminado correctamente'
        );


        this.cargarGastos();

      },


      error: (error) => {

        console.error(
          'Error eliminando gasto:',
          error
        );


        alert(
          'No se ha podido eliminar el gasto'
        );

      }

    });

  }

}
