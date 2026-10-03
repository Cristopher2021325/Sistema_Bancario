import { Router } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import * as svc from './operaciones.service';

export const depositosRoutes = Router();
depositosRoutes.post('/', asyncHandler(async (req, res) =>
  res.status(201).json(await svc.depositar(req.usuario!.id, req.body))));

export const retirosRoutes = Router();
retirosRoutes.post('/', asyncHandler(async (req, res) =>
  res.status(201).json(await svc.retirar(req.usuario!.id, req.body))));
