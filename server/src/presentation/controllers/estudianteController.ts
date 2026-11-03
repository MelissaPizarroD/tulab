import { Request, Response } from 'express';
import { estudianteService } from '../../services/estudianteService';
import { visitanteRepository } from '../../infrastructure/repositories/visitanteRepository';

export const estudianteController = {

  async validarCodigo(req: Request, res: Response) {
    try {
      const codigo_estudiantil = req.params.codigo_estudiantil as string;
      const estudiante = await estudianteService.validarCodigo(codigo_estudiantil);
      res.json(estudiante);
    } catch (error: any) {
      res.status(404).json({ mensaje: error.message });
    }
  },

  async registrarVisitante(req: Request, res: Response) {
    try {
      const visitante = await estudianteService.registrarVisitante(req.body);
      res.status(201).json(visitante);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async validarCodigoTemporal(req: Request, res: Response) {
    try {
      const codigo = req.params.codigo as string;
      const visitante = await estudianteService.validarCodigoTemporal(codigo);
      res.json(visitante);
    } catch (error: any) {
      res.status(404).json({ mensaje: error.message });
    }
  },

    async actualizarExpiracion(req: Request, res: Response) {
    try {
      const id_visitante = Number(req.params.id);
      const { timestamp_expiracion } = req.body;
      const visitante = await estudianteService.actualizarExpiracionVisitante(id_visitante, timestamp_expiracion);
      res.json(visitante);
    } catch (error: any) {
      res.status(400).json({ mensaje: error.message });
    }
  },

  async obtenerVisitantesActivosPorTurno(req: Request, res: Response) {
    try {
      const visitantes = await visitanteRepository.obtenerVigentes();
      res.json(visitantes);
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  }

};