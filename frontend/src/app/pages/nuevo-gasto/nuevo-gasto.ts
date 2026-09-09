import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Gastos } from '../../services/gastos';


@Component({
  selector: 'app-nuevo-gasto',

  imports: [
    FormsModule
  ],

  templateUrl: './nuevo-gasto.html',

  styleUrl: './nuevo-gasto.scss',
})

export class NuevoGasto {

  descripcion: string = '';

  categoria: string = '';

  importe: number | null = null;

  pagador: string = '';

  fecha: string = '';


  constructor(

    private router: Router,

      private gastosService: Gastos

  ) {}


  guardarGasto(): void {

    if (
      !this.descripcion ||
      !this.categoria ||
      !this.importe ||
      !this.pagador ||
      !this.fecha
    ) {

      alert(
        'Por favor, rellena todos los campos.'
      );

      return;

    }


    const gasto = {

      descripcion: this.descripcion,

      importe: this.importe,

      categoria: this.categoria,

      fechaHora: this.fecha + 'T00:00:00',

      notas: '',

      grupoId: 1,

      pagadorId: Number(this.pagador),

      participantesIds: [
        1,
        2
      ]

    };


    console.log(
      'Enviando gasto:',
      gasto
    );


    this.gastosService
    .crearGasto(gasto)
    .subscribe({

      next: (respuesta) => {

        console.log(
          'Gasto creado correctamente:',
          respuesta
        );


        this.router.navigate([
          '/grupos',
          1
        ]);

      },


      error: (error) => {

        console.error(
          'Error creando gasto:',
          error
        );

        alert(
          'Ha ocurrido un error al guardar el gasto.'
        );

      }

    });

  }


  volver(): void {

    this.router.navigate([
      '/grupos',
      1
    ]);

  }

}
