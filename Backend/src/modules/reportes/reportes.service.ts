import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';
import { fechaOpcional } from '../../utils/validar';

const TIPOS = ['DEPOSITO', 'RETIRO', 'TRANSFERENCIA_ENVIADA', 'TRANSFERENCIA_RECIBIDA'];

// Resumen de operaciones por tipo (cantidad y total) más totales generales del banco.
export async function resumen(q: any) {
  const desde = fechaOpcional(q.desde, 'desde'); const hasta = fechaOpcional(q.hasta, 'hasta');
  const where: string[] = []; const params: any[] = [];
  if (desde) { where.push('fecha >= ?'); params.push(desde); }
  if (hasta) { where.push('fecha < DATE_ADD(?, INTERVAL 1 DAY)'); params.push(hasta); }

  const [porTipo] = await pool.query<RowDataPacket[]>(
    `SELECT tipo, COUNT(*) AS cantidad, COALESCE(SUM(monto), 0) AS total FROM movimiento
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''} GROUP BY tipo`, params);
  const [gen] = await pool.query<RowDataPacket[]>(
    `SELECT (SELECT COUNT(*) FROM cliente WHERE estado = 'ACTIVO') AS clientes_activos,
            (SELECT COUNT(*) FROM cuenta WHERE estado = 'ACTIVA') AS cuentas_activas,
            (SELECT COALESCE(SUM(saldo), 0) FROM cuenta) AS saldo_total`);
  return {
    periodo: { desde, hasta },
    operaciones: TIPOS.map(t => {
      const f = porTipo.find(r => r.tipo === t);
      return { tipo: t, cantidad: f ? f.cantidad : 0, total: f ? f.total : 0 };
    }),
    totales: gen[0],
  };
}
