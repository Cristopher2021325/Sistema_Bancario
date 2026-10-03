import { Router } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import { soloRol } from '../../middlewares/auth';
import { enteroPositivo } from '../../utils/validar';
import * as svc from './clientes.service';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  res.json(await svc.listar(req.query.buscar as string | undefined));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await svc.obtener(enteroPositivo(req.params.id, 'id')));
}));

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await svc.crear(req.body));
}));

router.put('/:id', soloRol('ADMIN'), asyncHandler(async (req, res) => {
  res.json(await svc.actualizar(enteroPositivo(req.params.id, 'id'), req.body));
}));

router.patch('/:id/desactivar', soloRol('ADMIN'), asyncHandler(async (req, res) => {
  res.json(await svc.desactivar(enteroPositivo(req.params.id, 'id')));
}));

export default router;
