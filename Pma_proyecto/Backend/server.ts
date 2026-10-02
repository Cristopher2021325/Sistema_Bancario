import dotenv from 'dotenv';
import app from './app';

dotenv.config();
if (!process.env.JWT_SECRET) {
  console.error('Falta JWT_SECRET en el archivo .env');
  process.exit(1);
}
const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => console.log(`API bancaria escuchando en http://localhost:${PORT}`));
