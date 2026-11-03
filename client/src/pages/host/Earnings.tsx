import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { bookingsApi } from '../../services/api';
import { EmptyState, formatDate, formatPrice, PageHeader } from '../shared';

type EarningsData = {
  totalEarnings: number;
  totalBookings: number;
  averagePerBooking: number;
  bookings: Array<{ id: string; propertyTitle: string; checkIn: string; checkOut: string; totalPrice: number }>;
};

export const HostEarnings = () => {
  const [data, setData] = useState<EarningsData | null>(null);
  useEffect(() => {
    bookingsApi.getHostEarnings().then(({ data: result }) => setData(result))
      .catch(() => toast.error('Không thể tải báo cáo doanh thu.'));
  }, []);

  return (
    <section className="container-main py-10">
      <PageHeader title="Doanh thu Host" description="Tổng hợp các đơn đã hoàn tất." />
      {!data ? <p className="py-10 text-center text-slate-500">Đang tải doanh thu…</p> : <>
        <div className="grid gap-4 sm:grid-cols-3">
          {[[ 'Tổng doanh thu', formatPrice(data.totalEarnings) ], [ 'Đơn hoàn tất', data.totalBookings ], [ 'Trung bình mỗi đơn', formatPrice(data.averagePerBooking) ]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}
        </div>
        <h2 className="mb-4 mt-10 text-xl font-semibold">Đơn đã hoàn tất</h2>
        {data.bookings.length ? <div className="space-y-3">{data.bookings.map(booking => <div key={booking.id} className="flex flex-wrap justify-between gap-2 rounded-xl border border-slate-200 bg-white p-4"><div><p className="font-medium">{booking.propertyTitle}</p><p className="text-sm text-slate-500">{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}</p></div><strong>{formatPrice(booking.totalPrice)}</strong></div>)}</div> : <EmptyState>Chưa có doanh thu ghi nhận.</EmptyState>}
      </>}
    </section>
  );
};
