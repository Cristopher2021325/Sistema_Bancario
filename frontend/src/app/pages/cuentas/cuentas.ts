import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Cliente, Cuenta, TipoCuenta } from '../../core/models';
import { mensajeError } from '../../core/utils';

@Component({
  selector: 'app-cuentas',
  imports: [FormsModule, DecimalPipe, RouterLink],
  template: `
    <h2>Cuentas</h2>
    @if (ok) { <div class="alert ok">{{ ok }}</div> }
    @if (error) { <div class="alert error">{{ error }}</div> }

    <div class="barra-herramientas">
      <input class="buscar" placeholder="Buscar por número de cuenta, cliente o documento" [(ngModel)]="buscar" (keyup.enter)="cargar()">
      <button class="btn" (click)="cargar()">Buscar</button>
      <button class="btn primario" (click)="abrirForm()">Nueva cuenta</button>
    </div>

    @if (mostrarForm) {
      <form class="panel" (ngSubmit)="crear()">
        <h3>Crear cuenta</h3>
        <div class="grid">
          <label>Cliente *
            <select name="cliente" [(ngModel)]="idCliente">
              <option [ngValue]="null">-- Seleccione --</option>
              @for (c of clientesActivos; track c.id_cliente) {
                <option [ngValue]="c.id_cliente">{{ c.nombres }} {{ c.apellidos }} ({{ c.documento }})</option>
              }
            </select>
          </label>
          <label>Tipo de cuenta *
            <select name="tipo" [(ngModel)]="idTipo">
              <option [ngValue]="null">-- Seleccione --</option>
              @for (t of tipos; track t.id_tipo_cuenta) { <option [ngValue]="t.id_tipo_cuenta">{{ t.nombre }}</option> }
            </select>
          </label>
          <label>Saldo inicial (opcional)
            <input name="saldo" type="number" min="0" step="0.01" [(ngModel)]="saldoInicial">
          </label>
        </div>
        <div class="acciones">
          <button class="btn primario" type="submit">Crear cuenta</button>
          <button class="btn" type="button" (click)="mostrarForm = false">Cancelar</button>
        </div>
      </form>
    }

    <div class="tabla-caja">
      <table>
        <thead><tr><th>Número</th><th>Cliente</th><th>Tipo</th><th class="num">Saldo</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          @for (c of cuentas; track c.id_cuenta) {
            <tr>
              <td>{{ c.numero_cuenta }}</td>
              <td>{{ c.cliente }}</td>
              <td>{{ c.tipo_cuenta }}</td>
              <td class="num">Q {{ c.saldo | number:'1.2-2' }}</td>
              <td><span class="badge" [class.inactivo]="c.estado !== 'ACTIVA'">{{ c.estado }}</span></td>
              <td class="celda-acciones">
                <a class="btn chico" routerLink="/movimientos" [queryParams]="{ cuenta: c.id_cuenta }">Movimientos</a>
                @if (auth.esAdmin) {
                  <button class="btn chico" [class.peligro]="c.estado === 'ACTIVA'" (click)="cambiarEstado(c)">
                    {{ c.estado === 'ACTIVA' ? 'Desactivar' : 'Activar' }}
                  </button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6" class="vacio">No hay cuentas para mostrar</td></tr>
          }
        </tbody>
      </table>
    </div>
    @if (!auth.esAdmin) { <p class="nota">Solo el administrador puede cambiar el estado de una cuenta.</p> }`,
})
export class CuentasPage implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  cuentas: Cuenta[] = [];
  clientesActivos: Cliente[] = [];
  tipos: TipoCuenta[] = [];
  buscar = '';
  error = '';
  ok = '';
  mostrarForm = false;
  idCliente: number | null = null;
  idTipo: number | null = null;
  saldoInicial: number | null = null;

  ngOnInit() { this.cargar(); }

  cargar() {
    this.api.cuentas(this.buscar.trim()).subscribe({
      next: c => { this.cuentas = c; this.error = ''; },
      error: e => this.error = mensajeError(e),
    });
  }

  abrirForm() {
    this.ok = ''; this.error = '';
    this.idCliente = null; this.idTipo = null; this.saldoInicial = null;
    this.api.clientes().subscribe(c => this.clientesActivos = c.filter(x => x.estado === 'ACTIVO'));
    this.api.tiposCuenta().subscribe(t => this.tipos = t);
    this.mostrarForm = true;
  }

  crear() {
    this.ok = ''; this.error = '';
    if (!this.idCliente || !this.idTipo) { this.error = 'Seleccione el cliente y el tipo de cuenta'; return; }
    if (this.saldoInicial !== null && this.saldoInicial < 0) { this.error = 'El saldo inicial no puede ser negativo'; return; }
    const datos: { id_cliente: number; id_tipo_cuenta: number; saldo_inicial?: number } =
      { id_cliente: this.idCliente, id_tipo_cuenta: this.idTipo };
    if (this.saldoInicial && this.saldoInicial > 0) datos.saldo_inicial = this.saldoInicial;
    this.api.crearCuenta(datos).subscribe({
      next: c => { this.ok = `Cuenta ${c.numero_cuenta} creada y asociada al cliente`; this.mostrarForm = false; this.cargar(); },
      error: e => this.error = mensajeError(e),
    });
  }

  cambiarEstado(c: Cuenta) {
    const nuevo = c.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';
    if (!confirm(`¿Cambiar la cuenta ${c.numero_cuenta} a ${nuevo}?`)) return;
    this.ok = ''; this.error = '';
    this.api.cambiarEstadoCuenta(c.id_cuenta, nuevo).subscribe({
      next: () => { this.ok = `Cuenta ${nuevo === 'ACTIVA' ? 'activada' : 'desactivada'}`; this.cargar(); },
      error: e => this.error = mensajeError(e),
    });
  }
}
