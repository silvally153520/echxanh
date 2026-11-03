import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { bookingsApi } from '../../services/api';
import { EmptyState, formatDate, formatPrice, PageHeader, StatusLabel } from '../shared';

type HostBooking = {
  id: string;
  property: { title: string };
  user: { name: string; email: string };
  guests: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  checkIn: string;
  checkOut: string;
  totalPrice: number;
};

export const HostBookings = () => {
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const load = () => bookingsApi.getHostBookings({ limit: 100 }).then(({ data }) => setBookings(data.bookings || [])).catch(() => toast.error('Không thể tải đơn đặt phòng.'));
  useEffect(() => { load(); }, []);

  const update = async (id: string, action: 'confirm' | 'complete') => {
    try {
      await bookingsApi[action](id);
      toast.success(action === 'confirm' ? 'Đã xác nhận đơn.' : 'Đã hoàn tất đơn.');
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật đơn.');
    }
  };

  return (
    <section className="container-main py-10">
      <PageHeader title="Quản lý đặt phòng" description="Xem yêu cầu và cập nhật trạng thái đơn của khách." />
      {bookings.length ? <div className="space-y-4">{bookings.map(booking => (
        <article key={booking.id} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{booking.property.title}</h2><p className="mt-1 text-sm text-slate-500">{booking.user.name} · {booking.user.email}</p></div><StatusLabel status={booking.status} /></div>
          <p className="mt-4 text-sm text-slate-600">{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} · {booking.guests} khách · {formatPrice(booking.totalPrice)}</p>
          <div className="mt-4 flex gap-2">{booking.status === 'PENDING' && <button type="button" onClick={() => update(booking.id, 'confirm')} className="btn-primary btn-sm">Xác nhận</button>}{booking.status === 'CONFIRMED' && <button type="button" onClick={() => update(booking.id, 'complete')} className="btn-secondary btn-sm">Đánh dấu hoàn tất</button>}</div>
        </article>
      ))}</div> : <EmptyState>Chưa có đơn đặt phòng nào.</EmptyState>}
    </section>
  );
};
