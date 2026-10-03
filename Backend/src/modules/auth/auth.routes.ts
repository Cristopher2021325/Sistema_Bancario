import { Router } from 'express';
import { asyncHandler } from '../../middlewares/errorHandler';
import * as svc from './auth.service';

const router = Router();
router.post('/login', asyncHandler(async (req, res) => res.json(await svc.login(req.body))));
export default router;
