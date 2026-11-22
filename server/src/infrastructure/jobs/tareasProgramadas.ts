import { dispositivoService } from '../../services/dispositivoService';
import { visitanteService } from '../../services/visitanteService';

const ejecutar = (nombre: string, tarea: () => Promise<void>, cadaMs: number) => {
  setInterval(async () => {
    try {
      await tarea();
    } catch (error) {
      console.error(`Error en la tarea "${nombre}":`, error);
    }
  }, cadaMs);
};

export const iniciarTareasProgramadas = () => {
  ejecutar('marcar dispositivos desconectados', () => dispositivoService.marcarDesconectados(), 30000);
  ejecutar('expirar visitantes vencidos', () => visitanteService.expirarVisitantesVencidos(), 60000);
};