import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Resumen } from '../../core/models';
import { etiquetaTipo, mensajeError } from '../../core/utils';

@Component({
  selector: 'app-reportes',
  imports: [FormsModule, DecimalPipe],
  template: `
    <h2>Reporte: resumen de operaciones</h2>
    @if (error) { <div class="alert error">{{ error }}</div> }
    <form class="panel filtros" (ngSubmit)="cargar()">
      <label>Desde<input name="desde" type="date" [(ngModel)]="desde"></label>
      <label>Hasta<input name="hasta" type="date" [(ngModel)]="hasta"></label>
      <button class="btn primario" type="submit">Generar</button>
    </form>

    @if (r) {
      <div class="tarjetas">
        <div class="tarjeta"><span>Clientes activos</span><strong>{{ r.totales.clientes_activos }}</strong></div>
        <div class="tarjeta"><span>Cuentas activas</span><strong>{{ r.totales.cuentas_activas }}</strong></div>
        <div class="tarjeta"><span>Saldo total del banco</span><strong>Q {{ r.totales.saldo_total | number:'1.2-2' }}</strong></div>
      </div>
      <div class="tabla-caja">
        <table>
          <thead><tr><th>Tipo de operación</th><th class="num">Cantidad</th><th class="num">Monto total</th></tr></thead>
          <tbody>
            @for (o of r.operaciones; track o.tipo) {
              <tr><td>{{ etiqueta(o.tipo) }}</td><td class="num">{{ o.cantidad }}</td><td class="num">Q {{ o.total | number:'1.2-2' }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    }`,
})
export class ReportesPage implements OnInit {
  private api = inject(ApiService);
  r: Resumen | null = null;
  etiqueta = etiquetaTipo;
  desde = ''; hasta = ''; error = '';

  ngOnInit() { this.cargar(); }

  cargar() {
    this.error = '';
    if (this.desde && this.hasta && this.desde > this.hasta) { this.error = 'La fecha "desde" no puede ser mayor que "hasta"'; return; }
    this.api.resumen(this.desde, this.hasta).subscribe({
      next: r => this.r = r,
      error: e => this.error = mensajeError(e),
    });
  }
}
