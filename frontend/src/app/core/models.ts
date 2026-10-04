export interface Usuario { id: number; username: string; nombre: string; rol: 'ADMIN' | 'CAJERO'; }
export interface Cliente {
  id_cliente: number; documento: string; nombres: string; apellidos: string;
  correo: string | null; telefono: string | null; direccion: string | null;
  estado: 'ACTIVO' | 'INACTIVO'; fecha_registro: string;
}
export interface TipoCuenta { id_tipo_cuenta: number; nombre: string; descripcion: string | null; }
export interface Cuenta {
  id_cuenta: number; numero_cuenta: string; id_cliente: number; cliente: string;
  id_tipo_cuenta: number; tipo_cuenta: string; saldo: number; estado: 'ACTIVA' | 'INACTIVA'; fecha_creacion: string;
}
export interface Movimiento {
  id_movimiento: number; id_cuenta: number; numero_cuenta: string; tipo: string; monto: number;
  saldo_resultante: number; fecha: string; usuario: string; id_transferencia: number | null;
  cuenta_relacionada: string | null; descripcion: string | null;
}
export interface Resumen {
  periodo: { desde: string | null; hasta: string | null };
  operaciones: { tipo: string; cantidad: number; total: number }[];
  totales: { clientes_activos: number; cuentas_activas: number; saldo_total: number };
}
export interface ResultadoOperacion {
  mensaje: string; saldo_actual?: number;
  cuenta_origen?: { saldo_actual: number }; cuenta_destino?: { saldo_actual: number };
}
