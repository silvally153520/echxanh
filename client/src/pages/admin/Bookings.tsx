import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { formatDate, formatPrice, PageHeader, StatusLabel } from '../shared';

type AdminBooking = { id: string; checkIn: string; checkOut: string; totalPrice: number; status: string; user: { name: string; email: string }; property: { title: string; hostId: string } };
export const AdminBookings = () => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [status, setStatus] = useState('');
  useEffect(() => {
    adminApi.getBookings({ limit: 100, status: status || undefined }).then(({ data }) => setBookings(data.bookings || [])).catch(() => toast.error('Không thể tải đơn đặt phòng.'));
  }, [status]);

  return (
    <section className="container-main py-10">
      <PageHeader title="Quản lý đơn đặt phòng" description="Theo dõi đơn đặt phòng trên toàn hệ thống." />
      <select aria-label="Lọc trạng thái đơn" value={status} onChange={event => setStatus(event.target.value)} className="input mb-5 max-w-xs"><option value="">Tất cả trạng thái</option><option value="PENDING">Chờ xác nhận</option><option value="CONFIRMED">Đã xác nhận</option><option value="CANCELLED">Đã hủy</option><option value="COMPLETED">Hoàn tất</option></select>
      <div className="space-y-3">{bookings.map(booking => <article key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5"><div><h2 className="font-semibold">{booking.property.title}</h2><p className="mt-1 text-sm text-slate-500">{booking.user.name} · {booking.user.email}</p><p className="mt-1 text-sm text-slate-500">{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} · {formatPrice(booking.totalPrice)}</p></div><StatusLabel status={booking.status} /></article>)}</div>
      {!bookings.length && <p className="rounded-xl bg-white p-8 text-center text-slate-500">Không có đơn đặt phòng phù hợp.</p>}
    </section>
  );
};
