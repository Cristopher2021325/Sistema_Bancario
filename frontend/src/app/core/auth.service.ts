import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './config';
import { Usuario } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  usuario: Usuario | null = JSON.parse(localStorage.getItem('usuario') || 'null');

  get token(): string | null { return localStorage.getItem('token'); }
  get logueado(): boolean { return !!this.token; }
  get esAdmin(): boolean { return this.usuario?.rol === 'ADMIN'; }

  login(username: string, password: string) {
    return this.http.post<{ token: string; usuario: Usuario }>(`${API_URL}/auth/login`, { username, password }).pipe(
      tap(r => {
        localStorage.setItem('token', r.token);
        localStorage.setItem('usuario', JSON.stringify(r.usuario));
        this.usuario = r.usuario;
      }));
  }

  // HU03: cerrar sesión = descartar el token y volver al login.
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuario = null;
    this.router.navigate(['/login']);
  }
}
