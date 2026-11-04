import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';

export interface AuthRequest extends Request {
  encargado?: {
    id_encargado: number;
    rol: string;
  };
}

export const verificarToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    req.encargado = {
      id_encargado: payload.id_encargado,
      rol: payload.rol
    };
    next();
  } catch {
    res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};