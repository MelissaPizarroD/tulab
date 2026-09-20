import { Response } from 'express';
import { configuracionService } from '../../services/configuracionService';
import { AuthRequest } from '../middlewares/authMiddleware';

export const configuracionController = {

  async obtenerTodas(req: AuthRequest, res: Response) {
    try {
      const configuraciones = await configuracionService.obtenerTodas();
      res.json(configuraciones);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  },

  async actualizar(req: AuthRequest, res: Response) {
    try {
      const clave = req.params.clave as string;
      const { valor } = req.body;
      const config = await configuracionService.actualizar(
        clave,
        valor,
        req.encargado!.id_encargado
      );
      res.json(config);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  }

};