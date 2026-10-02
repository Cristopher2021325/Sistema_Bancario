import { Router } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import * as svc from './reportes.service';

const router = Router();
router.get('/resumen', asyncHandler(async (req, res) => res.json(await svc.resumen(req.query))));
export default router;
