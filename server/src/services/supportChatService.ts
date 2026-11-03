import { z } from 'zod';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';
import type { SupportChatMessage } from '../validations/supportChat';

const completionSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.string().nullable(),
    }),
  })).min(1),
});

const systemPrompt = `Bạn là trợ lý hỗ trợ khách hàng của sieuechxanh, một nền tảng tìm và đặt chỗ nghỉ tại Việt Nam.
Trả lời bằng tiếng Việt tự nhiên, thân thiện, ngắn gọn và tập trung vào việc hỗ trợ tìm phòng, cách đặt phòng, tài khoản và đơn đặt phòng.
Bạn không thể truy cập dữ liệu tài khoản, tình trạng phòng theo thời gian thực, đơn đặt phòng, giao dịch hoặc chính sách riêng của từng chỗ nghỉ. Không bao giờ khẳng định đã kiểm tra, thay đổi hoặc hủy đơn; hướng dẫn khách đăng nhập để xem đơn tại /dashboard.
Hướng dẫn khách tìm chỗ nghỉ tại /properties. Với câu hỏi cần nhân viên hoặc thông tin không có trong ngữ cảnh, nói rõ bạn không có dữ liệu đó và khuyến khích liên hệ kênh hỗ trợ chính thức trên trang web. Không bịa số điện thoại, địa chỉ email, giá, chính sách hay thông tin chỗ nghỉ.
Không yêu cầu hoặc lặp lại mật khẩu, mã xác thực, thông tin thẻ hay dữ liệu nhạy cảm. Nếu được hỏi, nhắc khách không gửi các thông tin này trong chat.`;

export const createSupportReply = async (messages: SupportChatMessage[]): Promise<string> => {
  if (!config.ai.openRouterApiKey) {
    throw new AppError(503, 'Trợ lý AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.', 'AI_NOT_CONFIGURED');
  }

  let response: Response;
  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.ai.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': config.frontendUrl,
        'X-Title': 'sieuechxanh',
      },
      body: JSON.stringify({
        model: config.ai.openRouterModel,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: 350,
        temperature: 0.5,
      }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch (error) {
    console.error('Support AI request failed:', error);
    throw new AppError(502, 'Trợ lý AI hiện không kết nối được. Vui lòng thử lại sau.', 'AI_UNAVAILABLE');
  }

  if (!response.ok) {
    console.error(`Support AI provider returned HTTP ${response.status}`);
    throw new AppError(502, 'Trợ lý AI hiện gặp sự cố. Vui lòng thử lại sau.', 'AI_PROVIDER_ERROR');
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    console.error('Support AI provider returned invalid JSON:', error);
    throw new AppError(502, 'Trợ lý AI trả về dữ liệu không hợp lệ. Vui lòng thử lại.', 'AI_INVALID_RESPONSE');
  }

  const result = completionSchema.safeParse(payload);
  const reply = result.success ? result.data.choices[0].message.content?.trim() : '';
  if (!reply) {
    console.error('Support AI provider returned an invalid or empty response.');
    throw new AppError(502, 'Trợ lý AI chưa tạo được câu trả lời. Vui lòng thử lại.', 'AI_INVALID_RESPONSE');
  }

  return reply;
};
