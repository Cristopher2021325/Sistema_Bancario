import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginPage) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell').then(m => m.Shell),
    children: [
      { path: 'clientes', loadComponent: () => import('./pages/clientes/clientes').then(m => m.ClientesPage) },
      { path: 'cuentas', loadComponent: () => import('./pages/cuentas/cuentas').then(m => m.CuentasPage) },
      { path: 'operaciones', loadComponent: () => import('./pages/operaciones/operaciones').then(m => m.OperacionesPage) },
      { path: 'movimientos', loadComponent: () => import('./pages/movimientos/movimientos').then(m => m.MovimientosPage) },
      { path: 'reportes', loadComponent: () => import('./pages/reportes/reportes').then(m => m.ReportesPage) },
      { path: '', pathMatch: 'full', redirectTo: 'clientes' },
    ],
  },
  { path: '**', redirectTo: '' },
];
