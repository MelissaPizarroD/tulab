import { Router } from 'express';
import { reporteController } from '../controllers/reporteController';
import { verificarToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', verificarToken, reporteController.obtener);

export default router;