import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingsApi } from '../../services/api';
import type { Booking } from '../../types';
import { BookingCard, EmptyState, PageHeader } from '../shared';

export const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsApi.getMyBookings({ limit: 50 }).then(({ data }) => setBookings(data.bookings || []))
      .catch(() => toast.error('Không thể tải đơn đặt phòng.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="container-main py-10">
      <PageHeader title="Đơn đặt phòng của tôi" description="Theo dõi các chuyến đi sắp tới và lịch sử đặt phòng." />
      {loading ? <p className="py-12 text-center text-slate-500">Đang tải đơn đặt phòng…</p> : bookings.length ? (
        <div className="space-y-4">{bookings.map(booking => <BookingCard key={booking.id} booking={booking} />)}</div>
      ) : <EmptyState>Bạn chưa có đơn đặt phòng nào. <Link className="ml-1 font-semibold text-primary-700" to="/properties">Khám phá chỗ nghỉ</Link></EmptyState>}
    </section>
  );
};
