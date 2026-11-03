import { FormEvent, useEffect, useState } from 'react';
import { CalendarDays, CreditCard, Headphones, MapPin, Search, ShieldCheck, Star, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertiesApi } from '../services/api';
import type { Property } from '../types';
import { PropertyCard } from './shared';

const popularDestinations = ['Đà Nẵng', 'Hà Nội', 'Phú Quốc', 'Nha Trang', 'Đà Lạt'];

const getDateValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const Home = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState(() => getDateValue(new Date()));
  const [checkOut, setCheckOut] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return getDateValue(tomorrow);
  });
  const [guests, setGuests] = useState(2);
  const navigate = useNavigate();

  useEffect(() => {
    propertiesApi.getAll({ limit: 6 }).then(({ data }) => {
      setProperties(data.properties || []);
    }).catch(() => toast.error('Không thể tải danh sách chỗ nghỉ.'));
  }, []);

  const searchProperties = (event: FormEvent) => {
    event.preventDefault();
    if (checkOut <= checkIn) {
      toast.error('Ngày trả phòng phải sau ngày nhận phòng.');
      return;
    }

    const params = new URLSearchParams({
      checkIn: new Date(`${checkIn}T00:00:00.000Z`).toISOString(),
      checkOut: new Date(`${checkOut}T00:00:00.000Z`).toISOString(),
      guests: String(guests),
    });
    const trimmedDestination = destination.normalize('NFC').trim();
    if (trimmedDestination) params.set('city', trimmedDestination);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <>
      <section
        className="relative flex min-h-[635px] items-center justify-center overflow-hidden bg-slate-800 bg-cover bg-center px-4 pb-14 pt-28 text-white sm:px-6 lg:px-8"
        style={{ backgroundImage: "linear-gradient(180deg, rgba(10, 28, 48, .58) 0%, rgba(10, 28, 48, .42) 48%, rgba(8, 24, 31, .68) 100%), url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2400&q=85')" }}
      >
        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white shadow-sm backdrop-blur">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            Hơn 2 triệu đánh giá tích cực
          </div>
          <h1 className="mx-auto mt-5 max-w-4xl font-serif text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            Khám phá điểm đến
            <br />
            <span className="text-sky-400">trong mơ</span> của bạn
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
            Hàng nghìn khách sạn, resort cao cấp trên khắp Việt Nam — đặt phòng dễ dàng, giá tốt nhất.
          </p>

          <form onSubmit={searchProperties} className="mx-auto mt-10 grid max-w-5xl gap-2 rounded-2xl bg-white p-3 text-left shadow-2xl md:grid-cols-[1.2fr_1fr_1fr_0.9fr_auto] md:gap-2">
            <label className="flex min-w-0 flex-col justify-center rounded-xl bg-slate-50 px-4 py-3 transition focus-within:ring-2 focus-within:ring-sky-500">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Điểm đến
              </span>
              <input
                value={destination}
                onChange={event => setDestination(event.target.value)}
                placeholder="Tìm điểm đến..."
                aria-label="Điểm đến"
                className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0"
              />
            </label>
            <label className="flex min-w-0 flex-col justify-center rounded-xl bg-slate-50 px-4 py-3 transition focus-within:ring-2 focus-within:ring-sky-500">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Nhận phòng
              </span>
              <input
                type="date"
                min={getDateValue(new Date())}
                value={checkIn}
                onChange={event => setCheckIn(event.target.value)}
                aria-label="Ngày nhận phòng"
                required
                className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 focus:outline-none focus:ring-0"
              />
            </label>
            <label className="flex min-w-0 flex-col justify-center rounded-xl bg-slate-50 px-4 py-3 transition focus-within:ring-2 focus-within:ring-sky-500">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /> Trả phòng
              </span>
              <input
                type="date"
                min={checkIn || getDateValue(new Date())}
                value={checkOut}
                onChange={event => setCheckOut(event.target.value)}
                aria-label="Ngày trả phòng"
                required
                className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 focus:outline-none focus:ring-0"
              />
            </label>
            <div className="flex flex-col justify-center rounded-xl bg-slate-50 px-4 py-3">
              <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Users className="h-3.5 w-3.5" aria-hidden="true" /> Khách
              </span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setGuests(value => Math.max(1, value - 1))} aria-label="Giảm số khách" className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-600">−</button>
                <span className="min-w-3 text-center text-sm font-semibold text-slate-900">{guests}</span>
                <button type="button" onClick={() => setGuests(value => Math.min(20, value + 1))} aria-label="Tăng số khách" className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-600">+</button>
              </div>
            </div>
            <button type="submit" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-sky-500 px-7 font-semibold text-white transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
              <Search className="h-4 w-4" aria-hidden="true" />
              Tìm kiếm
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {popularDestinations.map(city => (
              <button
                key={city}
                type="button"
                onClick={() => setDestination(city)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition ${destination === city ? 'border-sky-300 bg-sky-500/50' : 'border-white/25 bg-white/10 hover:bg-white/20'}`}
              >
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                {city}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-12 sm:py-16">
        <div className="container-main grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ShieldCheck, title: 'Đặt phòng an toàn', description: 'Thanh toán bảo mật SSL, dữ liệu được mã hóa.' },
            { icon: CreditCard, title: 'Giá tốt nhất', description: 'Cam kết hoàn tiền nếu tìm được giá tốt hơn.' },
            { icon: Headphones, title: 'Hỗ trợ 24/7', description: 'Đội ngũ tư vấn sẵn sàng hỗ trợ mọi lúc.' },
            { icon: TrendingUp, title: '500K+ chỗ nghỉ', description: 'Lựa chọn đa dạng từ bình dân đến cao cấp.' },
          ].map(({ icon: Icon, title, description }) => (
            <article key={title} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">{title}</h2>
                <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container-main pb-16 pt-4 sm:pb-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Chỗ nghỉ nổi bật</h2>
            <p className="mt-2 text-slate-600">Những lựa chọn mới nhất dành cho chuyến đi tiếp theo.</p>
          </div>
          <button type="button" onClick={() => navigate('/properties')} className="font-semibold text-sky-600 hover:text-sky-700">Xem tất cả →</button>
        </div>
        {properties.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{properties.map(property => <PropertyCard key={property.id} property={property} />)}</div>
        ) : (
          <div className="rounded-xl bg-white p-8 text-center text-slate-600">Chưa có chỗ nghỉ được đăng. Hãy quay lại sau nhé.</div>
        )}
      </section>
    </>
  );
};
