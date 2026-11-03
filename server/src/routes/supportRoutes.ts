import { Router } from 'express';
import { chat } from '../controllers/supportController';

const router = Router();

router.post('/chat', chat);

export default router;
