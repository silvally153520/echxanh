import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import type { StatsData } from '../../types';
import { formatPrice, PageHeader, StatusLabel } from '../shared';

type AdminStats = StatsData & {
  recentBookings?: Array<{ id: string; user: { name: string }; property: { title: string }; status: string }>;
  recentUsers?: Array<{ id: string; name: string; email: string; role: string }>;
};

export const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  useEffect(() => {
    adminApi.getStats().then(({ data }) => setStats(data.stats ? { ...data.stats, recentUsers: data.recentUsers, recentBookings: data.recentBookings } : data))
      .catch(() => toast.error('Không thể tải thống kê quản trị.'));
  }, []);

  return (
    <section className="container-main py-10">
      <PageHeader title="Quản trị sieuechxanh" description="Tổng quan hoạt động nền tảng." />
      {!stats ? <p className="py-12 text-center text-slate-500">Đang tải thống kê…</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[['Người dùng', stats.totalUsers], ['Chỗ nghỉ', stats.totalProperties], ['Đơn đặt phòng', stats.totalBookings], ['Doanh thu hoàn tất', formatPrice(stats.totalRevenue)]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}
        </div>
      )}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[['/admin/users', 'Quản lý người dùng'], ['/admin/properties', 'Quản lý chỗ nghỉ'], ['/admin/bookings', 'Quản lý đơn đặt phòng'], ['/admin/analytics', 'Doanh thu & phân tích']].map(([to, label]) => <Link key={to} to={to} className="rounded-xl border border-slate-200 bg-white p-5 font-semibold hover:border-primary-300 hover:text-primary-700">{label} →</Link>)}
      </div>
      {stats?.recentBookings?.length ? <div className="mt-10"><h2 className="mb-4 text-xl font-semibold">Đơn đặt phòng gần đây</h2><div className="space-y-3">{stats.recentBookings.map(booking => <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"><div><p className="font-semibold">{booking.property.title}</p><p className="text-sm text-slate-500">{booking.user.name}</p></div><StatusLabel status={booking.status} /></div>)}</div></div> : null}
    </section>
  );
};
