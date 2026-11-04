import { Response } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import type { AuthRequest } from '../middleware/auth';
import { supportChatSchema } from '../validations/supportChat';
import { createSupportReply } from '../services/supportChatService';

export const chat = asyncHandler(async (req: AuthRequest, res: Response) => {
  const parsed = supportChatSchema.shape.body.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'Validation error', 'VALIDATION_ERROR', parsed.error.issues);
  }

  const reply = await createSupportReply(parsed.data.messages);
  res.json({ reply });
});
