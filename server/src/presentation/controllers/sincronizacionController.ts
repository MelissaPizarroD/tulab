import { Request, Response } from 'express';
import { registroAccesoService } from '../../services/registroAccesoService';
import { sesionEquipoService } from '../../services/sesionEquipoService';

export const sincronizacionController = {

  async sincronizarTerminal(req: Request, res: Response) {
    try {
      const { registros } = req.body;
      const resultados = [];

      for (const registro of registros) {
        try {
          const resultado = await registroAccesoService.registrarEntrada({
            codigo: registro.codigo,
            id_dispositivo: registro.id_dispositivo,
            origen_registro: registro.origen_registro
          });
          resultados.push({ exito: true, id_local: registro.id_local, registro: resultado });
        } catch (error: any) {
          resultados.push({ exito: false, id_local: registro.id_local, mensaje: error.message });
        }
      }

      res.json({ resultados });
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  },

  async sincronizarGestor(req: Request, res: Response) {
    try {
      const { sesiones } = req.body;
      const resultados = [];

      for (const sesion of sesiones) {
        try {
          const resultado = await sesionEquipoService.iniciarSesion({
            codigo: sesion.codigo,
            id_equipo: sesion.id_equipo,
            id_dispositivo: sesion.id_dispositivo
          });
          resultados.push({ exito: true, id_local: sesion.id_local, sesion: resultado });
        } catch (error: any) {
          resultados.push({ exito: false, id_local: sesion.id_local, mensaje: error.message });
        }
      }

      res.json({ resultados });
    } catch (error: any) {
      res.status(500).json({ mensaje: error.message });
    }
  }

};