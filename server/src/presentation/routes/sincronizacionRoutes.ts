import { Router } from 'express';
import { sincronizacionController } from '../controllers/sincronizacionController';

const router = Router();

router.post('/terminal', sincronizacionController.sincronizarTerminal);
router.post('/gestor', sincronizacionController.sincronizarGestor);

export default router;