import { badRequest } from './errors';

export function textoRequerido(valor: unknown, campo: string, max = 100): string {
  if (typeof valor !== 'string' || valor.trim() === '') throw badRequest(`El campo "${campo}" es obligatorio`);
  const v = valor.trim();
  if (v.length > max) throw badRequest(`El campo "${campo}" no puede superar ${max} caracteres`);
  return v;
}

export function textoOpcional(valor: unknown, campo: string, max = 100): string | null {
  if (valor === undefined || valor === null || valor === '') return null;
  return textoRequerido(valor, campo, max);
}

export function correoOpcional(valor: unknown): string | null {
  const v = textoOpcional(valor, 'correo');
  if (v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) throw badRequest('El correo no tiene un formato válido');
  return v;
}

export function enteroPositivo(valor: unknown, campo: string): number {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw badRequest(`El campo "${campo}" debe ser un entero mayor que cero`);
  return n;
}

// RN03 y RN04: el monto debe ser un número mayor que cero, con máximo 2 decimales.
export function montoPositivo(valor: unknown, campo = 'monto'): number {
  const n = typeof valor === 'string' && valor.trim() !== '' ? Number(valor) : valor;
  if (typeof n !== 'number' || !Number.isFinite(n) || n <= 0) throw badRequest(`El campo "${campo}" debe ser un número mayor que cero`);
  if (Number(n.toFixed(2)) !== n) throw badRequest(`El campo "${campo}" admite máximo 2 decimales`);
  if (n > 9999999999.99) throw badRequest(`El campo "${campo}" es demasiado grande`);
  return n;
}

export function fechaOpcional(valor: unknown, campo: string): string | null {
  if (valor === undefined || valor === null || valor === '') return null;
  if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor) || isNaN(Date.parse(valor)))
    throw badRequest(`El campo "${campo}" debe tener formato AAAA-MM-DD`);
  return valor;
}
