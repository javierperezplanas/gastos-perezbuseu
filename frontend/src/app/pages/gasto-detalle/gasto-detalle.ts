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
   * ID del grupo.
   */
  grupoId: number = 0;


  /*
   * ID del gasto.
   */
  gastoId: number = 0;


  /*
   * Datos del gasto.
   */
  gasto: any = null;


  /*
   * Indica si estamos
   * cargando los datos.
   */
  cargando: boolean = true;


  /*
   * Indica si estamos
   * eliminando el gasto.
   */
  eliminando: boolean = false;


  /*
   * Mensaje de error.
   */
  error: string = '';


  constructor(

    private route: ActivatedRoute,

    private router: Router,

    private gastosService: Gastos

  ) {}


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


    this.cargarGasto();

  }


  /*
   * Cargar los datos
   * del gasto.
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


        this.gasto =
        gasto;


        this.cargando =
        false;

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
   * Editar el gasto.
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
   * Eliminar el gasto.
   */
  eliminarGasto(): void {


    const confirmar =
    confirm(
      '¿Seguro que quieres eliminar este gasto?'
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
   * Volver al grupo.
   */
  volver(): void {


    this.router.navigate([
      '/grupos',
      this.grupoId
    ]);

  }


  /*
   * Obtener el icono
   * de la categoría.
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
   * Formatear el nombre
   * de la categoría.
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

        return categoria || 'Sin categoría';

    }

  }


  /*
   * Obtener el nombre de
   * la forma de reparto.
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


}