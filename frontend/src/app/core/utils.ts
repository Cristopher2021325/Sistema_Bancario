// Extrae el mensaje de error que devuelve la API (campo "error") o uno genérico si no hay conexión.
export function mensajeError(e: any): string {
  return e?.error?.error || 'No se pudo conectar con el servidor. Verifique que la API esté encendida.';
}

const ETIQUETAS: Record<string, string> = {
  DEPOSITO: 'Depósito', RETIRO: 'Retiro',
  TRANSFERENCIA_ENVIADA: 'Transferencia enviada', TRANSFERENCIA_RECIBIDA: 'Transferencia recibida',
};
export const etiquetaTipo = (t: string) => ETIQUETAS[t] ?? t;
export const TIPOS_MOVIMIENTO = Object.keys(ETIQUETAS);
