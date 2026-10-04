import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Cliente } from '../../core/models';
import { mensajeError } from '../../core/utils';

const vacio = () => ({ documento: '', nombres: '', apellidos: '', correo: '', telefono: '', direccion: '' });

@Component({
  selector: 'app-clientes',
  imports: [FormsModule],
  template: `
    <h2>Clientes</h2>
    @if (ok) { <div class="alert ok">{{ ok }}</div> }
    @if (error) { <div class="alert error">{{ error }}</div> }

    <div class="barra-herramientas">
      <input class="buscar" placeholder="Buscar por nombre, apellido o documento" [(ngModel)]="buscar" (keyup.enter)="cargar()">
      <button class="btn" (click)="cargar()">Buscar</button>
      <button class="btn primario" (click)="nuevo()">Nuevo cliente</button>
    </div>

    @if (mostrarForm) {
      <form class="panel" (ngSubmit)="guardar()">
        <h3>{{ editandoId ? 'Modificar cliente' : 'Registrar cliente' }}</h3>
        <div class="grid">
          <label>Documento (ficticio) *<input name="documento" [(ngModel)]="form.documento" maxlength="20"></label>
          <label>Nombres *<input name="nombres" [(ngModel)]="form.nombres" maxlength="60"></label>
          <label>Apellidos *<input name="apellidos" [(ngModel)]="form.apellidos" maxlength="60"></label>
          <label>Correo<input name="correo" type="email" [(ngModel)]="form.correo" maxlength="100"></label>
          <label>Teléfono<input name="telefono" [(ngModel)]="form.telefono" maxlength="15"></label>
          <label>Dirección<input name="direccion" [(ngModel)]="form.direccion" maxlength="150"></label>
        </div>
        <div class="acciones">
          <button class="btn primario" type="submit">Guardar</button>
          <button class="btn" type="button" (click)="mostrarForm = false">Cancelar</button>
        </div>
      </form>
    }

    <div class="tabla-caja">
      <table>
        <thead><tr><th>ID</th><th>Documento</th><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          @for (c of clientes; track c.id_cliente) {
            <tr>
              <td>{{ c.id_cliente }}</td>
              <td>{{ c.documento }}</td>
              <td>{{ c.nombres }} {{ c.apellidos }}</td>
              <td>{{ c.correo }}</td>
              <td>{{ c.telefono }}</td>
              <td><span class="badge" [class.inactivo]="c.estado !== 'ACTIVO'">{{ c.estado }}</span></td>
              <td class="celda-acciones">
                @if (auth.esAdmin) {
                  <button class="btn chico" (click)="editar(c)">Editar</button>
                  @if (c.estado === 'ACTIVO') { <button class="btn chico peligro" (click)="desactivar(c)">Desactivar</button> }
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="7" class="vacio">No hay clientes para mostrar</td></tr>
          }
        </tbody>
      </table>
    </div>
    @if (!auth.esAdmin) { <p class="nota">Solo el administrador puede modificar o desactivar clientes.</p> }`,
})
export class ClientesPage implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  clientes: Cliente[] = [];
  buscar = '';
  error = '';
  ok = '';
  mostrarForm = false;
  editandoId: number | null = null;
  form = vacio();

  ngOnInit() { this.cargar(); }

  cargar() {
    this.api.clientes(this.buscar.trim()).subscribe({
      next: c => { this.clientes = c; this.error = ''; },
      error: e => this.error = mensajeError(e),
    });
  }

  nuevo() { this.editandoId = null; this.form = vacio(); this.mostrarForm = true; this.ok = ''; this.error = ''; }

  editar(c: Cliente) {
    this.editandoId = c.id_cliente;
    this.form = {
      documento: c.documento, nombres: c.nombres, apellidos: c.apellidos,
      correo: c.correo ?? '', telefono: c.telefono ?? '', direccion: c.direccion ?? '',
    };
    this.mostrarForm = true; this.ok = ''; this.error = '';
  }

  guardar() {
    this.ok = ''; this.error = '';
    const f = this.form;
    if (!f.documento.trim() || !f.nombres.trim() || !f.apellidos.trim()) {
      this.error = 'Documento, nombres y apellidos son obligatorios'; return;
    }
    // PUT reemplaza todos los campos, por eso siempre se envía el cliente completo.
    const op = this.editandoId ? this.api.actualizarCliente(this.editandoId, f) : this.api.crearCliente(f);
    op.subscribe({
      next: () => {
        this.ok = this.editandoId ? 'Cliente modificado correctamente' : 'Cliente registrado correctamente';
        this.mostrarForm = false; this.cargar();
      },
      error: e => this.error = mensajeError(e),
    });
  }

  desactivar(c: Cliente) {
    if (!confirm(`¿Desactivar a ${c.nombres} ${c.apellidos}? Sus cuentas quedarán inactivas.`)) return;
    this.ok = ''; this.error = '';
    this.api.desactivarCliente(c.id_cliente).subscribe({
      next: () => { this.ok = 'Cliente desactivado'; this.cargar(); },
      error: e => this.error = mensajeError(e),
    });
  }
}
