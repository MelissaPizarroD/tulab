import { Request, Response } from 'express';
import { authService } from '../../services/authService';

export const authController = {

  async login(req: Request, res: Response) {
    try {
      const { codigo_identificacion, contrasena } = req.body;
      if (!codigo_identificacion || !contrasena) {
        return res.status(400).json({ mensaje: 'Código y contraseña requeridos' });
      }
      const resultado = await authService.login(codigo_identificacion, contrasena);
      res.json(resultado);
    } catch (error: any) {
      res.status(401).json({ mensaje: error.message });
    }
  }

};