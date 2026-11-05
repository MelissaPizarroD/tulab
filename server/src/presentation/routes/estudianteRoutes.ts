import { Router } from 'express';
import { estudianteController } from '../controllers/estudianteController';

const router = Router();

router.get('/validar/:codigo_estudiantil', estudianteController.validarCodigo);

export default router;