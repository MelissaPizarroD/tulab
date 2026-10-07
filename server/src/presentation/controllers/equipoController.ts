import { Request, Response } from 'express';
import { equipoRepository } from '../../infrastructure/repositories/equipoRepository';

export const equipoController = {

  async obtenerTodos(req: Request, res: Response) {
    try {
      const equipos = await equipoRepository.obtenerTodos();
      res.json(equipos);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  },

  async crear(req: Request, res: Response) {
    try {
      const equipo = await equipoRepository.crear(req.body);
      res.status(201).json(equipo);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async actualizarEstado(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { estado } = req.body;
      const equipo = await equipoRepository.actualizarEstado(id, estado);
      res.json(equipo);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  }

};