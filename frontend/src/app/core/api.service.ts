import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_URL } from './config';
import { Cliente, Cuenta, Movimiento, ResultadoOperacion, Resumen, TipoCuenta } from './models';

// Todas las llamadas a la API REST en un solo lugar.
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private params(obj: Record<string, string | number | null | undefined>) {
    let p = new HttpParams();
    for (const [k, v] of Object.entries(obj)) if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
    return p;
  }

  // Clientes
  clientes(buscar = '') { return this.http.get<Cliente[]>(`${API_URL}/clientes`, { params: this.params({ buscar }) }); }
  crearCliente(c: Partial<Cliente>) { return this.http.post<Cliente>(`${API_URL}/clientes`, c); }
  actualizarCliente(id: number, c: Partial<Cliente>) { return this.http.put<Cliente>(`${API_URL}/clientes/${id}`, c); }
  desactivarCliente(id: number) { return this.http.patch<Cliente>(`${API_URL}/clientes/${id}/desactivar`, {}); }

  // Cuentas
  cuentas(buscar = '') { return this.http.get<Cuenta[]>(`${API_URL}/cuentas`, { params: this.params({ buscar }) }); }
  tiposCuenta() { return this.http.get<TipoCuenta[]>(`${API_URL}/tipos-cuenta`); }
  crearCuenta(d: { id_cliente: number; id_tipo_cuenta: number; saldo_inicial?: number }) {
    return this.http.post<Cuenta>(`${API_URL}/cuentas`, d);
  }
  cambiarEstadoCuenta(id: number, estado: 'ACTIVA' | 'INACTIVA') {
    return this.http.put<Cuenta>(`${API_URL}/cuentas/${id}`, { estado });
  }

  // Operaciones
  depositar(d: { id_cuenta: number; monto: number; descripcion?: string }) {
    return this.http.post<ResultadoOperacion>(`${API_URL}/depositos`, d);
  }
  retirar(d: { id_cuenta: number; monto: number; descripcion?: string }) {
    return this.http.post<ResultadoOperacion>(`${API_URL}/retiros`, d);
  }
  transferir(d: { id_cuenta_origen: number; id_cuenta_destino: number; monto: number; descripcion?: string }) {
    return this.http.post<ResultadoOperacion>(`${API_URL}/transferencias`, d);
  }

  // Consultas y reportes
  movimientos(f: { id_cuenta?: number | null; tipo?: string; desde?: string; hasta?: string }) {
    const { id_cuenta, ...resto } = f;
    const url = id_cuenta ? `${API_URL}/movimientos/cuenta/${id_cuenta}` : `${API_URL}/movimientos`;
    return this.http.get<Movimiento[]>(url, { params: this.params(resto) });
  }
  resumen(desde = '', hasta = '') { return this.http.get<Resumen>(`${API_URL}/reportes/resumen`, { params: this.params({ desde, hasta }) }); }
}
