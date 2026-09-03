import { Router } from 'express';
import { validate } from '@middleware/validation.middleware';
import { authenticate } from '@middleware/auth.middleware';
import { authLimiter } from '@middleware/rate-limit.middleware';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  meHandler,
} from './auth.controller';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
} from './auth.validation';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), registerHandler);
router.post('/login', authLimiter, validate(loginSchema), loginHandler);
router.post('/refresh', authLimiter, validate(refreshSchema), refreshHandler);
router.get('/me', authenticate, meHandler);

export default router;
