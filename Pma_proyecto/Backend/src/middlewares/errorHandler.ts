import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

// Envuelve controladores async para que sus errores lleguen al manejador central.
export const asyncHandler =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res).catch(next);

export function noEncontrada(_req: Request, res: Response) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}
