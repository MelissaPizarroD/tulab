import { Request, Response } from 'express';
import { dispositivoService } from '../../services/dispositivoService';

export const dispositivoController = {

  async registrar(req: Request, res: Response) {
    try {
      const ip = req.ip || req.socket.remoteAddress || '';
      const dispositivo = await dispositivoService.registrar({
        ...req.body,
        direccion_ip: ip
      });
      res.status(201).json(dispositivo);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async heartbeat(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const dispositivo = await dispositivoService.heartbeat(Number(id));
      res.json(dispositivo);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async obtenerTodos(req: Request, res: Response) {
    try {
      const dispositivos = await dispositivoService.obtenerTodos();
      res.json(dispositivos);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  }

};