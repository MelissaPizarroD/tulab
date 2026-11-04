import dotenv from 'dotenv';
dotenv.config();

const requerida = (nombre: string): string => {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`);
  return valor;
};

export const config = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: requerida('JWT_SECRET'),
  db: {
    host: requerida('DB_HOST'),
    port: Number(requerida('DB_PORT')),
    database: requerida('DB_NAME'),
    user: requerida('DB_USER'),
    password: requerida('DB_PASSWORD'),
  },
};