import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';
import { asyncHandler } from '../../middlewares/errorHandler';

// Catálogo de tipos de cuenta (lo usa el formulario de cuentas del frontend).
const router = Router();
router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT id_tipo_cuenta, nombre, descripcion FROM tipo_cuenta ORDER BY id_tipo_cuenta');
  res.json(rows);
}));
export default router;
