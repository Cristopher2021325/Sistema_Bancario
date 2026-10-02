import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../../config/db';
import { notFound, conflict } from '../../utils/errors';
import { enteroPositivo, montoPositivo, textoOpcional } from '../../utils/validar';

type Tipo = 'DEPOSITO' | 'RETIRO';

// Ejecuta un depósito o retiro dentro de una transacción (todo o nada).
// FOR UPDATE bloquea la fila de la cuenta para que dos operaciones simultáneas no corrompan el saldo.
async function operar(tipo: Tipo, idUsuario: number, body: any) {
  const idCuenta = enteroPositivo(body.id_cuenta, 'id_cuenta');
  const monto = montoPositivo(body.monto);
  const descripcion = textoOpcional(body.descripcion, 'descripcion', 150);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT saldo, estado FROM cuenta WHERE id_cuenta = ? FOR UPDATE', [idCuenta]);
    if (rows.length === 0) throw notFound('Cuenta no encontrada');
    const { saldo, estado } = rows[0];

    if (estado !== 'ACTIVA') throw conflict('La cuenta está inactiva y no puede realizar operaciones');   // RN09
    if (tipo === 'RETIRO' && monto > saldo) throw conflict('Saldo insuficiente para realizar el retiro');  // RN02

    const nuevoSaldo = Number((tipo === 'DEPOSITO' ? saldo + monto : saldo - monto).toFixed(2));
    await conn.query('UPDATE cuenta SET saldo = ? WHERE id_cuenta = ?', [nuevoSaldo, idCuenta]);
    const [mov] = await conn.query<ResultSetHeader>(
      `INSERT INTO movimiento (id_cuenta, tipo, monto, saldo_resultante, id_usuario, descripcion)
       VALUES (?, ?, ?, ?, ?, ?)`, [idCuenta, tipo, monto, nuevoSaldo, idUsuario, descripcion]);   // RN08
    await conn.commit();
    return {
      mensaje: tipo === 'DEPOSITO' ? 'Depósito registrado' : 'Retiro registrado',
      id_movimiento: mov.insertId, id_cuenta: idCuenta, monto, saldo_actual: nuevoSaldo,
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export const depositar = (idUsuario: number, body: any) => operar('DEPOSITO', idUsuario, body);
export const retirar = (idUsuario: number, body: any) => operar('RETIRO', idUsuario, body);
