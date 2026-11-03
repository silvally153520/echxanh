import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingsApi, propertiesApi } from '../../services/api';
import { formatPrice, PageHeader, StatusLabel } from '../shared';

type HostProperty = { id: string };
type HostBooking = {
  id: string;
  property: { title: string };
  user: { name: string };
  guests: number;
  status: string;
};

export const HostDashboard = () => {
  const [properties, setProperties] = useState<HostProperty[]>([]);
  const [bookings, setBookings] = useState<HostBooking[]>([]);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    Promise.all([propertiesApi.getHostProperties({ limit: 100 }), bookingsApi.getHostBookings({ limit: 10 }), bookingsApi.getHostEarnings()])
      .then(([propertyResponse, bookingResponse, earningsResponse]) => {
        setProperties(propertyResponse.data.properties || []);
        setBookings(bookingResponse.data.bookings || []);
        setEarnings(earningsResponse.data.totalEarnings || 0);
      })
      .catch(() => toast.error('Không thể tải dữ liệu Host.'));
  }, []);

  return (
    <section className="container-main py-10">
      <PageHeader title="Khu vực Host" description="Quản lý chỗ nghỉ, đặt phòng và doanh thu của bạn." action={<Link to="/host/properties/new" className="btn-primary">+ Đăng chỗ nghỉ</Link>} />
      <div className="grid gap-4 sm:grid-cols-3">
        {[['Chỗ nghỉ', properties.length], ['Đơn đặt phòng gần đây', bookings.length], ['Tổng doanh thu', formatPrice(earnings)]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p></div>)}
      </div>
      <div className="mt-10 flex items-center justify-between"><h2 className="text-xl font-semibold">Đơn đặt phòng mới</h2><Link to="/host/bookings" className="text-primary-700">Quản lý đơn →</Link></div>
      <div className="mt-4 space-y-3">
        {bookings.length ? bookings.slice(0, 5).map(booking => <div key={booking.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"><div><p className="font-semibold">{booking.property.title}</p><p className="text-sm text-slate-500">{booking.user.name} · {booking.guests} khách</p></div><StatusLabel status={booking.status} /></div>) : <p className="rounded-xl bg-white p-6 text-slate-500">Chưa có đơn đặt phòng.</p>}
      </div>
      <div className="mt-8 flex flex-wrap gap-3"><Link to="/host/properties" className="btn-secondary">Quản lý chỗ nghỉ</Link><Link to="/host/earnings" className="btn-secondary">Xem doanh thu</Link></div>
    </section>
  );
};
