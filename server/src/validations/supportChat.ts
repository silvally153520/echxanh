import { z } from 'zod';

export const supportChatSchema = z.object({
  body: z.object({
    messages: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().trim().min(1).max(1000),
    })).min(1).max(10),
  }),
});

export type SupportChatMessage = z.infer<typeof supportChatSchema>['body']['messages'][number];
