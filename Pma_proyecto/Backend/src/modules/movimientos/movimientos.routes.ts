import { Router } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import { enteroPositivo } from '../../utils/validar';
import * as svc from './movimientos.service';

const router = Router();
router.get('/', asyncHandler(async (req, res) => res.json(await svc.listar(req.query))));
router.get('/cuenta/:id', asyncHandler(async (req, res) =>
  res.json(await svc.porCuenta(enteroPositivo(req.params.id, 'id'), req.query))));
router.post('/', asyncHandler(async (req, res) =>
  res.status(201).json(await svc.registrar(req.usuario!.id, req.body))));
export default router;
