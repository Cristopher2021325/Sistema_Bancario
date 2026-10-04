import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/utils';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="login-fondo">
      <form class="login-caja" (ngSubmit)="ingresar()">
        <h1>Sistema Bancario</h1>
        <p class="sub">Fundación Kinal · Taller 2 (sistema académico, datos ficticios)</p>
        @if (error) { <div class="alert error">{{ error }}</div> }
        <label>Usuario
          <input name="username" [(ngModel)]="username" autocomplete="username" autofocus>
        </label>
        <label>Contraseña
          <input name="password" type="password" [(ngModel)]="password" autocomplete="current-password">
        </label>
        <button class="btn primario" type="submit" [disabled]="cargando">{{ cargando ? 'Ingresando...' : 'Ingresar' }}</button>
      </form>
    </div>`,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  username = '';
  password = '';
  error = '';
  cargando = false;

  ingresar() {
    this.error = '';
    if (!this.username.trim() || !this.password) { this.error = 'Ingrese usuario y contraseña'; return; }
    this.cargando = true;
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => this.router.navigate(['/clientes']),
      error: e => { this.error = mensajeError(e); this.cargando = false; },
    });
  }
}
