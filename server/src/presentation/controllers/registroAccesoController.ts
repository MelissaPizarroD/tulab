import { Request, Response } from 'express';
import { registroAccesoService } from '../../services/registroAccesoService';

export const registroAccesoController = {

  async registrarEntrada(req: Request, res: Response) {
    try {
      const registro = await registroAccesoService.registrarEntrada(req.body);
      res.status(201).json(registro);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async registrarSalida(req: Request, res: Response) {
    try {
      const registro = await registroAccesoService.registrarSalida(req.body);
      res.json(registro);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async obtenerActivosPorTurno(req: Request, res: Response) {
    try {
      const id_turno = Number(req.params.id_turno);
      const registros = await registroAccesoService.obtenerActivosPorTurno(id_turno);
      res.json(registros);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  }

};