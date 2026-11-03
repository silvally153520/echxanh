import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertiesApi, bookingsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Property } from '../types';
import { formatPrice } from './shared';

export const PropertyDetail = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    propertiesApi.getOne(id).then(({ data }) => setProperty(data.property)).catch(() => toast.error('Không tìm thấy chỗ nghỉ.')).finally(() => setLoading(false));
  }, [id]);

  const submitBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/properties/${id}` } });
      return;
    }
    if (!checkIn || !checkOut || new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Vui lòng chọn ngày trả phòng sau ngày nhận phòng.');
      return;
    }
    setBooking(true);
    try {
      const { data } = await bookingsApi.create({
        propertyId: id,
        checkIn: new Date(`${checkIn}T00:00:00.000Z`).toISOString(),
        checkOut: new Date(`${checkOut}T00:00:00.000Z`).toISOString(),
        guests,
      });
      toast.success('Đã gửi yêu cầu đặt phòng.');
      navigate(`/dashboard/bookings/${data.booking.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo đơn đặt phòng.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="container-main py-16 text-center">Đang tải thông tin…</div>;
  if (!property) return <div className="container-main py-16 text-center">Không tìm thấy chỗ nghỉ. <Link className="link" to="/properties">Quay lại tìm kiếm</Link></div>;

  return (
    <section className="container-main py-10">
      <Link to="/properties" className="mb-5 inline-block text-sm font-medium text-primary-700">← Tất cả chỗ nghỉ</Link>
      <h1 className="text-3xl font-bold text-slate-900">{property.title}</h1>
      <p className="mt-2 text-slate-600">{property.address}, {property.city}, {property.country}</p>
      <div className="mt-6 grid gap-3 overflow-hidden rounded-2xl sm:grid-cols-2">
        {(property.images?.length ? property.images : ['']).slice(0, 5).map((image, index) => (
          <div key={`${image}-${index}`} className={`${index === 0 ? 'sm:row-span-2' : ''} aspect-[4/3] bg-slate-100`}>
            {image ? <img src={image} alt={`${property.title} ${index + 1}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">Chưa có hình ảnh</div>}
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="text-xl font-semibold">Toàn bộ chỗ nghỉ của host</h2>
          <p className="mt-3 text-slate-600">{property.maxGuests} khách · {property.bedrooms} phòng ngủ · {property.bathrooms} phòng tắm</p>
          <p className="mt-6 whitespace-pre-line leading-7 text-slate-700">{property.description}</p>
          <h3 className="mt-8 font-semibold">Tiện nghi</h3>
          {property.amenities?.length ? <ul className="mt-3 flex flex-wrap gap-2">{property.amenities.map(item => <li key={item} className="rounded-full bg-slate-100 px-3 py-1 text-sm">{item}</li>)}</ul> : <p className="mt-2 text-slate-500">Host chưa cập nhật tiện nghi.</p>}
        </div>
        <form onSubmit={submitBooking} className="h-fit rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xl font-bold text-primary-700">{formatPrice(property.pricePerNight)} <span className="text-sm font-normal text-slate-500">/ đêm</span></p>
          <label className="mt-5 block text-sm font-medium">Ngày nhận phòng<input type="date" min={new Date().toISOString().slice(0, 10)} value={checkIn} onChange={event => setCheckIn(event.target.value)} required className="input mt-1" /></label>
          <label className="mt-4 block text-sm font-medium">Ngày trả phòng<input type="date" min={checkIn || new Date().toISOString().slice(0, 10)} value={checkOut} onChange={event => setCheckOut(event.target.value)} required className="input mt-1" /></label>
          <label className="mt-4 block text-sm font-medium">Số khách<input type="number" min={1} max={property.maxGuests} value={guests} onChange={event => setGuests(Number(event.target.value))} required className="input mt-1" /></label>
          <button type="submit" disabled={booking} className="btn-primary mt-6 w-full">{booking ? 'Đang gửi yêu cầu…' : 'Đặt phòng'}</button>
          <p className="mt-3 text-center text-xs text-slate-500">Đơn đặt phòng sẽ ở trạng thái chờ host xác nhận.</p>
        </form>
      </div>
    </section>
  );
};
