import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Grupos as GruposService } from '../../services/grupos';

@Component({
  selector: 'app-grupos',
  imports: [],
  templateUrl: './grupos.html',
  styleUrl: './grupos.scss',
})
export class Grupos implements OnInit {

  grupos: any[] = [];

  constructor(
    private gruposService: GruposService,
      private router: Router
  ) {}

  ngOnInit(): void {

    this.gruposService
    .obtenerGrupos()
    .subscribe({

      next: (respuesta) => {

        console.log(
          'Grupos recibidos:',
          respuesta
        );

        this.grupos = respuesta;

      },

      error: (error) => {

        console.error(
          'Error obteniendo grupos:',
          error
        );

      }

    });

  }


  abrirGrupo(id: number): void {

    this.router.navigate([
      '/grupos',
      id
    ]);

  }

}
