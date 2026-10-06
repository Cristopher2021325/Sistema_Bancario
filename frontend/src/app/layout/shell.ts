import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app">
      <aside class="lateral">
        <div class="marca">
          <span class="logo">K</span>
          <div><strong>Banco Kinal</strong><small>Sistema académico</small></div>
        </div>
        <nav>
          <a routerLink="/clientes" routerLinkActive="activo">
            <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2 .8 3.5 2.7 3.5 5.7"/></svg>Clientes</a>
          <a routerLink="/cuentas" routerLinkActive="activo">
            <svg viewBox="0 0 24 24"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6.5 15h3"/></svg>Cuentas</a>
          <a routerLink="/operaciones" routerLinkActive="activo">
            <svg viewBox="0 0 24 24"><path d="M4 8h15m0 0-4-4m4 4-4 4M20 16H5m0 0 4-4m-4 4 4 4"/></svg>Operaciones</a>
          <a routerLink="/movimientos" routerLinkActive="activo">
            <svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>Movimientos</a>
          <a routerLink="/reportes" routerLinkActive="activo">
            <svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>Reportes</a>
        </nav>
        <div class="perfil">
          <span class="avatar">{{ iniciales }}</span>
          <div><strong>{{ auth.usuario?.nombre }}</strong><small>{{ auth.usuario?.rol }}</small></div>
        </div>
        <button class="btn claro" (click)="auth.logout()">Cerrar sesión</button>
      </aside>
      <main class="contenido"><router-outlet /></main>
    </div>`,
})
export class Shell {
  auth = inject(AuthService);
  get iniciales() {
    const n = (this.auth.usuario?.nombre || this.auth.usuario?.username || '?').trim().split(/\s+/);
    return ((n[0]?.[0] ?? '') + (n[1]?.[0] ?? '')).toUpperCase();
  }
}
