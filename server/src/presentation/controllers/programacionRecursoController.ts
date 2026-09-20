import { Request, Response } from 'express';
import { programacionRecursoService } from '../../services/programacionRecursoService';

export const programacionRecursoController = {

  async programar(req: Request, res: Response) {
    try {
      const programacion = await programacionRecursoService.programar(req.body);
      res.status(201).json(programacion);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async actualizarEstado(req: Request, res: Response) {
    try {
      const id_programacion = Number(req.params.id);
      const { estado } = req.body;
      const programacion = await programacionRecursoService.actualizarEstado(id_programacion, estado);
      res.json(programacion);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async obtenerPorTurno(req: Request, res: Response) {
    try {
      const id_turno = Number(req.params.id_turno);
      const programaciones = await programacionRecursoService.obtenerPorTurno(id_turno);
      res.json(programaciones);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  }

};