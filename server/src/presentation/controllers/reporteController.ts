import { Request, Response } from 'express';
import { reporteService } from '../../services/reporteService';

export const reporteController = {

  async obtener(req: Request, res: Response) {
    try {
      const { desde, hasta } = req.query;
      const datos = await reporteService.obtenerDatos(desde as string, hasta as string);
      res.json(datos);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  }

};