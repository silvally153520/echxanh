import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { PageHeader } from '../shared';

type ManagedUser = { id: string; name: string; email: string; role: 'USER' | 'HOST' | 'ADMIN'; isBanned: boolean; _count: { properties: number; bookings: number } };

export const AdminUsers = () => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState('');
  const load = useCallback(() => adminApi.getUsers({ limit: 100, search: search || undefined }).then(({ data }) => setUsers(data.users || [])).catch(() => toast.error('Không thể tải người dùng.')), [search]);
  useEffect(() => { load(); }, [load]);

  const changeRole = async (user: ManagedUser, role: string) => {
    try {
      await adminApi.updateUserRole(user.id, role);
      toast.success('Đã cập nhật vai trò.');
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật vai trò.');
    }
  };
  const toggleBan = async (user: ManagedUser) => {
    try {
      await adminApi.toggleUserBan(user.id);
      toast.success(user.isBanned ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.');
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể đổi trạng thái tài khoản.');
    }
  };

  return (
    <section className="container-main py-10">
      <PageHeader title="Quản lý người dùng" description="Tìm tài khoản, thay đổi vai trò hoặc khóa/mở khóa." />
      <input className="input mb-5 max-w-md" value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc email" aria-label="Tìm người dùng" />
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Người dùng</th><th className="p-4">Vai trò</th><th className="p-4">Chỗ nghỉ / đơn</th><th className="p-4">Trạng thái</th><th className="p-4">Thao tác</th></tr></thead>
          <tbody>{users.map(user => <tr key={user.id} className="border-t border-slate-100"><td className="p-4"><p className="font-medium">{user.name}</p><p className="text-slate-500">{user.email}</p></td><td className="p-4"><select aria-label={`Vai trò của ${user.name}`} value={user.role} onChange={event => changeRole(user, event.target.value)} className="rounded border border-slate-300 p-2"><option value="USER">USER</option><option value="HOST">HOST</option><option value="ADMIN">ADMIN</option></select></td><td className="p-4">{user._count.properties} / {user._count.bookings}</td><td className="p-4">{user.isBanned ? 'Đã khóa' : 'Hoạt động'}</td><td className="p-4"><button type="button" onClick={() => toggleBan(user)} className={user.isBanned ? 'btn-secondary btn-sm' : 'btn-danger btn-sm'}>{user.isBanned ? 'Mở khóa' : 'Khóa'}</button></td></tr>)}</tbody>
        </table>
        {!users.length && <p className="p-8 text-center text-slate-500">Không có người dùng phù hợp.</p>}
      </div>
    </section>
  );
};
