import { Request, Response } from 'express';
import { visitanteService } from '../../services/visitanteService';

export const visitanteController = {

  async registrar(req: Request, res: Response) {
    try {
      const visitante = await visitanteService.registrar(req.body);
      res.status(201).json(visitante);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async validarCodigoTemporal(req: Request, res: Response) {
    try {
      const codigo = req.params.codigo as string;
      const visitante = await visitanteService.validarCodigoTemporal(codigo);
      res.json(visitante);
    } catch (error: any) {
      res.status(404).json({ mensaje: error.message });
    }
  },

  async actualizarExpiracion(req: Request, res: Response) {
    try {
      const id_visitante = Number(req.params.id);
      const { timestamp_expiracion } = req.body;
      const visitante = await visitanteService.actualizarExpiracion(id_visitante, timestamp_expiracion);
      res.json(visitante);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async obtenerVigentes(req: Request, res: Response) {
    try {
      const visitantes = await visitanteService.obtenerVigentes();
      res.json(visitantes);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  }

};