import { Router } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import * as svc from './transferencias.service';

const router = Router();
router.post('/', asyncHandler(async (req, res) =>
  res.status(201).json(await svc.transferir(req.usuario!.id, req.body))));
export default router;
