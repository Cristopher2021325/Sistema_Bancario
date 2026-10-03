export interface UsuarioToken { id: number; username: string; rol: 'ADMIN' | 'CAJERO'; }
declare global {
  namespace Express {
    interface Request { usuario?: UsuarioToken; }
  }
}
