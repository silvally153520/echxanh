import nodemailer from 'nodemailer';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const frontendUrl = config.frontendUrl.replace(/\/$/, '');
  const resetUrl = `${frontendUrl}/reset-password/${encodeURIComponent(token)}`;

  if (!config.email.user || !config.email.pass) {
    if (config.nodeEnv === 'development') {
      console.info(`Password reset link for ${email}: ${resetUrl}`);
      return;
    }
    throw new AppError(503, 'Password reset email is not configured', 'EMAIL_NOT_CONFIGURED');
  }

  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: { user: config.email.user, pass: config.email.pass },
  });

  await transporter.sendMail({
    from: config.email.from,
    to: email,
    subject: 'Đặt lại mật khẩu sieuechxanh',
    text: `Mở liên kết sau để đặt lại mật khẩu (có hiệu lực trong 1 giờ): ${resetUrl}`,
    html: `<p>Bạn vừa yêu cầu đặt lại mật khẩu sieuechxanh.</p><p><a href="${resetUrl}">Đặt lại mật khẩu</a></p><p>Liên kết có hiệu lực trong 1 giờ.</p>`,
  });
};
