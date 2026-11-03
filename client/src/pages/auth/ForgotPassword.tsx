import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.forgotPassword(email);
      toast.success(data.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi yêu cầu.');
    } finally {
      setLoading(false);
    }
  };
  return <div className="container-main flex min-h-[60vh] items-center justify-center py-12"><Card className="w-full max-w-md" padding="lg"><h1 className="text-2xl font-bold">Quên mật khẩu?</h1><p className="mt-2 text-slate-600">Nhập email tài khoản để nhận hướng dẫn đặt lại mật khẩu.</p><form onSubmit={submit} className="mt-6 space-y-4"><Input label="Email" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} /><Button type="submit" className="w-full" isLoading={loading}>Gửi yêu cầu</Button></form><Link to="/login" className="mt-5 block text-center text-primary-700">Quay lại đăng nhập</Link></Card></div>;
};
