import { describe, expect, it } from 'vitest';
import { supportChatSchema } from '../src/validations/supportChat';

describe('supportChatSchema', () => {
  it('accepts a user message and assistant conversation history', () => {
    const result = supportChatSchema.safeParse({
      body: {
        messages: [
          { role: 'user', content: 'Tôi muốn tìm phòng ở Đà Nẵng' },
          { role: 'assistant', content: 'Bạn muốn đi vào thời gian nào?' },
        ],
      },
    });

    expect(result.success).toBe(true);
  });

  it('rejects empty or oversized conversations', () => {
    expect(supportChatSchema.safeParse({ body: { messages: [] } }).success).toBe(false);
    expect(supportChatSchema.safeParse({
      body: {
        messages: Array.from({ length: 11 }, () => ({ role: 'user', content: 'Xin chào' })),
      },
    }).success).toBe(false);
  });

  it('rejects messages longer than the supported limit', () => {
    expect(supportChatSchema.safeParse({
      body: { messages: [{ role: 'user', content: 'a'.repeat(1001) }] },
    }).success).toBe(false);
  });
});
