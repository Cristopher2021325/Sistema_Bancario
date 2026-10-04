import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Protege las pantallas: sin sesión se redirige al login (RNF03).
export const authGuard: CanActivateFn = () =>
  inject(AuthService).logueado || inject(Router).createUrlTree(['/login']);
