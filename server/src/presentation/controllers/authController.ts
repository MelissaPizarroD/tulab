import { Request, Response } from 'express';
import { authService } from '../../services/authService';
import { intentoLoginRepository } from '../../infrastructure/repositories/intentoLoginRepository';
import { obtenerIp } from '../utils/obtenerIp';

export const authController = {

  async login(req: Request, res: Response) {
    const { codigo_identificacion, contrasena } = req.body;
    if (!codigo_identificacion || !contrasena) {
      return res.status(400).json({ mensaje: 'Código y contraseña requeridos' });
    }

    try {
      const resultado = await authService.login(codigo_identificacion, contrasena);
      res.json(resultado);
    } catch (error: any) {
      // Se guarda fecha, código usado e IP. Nunca la contraseña.
      await intentoLoginRepository
        .registrar(String(codigo_identificacion), obtenerIp(req))
        .catch((e) => console.error('No se pudo registrar el intento fallido:', e));
      res.status(401).json({ mensaje: error.message });
    }
  }

};