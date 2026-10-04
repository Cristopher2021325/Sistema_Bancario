import { Component, OnInit, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { Cuenta } from '../../core/models';
import { mensajeError } from '../../core/utils';

type Resultado = { ok: string; error: string };

@Component({
  selector: 'app-operaciones',
  imports: [FormsModule, DecimalPipe],
  template: `
    <h2>Operaciones</h2>
    <div class="tres-col">

      <form class="panel" (ngSubmit)="depositar()">
        <h3>Depósito</h3>
        @if (dep.ok) { <div class="alert ok">{{ dep.ok }}</div> }
        @if (dep.error) { <div class="alert error">{{ dep.error }}</div> }
        <label>Cuenta
          <select name="dCuenta" [(ngModel)]="dCuenta">
            <option [ngValue]="null">-- Seleccione --</option>
            @for (c of cuentas; track c.id_cuenta) { <option [ngValue]="c.id_cuenta">{{ c.numero_cuenta }} · {{ c.cliente }} · Q {{ c.saldo | number:'1.2-2' }}</option> }
          </select>
        </label>
        <label>Monto (Q)<input name="dMonto" type="number" min="0.01" step="0.01" [(ngModel)]="dMonto"></label>
        <label>Descripción (opcional)<input name="dDesc" maxlength="150" [(ngModel)]="dDesc"></label>
        <button class="btn primario" type="submit">Registrar depósito</button>
      </form>

      <form class="panel" (ngSubmit)="retirar()">
        <h3>Retiro</h3>
        @if (ret.ok) { <div class="alert ok">{{ ret.ok }}</div> }
        @if (ret.error) { <div class="alert error">{{ ret.error }}</div> }
        <label>Cuenta
          <select name="rCuenta" [(ngModel)]="rCuenta">
            <option [ngValue]="null">-- Seleccione --</option>
            @for (c of cuentas; track c.id_cuenta) { <option [ngValue]="c.id_cuenta">{{ c.numero_cuenta }} · {{ c.cliente }} · Q {{ c.saldo | number:'1.2-2' }}</option> }
          </select>
        </label>
        <label>Monto (Q)<input name="rMonto" type="number" min="0.01" step="0.01" [(ngModel)]="rMonto"></label>
        <label>Descripción (opcional)<input name="rDesc" maxlength="150" [(ngModel)]="rDesc"></label>
        <button class="btn primario" type="submit">Registrar retiro</button>
      </form>

      <form class="panel" (ngSubmit)="transferir()">
        <h3>Transferencia</h3>
        @if (tra.ok) { <div class="alert ok">{{ tra.ok }}</div> }
        @if (tra.error) { <div class="alert error">{{ tra.error }}</div> }
        <label>Cuenta origen
          <select name="tOrigen" [(ngModel)]="tOrigen">
            <option [ngValue]="null">-- Seleccione --</option>
            @for (c of cuentas; track c.id_cuenta) { <option [ngValue]="c.id_cuenta">{{ c.numero_cuenta }} · {{ c.cliente }} · Q {{ c.saldo | number:'1.2-2' }}</option> }
          </select>
        </label>
        <label>Cuenta destino
          <select name="tDestino" [(ngModel)]="tDestino">
            <option [ngValue]="null">-- Seleccione --</option>
            @for (c of cuentas; track c.id_cuenta) { <option [ngValue]="c.id_cuenta">{{ c.numero_cuenta }} · {{ c.cliente }}</option> }
          </select>
        </label>
        <label>Monto (Q)<input name="tMonto" type="number" min="0.01" step="0.01" [(ngModel)]="tMonto"></label>
        <label>Descripción (opcional)<input name="tDesc" maxlength="150" [(ngModel)]="tDesc"></label>
        <button class="btn primario" type="submit">Realizar transferencia</button>
      </form>
    </div>
    <p class="nota">Solo se listan cuentas activas. Todas las reglas (monto mayor que cero, saldo suficiente, cuentas distintas) las valida también el servidor.</p>`,
})
export class OperacionesPage implements OnInit {
  private api = inject(ApiService);
  cuentas: Cuenta[] = [];
  dep: Resultado = { ok: '', error: '' };
  ret: Resultado = { ok: '', error: '' };
  tra: Resultado = { ok: '', error: '' };
  dCuenta: number | null = null; dMonto: number | null = null; dDesc = '';
  rCuenta: number | null = null; rMonto: number | null = null; rDesc = '';
  tOrigen: number | null = null; tDestino: number | null = null; tMonto: number | null = null; tDesc = '';

  ngOnInit() { this.cargarCuentas(); }

  private cargarCuentas() {
    this.api.cuentas().subscribe(c => this.cuentas = c.filter(x => x.estado === 'ACTIVA'));
  }

  private validar(r: Resultado, cuenta: number | null, monto: number | null): boolean {
    r.ok = ''; r.error = '';
    if (!cuenta) { r.error = 'Seleccione la cuenta'; return false; }
    if (!monto || monto <= 0) { r.error = 'El monto debe ser mayor que cero'; return false; }
    return true;
  }

  depositar() {
    if (!this.validar(this.dep, this.dCuenta, this.dMonto)) return;
    this.api.depositar({ id_cuenta: this.dCuenta!, monto: this.dMonto!, descripcion: this.dDesc }).subscribe({
      next: r => { this.dep.ok = `${r.mensaje}. Nuevo saldo: Q ${r.saldo_actual!.toFixed(2)}`; this.dMonto = null; this.dDesc = ''; this.cargarCuentas(); },
      error: e => this.dep.error = mensajeError(e),
    });
  }

  retirar() {
    if (!this.validar(this.ret, this.rCuenta, this.rMonto)) return;
    this.api.retirar({ id_cuenta: this.rCuenta!, monto: this.rMonto!, descripcion: this.rDesc }).subscribe({
      next: r => { this.ret.ok = `${r.mensaje}. Nuevo saldo: Q ${r.saldo_actual!.toFixed(2)}`; this.rMonto = null; this.rDesc = ''; this.cargarCuentas(); },
      error: e => this.ret.error = mensajeError(e),
    });
  }

  transferir() {
    if (!this.validar(this.tra, this.tOrigen, this.tMonto)) return;
    if (!this.tDestino) { this.tra.error = 'Seleccione la cuenta destino'; return; }
    if (this.tOrigen === this.tDestino) { this.tra.error = 'No se puede transferir hacia la misma cuenta'; return; }
    this.api.transferir({ id_cuenta_origen: this.tOrigen!, id_cuenta_destino: this.tDestino, monto: this.tMonto!, descripcion: this.tDesc }).subscribe({
      next: r => {
        this.tra.ok = `${r.mensaje}. Saldo origen: Q ${r.cuenta_origen!.saldo_actual.toFixed(2)} · Saldo destino: Q ${r.cuenta_destino!.saldo_actual.toFixed(2)}`;
        this.tMonto = null; this.tDesc = ''; this.cargarCuentas();
      },
      error: e => this.tra.error = mensajeError(e),
    });
  }
}
