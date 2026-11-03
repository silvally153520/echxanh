import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingsApi } from '../../services/api';
import type { Booking } from '../../types';
import { formatDate, formatPrice, StatusLabel } from '../shared';

export const BookingDetail = () => {
  const { id = '' } = useParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    bookingsApi.getOne(id).then(({ data }) => setBooking(data.booking))
      .catch(() => toast.error('Không thể tải thông tin đơn đặt phòng.'))
      .finally(() => setLoading(false));
  }, [id]);

  const cancel = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn đặt phòng này?')) return;
    setCancelling(true);
    try {
      const { data } = await bookingsApi.cancel(id);
      setBooking(data.booking);
      toast.success('Đã hủy đơn đặt phòng.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể hủy đơn đặt phòng.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <div className="container-main py-16 text-center">Đang tải thông tin đơn…</div>;
  if (!booking) return <div className="container-main py-16 text-center">Không tìm thấy đơn đặt phòng. <Link className="link" to="/dashboard">Quay lại</Link></div>;

  return (
    <section className="container-main max-w-4xl py-10">
      <Link to="/dashboard" className="text-sm font-medium text-primary-700">← Đơn đặt phòng</Link>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-2xl font-bold">{booking.property.title}</h1><p className="mt-2 text-slate-600">{booking.property.city}, {booking.property.country}</p></div>
          <StatusLabel status={booking.status} />
        </div>
        <dl className="mt-8 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-2">
          <div><dt className="text-sm text-slate-500">Nhận phòng</dt><dd className="mt-1 font-semibold">{formatDate(booking.checkIn)}</dd></div>
          <div><dt className="text-sm text-slate-500">Trả phòng</dt><dd className="mt-1 font-semibold">{formatDate(booking.checkOut)}</dd></div>
          <div><dt className="text-sm text-slate-500">Số khách</dt><dd className="mt-1 font-semibold">{booking.guests}</dd></div>
          <div><dt className="text-sm text-slate-500">Tổng tiền</dt><dd className="mt-1 font-semibold text-primary-700">{formatPrice(booking.totalPrice)}</dd></div>
          <div><dt className="text-sm text-slate-500">Mã đơn</dt><dd className="mt-1 break-all font-mono text-sm">{booking.id}</dd></div>
          <div><dt className="text-sm text-slate-500">Host</dt><dd className="mt-1 font-semibold">{booking.property.host?.name || 'Host sieuechxanh'}</dd></div>
        </dl>
        {booking.status === 'PENDING' || booking.status === 'CONFIRMED' ? (
          <button type="button" onClick={cancel} disabled={cancelling} className="btn-danger mt-8">{cancelling ? 'Đang hủy…' : 'Hủy đặt phòng'}</button>
        ) : null}
      </div>
    </section>
  );
};
