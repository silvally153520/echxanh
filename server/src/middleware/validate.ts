import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';
import { AppError } from '../middleware/errorHandler';

export const validate = (schema: ZodType<{ body?: unknown; query?: unknown; params?: unknown; cookies?: unknown }>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      if (parsed.body) req.body = parsed.body;
      if (parsed.params) {
        Object.defineProperty(req, 'params', {
          configurable: true,
          enumerable: true,
          value: parsed.params,
        });
      }
      if (parsed.cookies) req.cookies = parsed.cookies;
      if (parsed.query) {
        Object.defineProperty(req, 'query', {
          configurable: true,
          enumerable: true,
          value: parsed.query,
        });
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(400, 'Validation error', 'VALIDATION_ERROR', error.issues);
      }
      next(error);
    }
  };