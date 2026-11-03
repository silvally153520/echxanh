import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const ResetPassword = () => {
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.resetPassword({ token, password });
      toast.success(data.message);
      navigate('/login');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };
  return <div className="container-main flex min-h-[60vh] items-center justify-center py-12"><Card className="w-full max-w-md" padding="lg"><h1 className="text-2xl font-bold">Đặt lại mật khẩu</h1><form onSubmit={submit} className="mt-6 space-y-4"><Input label="Mật khẩu mới" type="password" minLength={8} required autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /><Input label="Xác nhận mật khẩu" type="password" minLength={8} required autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} /><Button type="submit" className="w-full" isLoading={loading}>Lưu mật khẩu mới</Button></form><Link to="/login" className="mt-5 block text-center text-primary-700">Quay lại đăng nhập</Link></Card></div>;
};
