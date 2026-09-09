import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
  RouterOutlet,
  RouterLink,
  NavigationEnd
} from '@angular/router';

import {
  filter
} from 'rxjs';

import {
  Auth
} from './services/auth';


@Component({
  selector: 'app-root',

  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink
  ],

  templateUrl: './app.html',

  styleUrl: './app.scss'
})
export class App
implements OnInit {


  usuario: any = null;


  mostrarMenu: boolean = true;


  constructor(

    private router: Router,

      private authService: Auth

  ) {}


  ngOnInit(): void {


    /*
     * Escuchamos los cambios
     * del usuario conectado.
     */
    this.authService
    .usuario$
    .subscribe(
      (usuario) => {

        this.usuario =
        usuario;

      }
    );


    /*
     * Detectamos cambios
     * de ruta.
     */
    this.router.events
    .pipe(

      filter(
        (evento) =>
        evento instanceof NavigationEnd
      )

    )
    .subscribe(
      (evento) => {

        const navigation =
        evento as NavigationEnd;


        this.mostrarMenu =
        navigation.urlAfterRedirects
        !== '/login';

      }
    );


    /*
     * Comprobamos la ruta
     * inicial.
     */
    this.mostrarMenu =
    this.router.url !== '/login';

  }


  cerrarSesion(): void {


    this.authService
    .cerrarSesion();


    this.router.navigate([
      '/login'
    ]);

  }

}
