import express from 'express';
import cors from 'cors';
import { pool } from './src/config/db';
import { errorHandler, noEncontrada } from './src/middlewares/errorHandler';
import clientesRoutes from './src/modules/clientes/clientes.routes';
import cuentasRoutes from './src/modules/cuentas/cuentas.routes';
import authRoutes from './src/modules/auth/auth.routes';
import { depositosRoutes, retirosRoutes } from './src/modules/operaciones/operaciones.routes';
import transferenciasRoutes from './src/modules/transferencias/transferencias.routes';
import movimientosRoutes from './src/modules/movimientos/movimientos.routes';
import reportesRoutes from './src/modules/reportes/reportes.routes';
import { verificarToken } from './src/middlewares/auth';

const app = express();
app.use(cors());
app.use(express.json());

// mira que la API y la base de datos responden.
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ api: 'ok', baseDeDatos: 'ok' });
  } catch {
    res.status(500).json({ api: 'ok', baseDeDatos: 'sin conexión' });
  }
});

app.use('/api/auth', authRoutes);                                
app.use('/api/clientes', verificarToken, clientesRoutes);
app.use('/api/cuentas', verificarToken, cuentasRoutes);
app.use('/api/depositos', verificarToken, depositosRoutes);
app.use('/api/retiros', verificarToken, retirosRoutes);
app.use('/api/transferencias', verificarToken, transferenciasRoutes);
app.use('/api/movimientos', verificarToken, movimientosRoutes);
app.use('/api/reportes', verificarToken, reportesRoutes);

app.use(noEncontrada);
app.use(errorHandler);

export default app;
