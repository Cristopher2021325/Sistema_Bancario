import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { unauthorized, forbidden } from '../utils/errors';
import { UsuarioToken } from '../types/express';

// RNF03: solo se accede con sesión iniciada (encabezado Authorization: Bearer <token>).
export function verificarToken(req: Request, _res: Response, next: NextFunction) {
  const cabecera = req.headers.authorization;
  if (!cabecera || !cabecera.startsWith('Bearer ')) return next(unauthorized('Se requiere iniciar sesión'));
  try {
    req.usuario = jwt.verify(cabecera.slice(7), process.env.JWT_SECRET as string) as UsuarioToken;
    next();
  } catch {
    next(unauthorized('Sesión inválida o expirada'));
  }
}

export const soloRol = (...roles: Array<'ADMIN' | 'CAJERO'>) =>
  (req: Request, _res: Response, next: NextFunction) =>
    req.usuario && roles.includes(req.usuario.rol)
      ? next()
      : next(forbidden('No tiene permiso para realizar esta acción'));
