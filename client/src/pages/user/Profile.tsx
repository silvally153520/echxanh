import { FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../shared';

export const Profile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user]);

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name, phone });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await authApi.changePassword({ currentPassword, newPassword });
      toast.success(data.message);
      setCurrentPassword('');
      setNewPassword('');
      await refreshUser();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đổi mật khẩu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="container-main max-w-3xl py-10">
      <PageHeader title="Thông tin cá nhân" description="Cập nhật thông tin tài khoản sieuechxanh." />
      <form onSubmit={saveProfile} className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <Input label="Họ và tên" value={name} onChange={event => setName(event.target.value)} minLength={2} required />
        <Input label="Email" value={user?.email || ''} disabled />
        <Input label="Số điện thoại" value={phone} onChange={event => setPhone(event.target.value)} />
        <Button type="submit" isLoading={saving}>Lưu thông tin</Button>
      </form>
      <form onSubmit={changePassword} className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
        <Input label="Mật khẩu hiện tại" type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required />
        <Input label="Mật khẩu mới" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={event => setNewPassword(event.target.value)} required />
        <Button type="submit" variant="secondary" isLoading={saving}>Đổi mật khẩu</Button>
      </form>
    </section>
  );
};
