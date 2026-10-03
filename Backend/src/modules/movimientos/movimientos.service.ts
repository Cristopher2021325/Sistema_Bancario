import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';
import { notFound, badRequest } from '../../utils/errors';
import { fechaOpcional } from '../../utils/validar';
import { depositar, retirar } from '../operaciones/operaciones.service';

const TIPOS = ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA_ENVIADA', 'TRANSFERENCIA_RECIBIDA'];

// En transferencias, "cuenta_relacionada" muestra la otra cuenta involucrada (RN08).
const SELECT = `
  SELECT m.id_movimiento, m.id_cuenta, c.numero_cuenta, m.tipo, m.monto, m.saldo_resultante, m.fecha,
         u.username AS usuario, m.id_transferencia, c2.numero_cuenta AS cuenta_relacionada, m.descripcion
  FROM movimiento m
  JOIN cuenta c ON c.id_cuenta = m.id_cuenta
  JOIN usuario u ON u.id_usuario = m.id_usuario
  LEFT JOIN transferencia t ON t.id_transferencia = m.id_transferencia
  LEFT JOIN cuenta c2 ON c2.id_cuenta = CASE m.tipo
       WHEN 'TRANSFERENCIA_ENVIADA' THEN t.id_cuenta_destino
       WHEN 'TRANSFERENCIA_RECIBIDA' THEN t.id_cuenta_origen END`;

async function consultar(q: any, idCuenta?: number) {
  const where: string[] = []; const params: any[] = [];
  if (idCuenta) { where.push('m.id_cuenta = ?'); params.push(idCuenta); }
  if (q.tipo) {
    if (!TIPOS.includes(q.tipo)) throw badRequest(`El tipo debe ser uno de: ${TIPOS.join(', ')}`);
    where.push('m.tipo = ?'); params.push(q.tipo);
  }
  const desde = fechaOpcional(q.desde, 'desde'); const hasta = fechaOpcional(q.hasta, 'hasta');
  if (desde) { where.push('m.fecha >= ?'); params.push(desde); }
  if (hasta) { where.push('m.fecha < DATE_ADD(?, INTERVAL 1 DAY)'); params.push(hasta); }
  const limite = Math.min(Math.max(parseInt(q.limite) || 100, 1), 500);
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY m.id_movimiento DESC LIMIT ?`,
    [...params, limite]);
  return rows;
}

export const listar = (q: any) => consultar(q);

export async function porCuenta(idCuenta: number, q: any) {
  const [c] = await pool.query<RowDataPacket[]>('SELECT 1 FROM cuenta WHERE id_cuenta = ?', [idCuenta]);
  if (c.length === 0) throw notFound('Cuenta no encontrada');
  return consultar(q, idCuenta);
}

// POST /movimientos registra un depósito o retiro. Siempre actualiza el saldo y valida las reglas,
// para que un movimiento nunca quede desconectado del saldo. Las transferencias usan /transferencias.
export async function registrar(idUsuario: number, body: any) {
  if (body.tipo === 'DEPOSITO') return depositar(idUsuario, body);
  if (body.tipo === 'RETIRO') return retirar(idUsuario, body);
  throw badRequest('El tipo debe ser DEPOSITO o RETIRO (las transferencias se hacen en /transferencias)');
}
