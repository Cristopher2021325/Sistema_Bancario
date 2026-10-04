import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="barra">
      <span class="marca">Banco Kinal</span>
      <nav>
        <a routerLink="/clientes" routerLinkActive="activo">Clientes</a>
        <a routerLink="/cuentas" routerLinkActive="activo">Cuentas</a>
        <a routerLink="/operaciones" routerLinkActive="activo">Operaciones</a>
        <a routerLink="/movimientos" routerLinkActive="activo">Movimientos</a>
        <a routerLink="/reportes" routerLinkActive="activo">Reportes</a>
      </nav>
      <span class="usuario">{{ auth.usuario?.nombre }} ({{ auth.usuario?.rol }})</span>
      <button class="btn claro" (click)="auth.logout()">Cerrar sesión</button>
    </header>
    <main class="contenido"><router-outlet /></main>`,
})
export class Shell {
  auth = inject(AuthService);
}
