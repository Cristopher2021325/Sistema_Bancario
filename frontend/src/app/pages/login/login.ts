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
      <section class="login-marca">
        <div class="marca"><span class="logo">K</span><strong>Banco Kinal</strong></div>
        <div>
          <h1>Clientes, cuentas y operaciones en un solo lugar.</h1>
          <p>Sistema académico de Fundación Kinal. Todos los datos son ficticios.</p>
        </div>
      </section>
      <section class="login-lado">
        <form class="login-caja" (ngSubmit)="ingresar()">
          <div>
            <h2>Iniciar sesión</h2>
            <p class="sub">Ingrese con su usuario y contraseña.</p>
          </div>
          @if (error) { <div class="alert error">{{ error }}</div> }
          <label>Usuario
            <input name="username" [(ngModel)]="username" autocomplete="username" autofocus>
          </label>
          <label>Contraseña
            <input name="password" type="password" [(ngModel)]="password" autocomplete="current-password">
          </label>
          <button class="btn primario" type="submit" [disabled]="cargando">{{ cargando ? 'Ingresando...' : 'Ingresar' }}</button>
        </form>
      </section>
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
