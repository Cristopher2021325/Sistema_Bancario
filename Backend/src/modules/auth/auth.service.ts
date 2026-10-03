import { RowDataPacket } from 'mysql2';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db';
import { unauthorized } from '../../utils/errors';
import { textoRequerido } from '../../utils/validar';

export async function login(body: any) {
  const username = textoRequerido(body.username, 'username', 30);
  const password = textoRequerido(body.password, 'password', 100);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id_usuario, username, password_hash, nombre, rol FROM usuario WHERE username = ? AND estado = 'ACTIVO'`,
    [username]);
  const u = rows[0];
  // Mismo mensaje si el usuario no existe o la clave es incorrecta (no revela cuál falló).
  if (!u || !(await bcrypt.compare(password, u.password_hash))) throw unauthorized('Credenciales inválidas');

  const token = jwt.sign({ id: u.id_usuario, username: u.username, rol: u.rol },
    process.env.JWT_SECRET as string, { expiresIn: '8h' });
  return { token, usuario: { id: u.id_usuario, username: u.username, nombre: u.nombre, rol: u.rol } };
}
