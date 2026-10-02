import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../../config/db';
import { notFound, conflict, badRequest } from '../../utils/errors';
import { enteroPositivo, montoPositivo, textoOpcional } from '../../utils/validar';

const r2 = (n: number) => Number(n.toFixed(2));

// Transferencia entre cuentas en una sola transacción: o se aplican todos los cambios o ninguno.
export async function transferir(idUsuario: number, body: any) {
  const origen = enteroPositivo(body.id_cuenta_origen, 'id_cuenta_origen');
  const destino = enteroPositivo(body.id_cuenta_destino, 'id_cuenta_destino');
  const monto = montoPositivo(body.monto);
  const descripcion = textoOpcional(body.descripcion, 'descripcion', 150);
  if (origen === destino) throw badRequest('No se puede transferir hacia la misma cuenta');   // RN07

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Se bloquean ambas filas siempre en el mismo orden (por id) para evitar bloqueos mutuos.
    const [rows] = await conn.query<RowDataPacket[]>(
      'SELECT id_cuenta, saldo, estado FROM cuenta WHERE id_cuenta IN (?, ?) ORDER BY id_cuenta FOR UPDATE',
      [origen, destino]);
    const o = rows.find(r => r.id_cuenta === origen);
    const d = rows.find(r => r.id_cuenta === destino);
    if (!o) throw notFound('Cuenta origen no encontrada');                                   // RN05
    if (!d) throw notFound('Cuenta destino no encontrada');                                  // RN05
    if (o.estado !== 'ACTIVA' || d.estado !== 'ACTIVA')
      throw conflict('Una de las cuentas está inactiva y no puede realizar operaciones');    // RN09
    if (monto > o.saldo) throw conflict('Saldo insuficiente en la cuenta origen');           // RN06

    const saldoO = r2(o.saldo - monto);
    const saldoD = r2(d.saldo + monto);
    await conn.query('UPDATE cuenta SET saldo = ? WHERE id_cuenta = ?', [saldoO, origen]);
    await conn.query('UPDATE cuenta SET saldo = ? WHERE id_cuenta = ?', [saldoD, destino]);

    const [t] = await conn.query<ResultSetHeader>(
      'INSERT INTO transferencia (id_cuenta_origen, id_cuenta_destino, monto, id_usuario) VALUES (?, ?, ?, ?)',
      [origen, destino, monto, idUsuario]);
    // RN08: queda un movimiento en cada cuenta, enlazados por id_transferencia.
    await conn.query(
      `INSERT INTO movimiento (id_cuenta, tipo, monto, saldo_resultante, id_usuario, id_transferencia, descripcion)
       VALUES (?, 'TRANSFERENCIA_ENVIADA', ?, ?, ?, ?, ?), (?, 'TRANSFERENCIA_RECIBIDA', ?, ?, ?, ?, ?)`,
      [origen, monto, saldoO, idUsuario, t.insertId, descripcion,
       destino, monto, saldoD, idUsuario, t.insertId, descripcion]);
    await conn.commit();
    return {
      mensaje: 'Transferencia realizada', id_transferencia: t.insertId, monto,
      cuenta_origen: { id_cuenta: origen, saldo_actual: saldoO },
      cuenta_destino: { id_cuenta: destino, saldo_actual: saldoD },
    };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
