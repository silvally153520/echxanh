import { FormEvent, useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarCheck2, CalendarDays, Compass, Headphones, Leaf, MapPin, Search, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertiesApi } from '../services/api';
import type { Property } from '../types';
import { PropertyCard } from './shared';

const popularDestinations = [
  { city: 'Đà Nẵng', mood: 'Biển xanh, nhịp sống chậm', image: 'photo-1530789253388-582c481c54b0' },
  { city: 'Hà Nội', mood: 'Một vòng phố cũ', image: 'photo-1509030450996-dd1a26dda07a' },
  { city: 'Phú Quốc', mood: 'Trốn mình bên biển', image: 'photo-1519046904884-53103b34b206' },
  { city: 'Nha Trang', mood: 'Nắng vàng mỗi sớm', image: 'photo-1507525428034-b723cf961d3e' },
  { city: 'Đà Lạt', mood: 'Chạm vào miền sương', image: 'photo-1510798831971-661eb04b3739' },
];

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

  const getSearchUrl = (selectedDestination = destination) => {
    if (checkOut <= checkIn) {
      toast.error('Ngày trả phòng phải sau ngày nhận phòng.');
      return null;
    }

    const params = new URLSearchParams({
      checkIn: new Date(`${checkIn}T00:00:00.000Z`).toISOString(),
      checkOut: new Date(`${checkOut}T00:00:00.000Z`).toISOString(),
      guests: String(guests),
    });
    const trimmedDestination = selectedDestination.normalize('NFC').trim();
    if (trimmedDestination) params.set('city', trimmedDestination);
    return `/properties?${params.toString()}`;
  };

  const searchProperties = (event: FormEvent) => {
    event.preventDefault();
    const url = getSearchUrl();
    if (url) navigate(url);
  };

  const searchDestination = (city: string) => {
    setDestination(city);
    const url = getSearchUrl(city);
    if (url) navigate(url);
  };

  return (
    <>
      <section className="relative overflow-hidden bg-[#12382d] pt-16 text-white">
        <div className="mx-auto grid max-w-[1600px] lg:min-h-[590px] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="flex flex-col justify-center px-5 pb-10 pt-12 sm:px-8 sm:pb-14 lg:py-20 xl:pl-[max(2rem,calc((100vw-1280px)/2))]">
            <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">
              <Leaf className="h-4 w-4" aria-hidden="true" />
              Đi gần hơn với thiên nhiên
            </p>
            <h1 className="max-w-2xl font-sans text-5xl font-semibold leading-[1.08] tracking-normal sm:text-6xl xl:text-7xl">
              Có những nơi,
              <br />
              <span className="text-emerald-300">đến rồi chẳng</span>
              <br />
              muốn về.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/75 sm:text-lg">
              Chọn một chốn dừng chân thật hợp, rồi để chuyến đi tự kể câu chuyện của nó.
            </p>
            <a href="#kham-pha" className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-white transition hover:text-emerald-200">
              Tìm cảm hứng cho chuyến đi <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>

          <div className="relative min-h-[300px] overflow-hidden sm:min-h-[420px] lg:min-h-0">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=90"
              alt="Bãi biển yên bình dưới ánh nắng cuối ngày"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#12382d]/45 via-transparent to-[#12382d]/10 lg:bg-gradient-to-r lg:from-[#12382d]/20 lg:via-transparent lg:to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 sm:bottom-8 sm:left-8 sm:right-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Bộ sưu tập tháng này</p>
                <p className="mt-1 font-sans text-2xl font-semibold text-white sm:text-3xl">Ngày dài bên biển</p>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur transition hover:bg-white/25" aria-hidden="true">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-main relative z-10 -mt-7 sm:-mt-9">
        <form onSubmit={searchProperties} className="grid gap-2 rounded-3xl border border-stone-200 bg-white p-3 shadow-[0_24px_70px_-30px_rgba(18,56,45,0.3)] sm:p-4 md:grid-cols-[1.3fr_1fr_1fr_0.8fr_auto] md:items-center md:gap-1">
          <label className="flex min-w-0 flex-col justify-center rounded-2xl px-4 py-3 transition hover:bg-stone-50 focus-within:bg-stone-50 focus-within:ring-2 focus-within:ring-emerald-700">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <MapPin className="h-4 w-4 text-emerald-700" aria-hidden="true" /> Bạn muốn đi đâu?
            </span>
            <input
              value={destination}
              onChange={event => setDestination(event.target.value)}
              placeholder="Thành phố, điểm đến..."
              aria-label="Điểm đến"
              className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0"
            />
          </label>
          <label className="flex min-w-0 flex-col justify-center rounded-2xl px-4 py-3 transition hover:bg-stone-50 focus-within:bg-stone-50 focus-within:ring-2 focus-within:ring-emerald-700 md:border-l md:border-stone-200">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CalendarDays className="h-4 w-4 text-emerald-700" aria-hidden="true" /> Nhận phòng
            </span>
            <input
              type="date"
              min={getDateValue(new Date())}
              value={checkIn}
              onChange={event => setCheckIn(event.target.value)}
              aria-label="Ngày nhận phòng"
              required
              className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-0"
            />
          </label>
          <label className="flex min-w-0 flex-col justify-center rounded-2xl px-4 py-3 transition hover:bg-stone-50 focus-within:bg-stone-50 focus-within:ring-2 focus-within:ring-emerald-700 md:border-l md:border-stone-200">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <CalendarCheck2 className="h-4 w-4 text-emerald-700" aria-hidden="true" /> Trả phòng
            </span>
            <input
              type="date"
              min={checkIn || getDateValue(new Date())}
              value={checkOut}
              onChange={event => setCheckOut(event.target.value)}
              aria-label="Ngày trả phòng"
              required
              className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-0"
            />
          </label>
          <div className="flex flex-col justify-center rounded-2xl px-4 py-3 md:border-l md:border-stone-200">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Users className="h-4 w-4 text-emerald-700" aria-hidden="true" /> Số khách
            </span>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setGuests(value => Math.max(1, value - 1))} aria-label="Giảm số khách" className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-emerald-600 hover:text-emerald-700">−</button>
              <span className="min-w-3 text-center text-sm font-semibold text-slate-900">{guests}</span>
              <button type="button" onClick={() => setGuests(value => Math.min(20, value + 1))} aria-label="Tăng số khách" className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition hover:border-emerald-600 hover:text-emerald-700">+</button>
            </div>
          </div>
          <button type="submit" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2">
            <Search className="h-4 w-4" aria-hidden="true" />
            Tìm chỗ nghỉ
          </button>
        </form>

        <div className="grid gap-3 py-6 sm:grid-cols-3 sm:gap-6 sm:py-8">
          {[
            { icon: Compass, title: 'Khám phá dễ dàng', text: 'Tìm nơi ở theo điểm đến yêu thích.' },
            { icon: ShieldCheck, title: 'Đặt phòng an tâm', text: 'Thông tin rõ ràng, thanh toán bảo mật.' },
            { icon: Headphones, title: 'Luôn có hỗ trợ', text: 'Đội ngũ sẵn sàng đồng hành cùng bạn.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 border-b border-stone-200 pb-3 last:border-0 sm:border-0 sm:pb-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="kham-pha" className="container-main scroll-mt-8 pb-16 pt-8 sm:pb-20 sm:pt-12">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Chọn một nơi để bắt đầu</p>
            <h2 className="font-sans text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Đi đâu cũng có điều hay</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-500">Từ một cuối tuần trên cao nguyên đến vài ngày nắng ấm bên bờ biển.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {popularDestinations.map(({ city, mood, image }, index) => (
            <button
              key={city}
              type="button"
              onClick={() => searchDestination(city)}
              className={`group relative min-h-48 overflow-hidden rounded-3xl bg-slate-300 text-left text-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 sm:min-h-56 ${index === 0 ? 'col-span-2 min-h-64 sm:row-span-2 sm:min-h-[29rem]' : ''}`}
              aria-label={`Tìm chỗ nghỉ tại ${city}`}
            >
              <img
                src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=1000&q=85`}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                <span>
                  <span className="block font-sans text-2xl font-semibold sm:text-3xl">{city}</span>
                  <span className="mt-1 block text-xs text-white/80 sm:text-sm">{mood}</span>
                </span>
                <span className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/10 transition group-hover:bg-white group-hover:text-slate-900">
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-[#f1f3ec] py-16 sm:py-20">
        <div className="container-main">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Được chọn cho bạn</p>
              <h2 className="font-sans text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Những chốn dừng chân đáng nhớ</h2>
              <p className="mt-2 text-slate-600">Tìm cảm hứng cho hành trình tiếp theo của bạn.</p>
            </div>
            <button type="button" onClick={() => navigate('/properties')} className="group inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-700 hover:text-emerald-800">
              Xem tất cả <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </div>
          {properties.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{properties.map(property => <PropertyCard key={property.id} property={property} />)}</div>
          ) : (
            <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 p-10 text-center text-slate-600">Chưa có chỗ nghỉ được đăng. Hãy quay lại sau nhé.</div>
          )}
        </div>
      </section>

      <section className="container-main py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#12382d] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16">
          <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full border border-white/10 sm:right-24" />
          <div className="pointer-events-none absolute -right-2 -top-12 h-56 w-56 rounded-full border border-white/10 sm:right-32" />
          <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Hành trình của riêng bạn</p>
              <h2 className="font-sans text-3xl font-semibold leading-tight sm:text-4xl">Đôi khi, chỉ cần đi đâu đó để thấy lòng mình rộng hơn.</h2>
              <p className="mt-3 max-w-xl leading-7 text-white/70">Khám phá những ngôi nhà nhỏ, những miền đất mới và những trải nghiệm chờ bạn mở lối.</p>
            </div>
            <button type="button" onClick={() => navigate('/properties')} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-emerald-900 transition hover:bg-emerald-100">
              Bắt đầu khám phá <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
