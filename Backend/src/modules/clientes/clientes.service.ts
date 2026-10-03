import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../../config/db';
import { notFound, conflict } from '../../utils/errors';
import { textoRequerido, textoOpcional, correoOpcional } from '../../utils/validar';

const COLUMNAS = 'id_cliente, documento, nombres, apellidos, correo, telefono, direccion, estado, fecha_registro';

function datosCliente(b: any) {
  return {
    documento: textoRequerido(b.documento, 'documento', 20),
    nombres: textoRequerido(b.nombres, 'nombres', 60),
    apellidos: textoRequerido(b.apellidos, 'apellidos', 60),
    correo: correoOpcional(b.correo),
    telefono: textoOpcional(b.telefono, 'telefono', 15),
    direccion: textoOpcional(b.direccion, 'direccion', 150),
  };
}

export async function listar(buscar?: string) {
  if (buscar && buscar.trim()) {
    const like = `%${buscar.trim()}%`;
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT ${COLUMNAS} FROM cliente
       WHERE nombres LIKE ? OR apellidos LIKE ? OR documento LIKE ? ORDER BY id_cliente`,
      [like, like, like]);
    return rows;
  }
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT ${COLUMNAS} FROM cliente ORDER BY id_cliente`);
  return rows;
}

export async function obtener(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(`SELECT ${COLUMNAS} FROM cliente WHERE id_cliente = ?`, [id]);
  if (rows.length === 0) throw notFound('Cliente no encontrado');
  return rows[0];
}

export async function crear(body: any) {
  const d = datosCliente(body);
  try {
    const [r] = await pool.query<ResultSetHeader>(
      `INSERT INTO cliente (documento, nombres, apellidos, correo, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)`,
      [d.documento, d.nombres, d.apellidos, d.correo, d.telefono, d.direccion]);
    return obtener(r.insertId);
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') throw conflict('Ya existe un cliente con ese documento');
    throw e;
  }
}

export async function actualizar(id: number, body: any) {
  await obtener(id);
  const d = datosCliente(body);
  try {
    await pool.query(
      `UPDATE cliente SET documento=?, nombres=?, apellidos=?, correo=?, telefono=?, direccion=? WHERE id_cliente=?`,
      [d.documento, d.nombres, d.apellidos, d.correo, d.telefono, d.direccion, id]);
  } catch (e: any) {
    if (e.code === 'ER_DUP_ENTRY') throw conflict('Ya existe un cliente con ese documento');
    throw e;
  }
  return obtener(id);
}

// Desactivación lógica: el cliente no se borra y sus cuentas pasan a INACTIVA (RN09).
export async function desactivar(id: number) {
  await obtener(id);
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`UPDATE cliente SET estado='INACTIVO' WHERE id_cliente=?`, [id]);
    await conn.query(`UPDATE cuenta SET estado='INACTIVA' WHERE id_cliente=?`, [id]);
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
  return obtener(id);
}
