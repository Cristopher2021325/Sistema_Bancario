import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../../config/db';
import { notFound, badRequest, conflict } from '../../utils/errors';
import { enteroPositivo, montoPositivo } from '../../utils/validar';

const SELECT = `
  SELECT c.id_cuenta, c.numero_cuenta, c.id_cliente,
         CONCAT(cl.nombres, ' ', cl.apellidos) AS cliente,
         c.id_tipo_cuenta, t.nombre AS tipo_cuenta,
         c.saldo, c.estado, c.fecha_creacion
  FROM cuenta c
  JOIN cliente cl ON cl.id_cliente = c.id_cliente
  JOIN tipo_cuenta t ON t.id_tipo_cuenta = c.id_tipo_cuenta`;

export async function listar(buscar?: string) {
  if (buscar && buscar.trim()) {
    const like = `%${buscar.trim()}%`;
    const [rows] = await pool.query<RowDataPacket[]>(
      `${SELECT} WHERE c.numero_cuenta LIKE ? OR cl.nombres LIKE ? OR cl.apellidos LIKE ? OR cl.documento LIKE ?
       ORDER BY c.id_cuenta`, [like, like, like, like]);
    return rows;
  }
  const [rows] = await pool.query<RowDataPacket[]>(`${SELECT} ORDER BY c.id_cuenta`);
  return rows;
}

export async function obtener(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(`${SELECT} WHERE c.id_cuenta = ?`, [id]);
  if (rows.length === 0) throw notFound('Cuenta no encontrada');
  return rows[0];
}

async function validarTipo(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT 1 FROM tipo_cuenta WHERE id_tipo_cuenta = ?', [id]);
  if (rows.length === 0) throw notFound('Tipo de cuenta no encontrado');
}

const generarNumero = () => '10' + Math.floor(Math.random() * 1e10).toString().padStart(10, '0');

// RN01: toda cuenta pertenece a un cliente existente y activo.
// Si viene saldo_inicial se registra como un depósito (RN08), todo en una transacción.
export async function crear(body: any, idUsuario: number) {
  const idCliente = enteroPositivo(body.id_cliente, 'id_cliente');
  const idTipo = enteroPositivo(body.id_tipo_cuenta, 'id_tipo_cuenta');
  const saldoInicial = body.saldo_inicial === undefined || body.saldo_inicial === null || body.saldo_inicial === ''
    ? 0 : montoPositivo(body.saldo_inicial, 'saldo_inicial');

  const [cli] = await pool.query<RowDataPacket[]>('SELECT estado FROM cliente WHERE id_cliente = ?', [idCliente]);
  if (cli.length === 0) throw notFound('Cliente no encontrado');
  if (cli[0].estado !== 'ACTIVO') throw conflict('No se puede crear una cuenta para un cliente inactivo');
  await validarTipo(idTipo);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    let idCuenta = 0;
    for (let intento = 0; intento < 5 && !idCuenta; intento++) {
      try {
        const [r] = await conn.query<ResultSetHeader>(
          'INSERT INTO cuenta (numero_cuenta, id_cliente, id_tipo_cuenta, saldo) VALUES (?, ?, ?, ?)',
          [generarNumero(), idCliente, idTipo, saldoInicial]);
        idCuenta = r.insertId;
      } catch (e: any) {
        if (e.code !== 'ER_DUP_ENTRY') throw e; // número repetido: se reintenta
      }
    }
    if (!idCuenta) throw new Error('No se pudo generar un número de cuenta único');
    if (saldoInicial > 0) {
      await conn.query(
        `INSERT INTO movimiento (id_cuenta, tipo, monto, saldo_resultante, id_usuario, descripcion)
         VALUES (?, 'DEPOSITO', ?, ?, ?, 'Saldo inicial')`, [idCuenta, saldoInicial, saldoInicial, idUsuario]);
    }
    await conn.commit();
    return obtener(idCuenta);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// Solo se puede cambiar el tipo y el estado; el saldo cambia únicamente con operaciones.
export async function actualizar(id: number, body: any) {
  const actual = await obtener(id);
  const idTipo = body.id_tipo_cuenta !== undefined ? enteroPositivo(body.id_tipo_cuenta, 'id_tipo_cuenta') : actual.id_tipo_cuenta;
  const estado = body.estado !== undefined ? body.estado : actual.estado;
  if (estado !== 'ACTIVA' && estado !== 'INACTIVA') throw badRequest('El estado debe ser ACTIVA o INACTIVA');
  await validarTipo(idTipo);

  if (estado === 'ACTIVA' && actual.estado === 'INACTIVA') {
    const [cli] = await pool.query<RowDataPacket[]>('SELECT estado FROM cliente WHERE id_cliente = ?', [actual.id_cliente]);
    if (cli[0].estado !== 'ACTIVO') throw conflict('No se puede activar la cuenta de un cliente inactivo');
  }
  await pool.query('UPDATE cuenta SET id_tipo_cuenta = ?, estado = ? WHERE id_cuenta = ?', [idTipo, estado, id]);
  return obtener(id);
}
