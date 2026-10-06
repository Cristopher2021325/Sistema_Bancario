import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { Cuenta, Movimiento } from '../../core/models';
import { TIPOS_MOVIMIENTO, etiquetaTipo, mensajeError } from '../../core/utils';

@Component({
  selector: 'app-movimientos',
  imports: [FormsModule, DatePipe, DecimalPipe],
  template: `
    <h2>Movimientos</h2>
    @if (error) { <div class="alert error">{{ error }}</div> }
    <form class="panel filtros" (ngSubmit)="cargar()">
      <label>Cuenta
        <select name="cuenta" [(ngModel)]="idCuenta">
          <option [ngValue]="null">Todas las cuentas</option>
          @for (c of cuentas; track c.id_cuenta) { <option [ngValue]="c.id_cuenta">{{ c.numero_cuenta }} · {{ c.cliente }}</option> }
        </select>
      </label>
      <label>Tipo
        <select name="tipo" [(ngModel)]="tipo">
          <option value="">Todos</option>
          @for (t of tipos; track t) { <option [value]="t">{{ etiqueta(t) }}</option> }
        </select>
      </label>
      <label>Desde<input name="desde" type="date" [(ngModel)]="desde"></label>
      <label>Hasta<input name="hasta" type="date" [(ngModel)]="hasta"></label>
      <button class="btn primario" type="submit">Consultar</button>
    </form>

    <div class="tabla-caja">
      <table>
        <thead><tr><th>Fecha</th><th>Cuenta</th><th>Tipo</th><th class="num">Monto</th><th class="num">Saldo resultante</th><th>Cuenta relacionada</th><th>Usuario</th><th>Descripción</th></tr></thead>
        <tbody>
          @for (m of movimientos; track m.id_movimiento) {
            <tr>
              <td>{{ m.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ m.numero_cuenta }}</td>
              <td><span class="tipo">{{ etiqueta(m.tipo) }}</span></td>
              <td class="num" [class.ingreso]="esIngreso(m.tipo)" [class.egreso]="!esIngreso(m.tipo)">{{ esIngreso(m.tipo) ? '+' : '−' }} Q {{ m.monto | number:'1.2-2' }}</td>
              <td class="num">Q {{ m.saldo_resultante | number:'1.2-2' }}</td>
              <td>{{ m.cuenta_relacionada }}</td>
              <td>{{ m.usuario }}</td>
              <td>{{ m.descripcion }}</td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="vacio">No hay movimientos para mostrar</td></tr>
          }
        </tbody>
      </table>
    </div>
    <p class="nota">Se muestran los 100 movimientos más recientes que cumplan el filtro.</p>`,
})
export class MovimientosPage implements OnInit {
  private api = inject(ApiService);
  private ruta = inject(ActivatedRoute);
  movimientos: Movimiento[] = [];
  cuentas: Cuenta[] = [];
  tipos = TIPOS_MOVIMIENTO;
  etiqueta = etiquetaTipo;
  esIngreso = (t: string) => t === 'DEPOSITO' || t === 'TRANSFERENCIA_RECIBIDA';
  idCuenta: number | null = null;
  tipo = ''; desde = ''; hasta = ''; error = '';

  ngOnInit() {
    const c = Number(this.ruta.snapshot.queryParamMap.get('cuenta'));
    if (c) this.idCuenta = c;           // viene desde el botón "Movimientos" de la pantalla de cuentas
    this.api.cuentas().subscribe(x => this.cuentas = x);
    this.cargar();
  }

  cargar() {
    this.error = '';
    if (this.desde && this.hasta && this.desde > this.hasta) { this.error = 'La fecha "desde" no puede ser mayor que "hasta"'; return; }
    this.api.movimientos({ id_cuenta: this.idCuenta, tipo: this.tipo, desde: this.desde, hasta: this.hasta }).subscribe({
      next: m => this.movimientos = m,
      error: e => this.error = mensajeError(e),
    });
  }
}
