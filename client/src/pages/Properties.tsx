import { FormEvent, useEffect, useState } from 'react';
import { CalendarDays, MapPin, Search, SlidersHorizontal, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertiesApi } from '../services/api';
import { PROPERTY_CATEGORY_LABELS, type Property, type PropertyCategory } from '../types';
import { EmptyState, formatPrice, PropertyCard } from './shared';

const amenityOptions = ['Wi-Fi', 'Điều hòa', 'Bếp', 'Ban công', 'Bãi đỗ xe', 'Hồ bơi', 'Bàn làm việc', 'Bữa sáng'];
const maxPriceLimit = 5_000_000;

const dateForInput = (value: string | null) => value?.slice(0, 10) || '';
const toIsoDate = (value: string) => new Date(`${value}T00:00:00.000Z`).toISOString();
const today = new Date();
const defaultCheckIn = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const defaultCheckOut = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

export const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [city, setCity] = useState(searchParams.get('city')?.normalize('NFC').trim() || '');
  const categoryParam = searchParams.get('category');
  const category = categoryParam && Object.prototype.hasOwnProperty.call(PROPERTY_CATEGORY_LABELS, categoryParam)
    ? categoryParam as PropertyCategory
    : null;
  const [checkIn, setCheckIn] = useState(dateForInput(searchParams.get('checkIn')) || defaultCheckIn);
  const [checkOut, setCheckOut] = useState(dateForInput(searchParams.get('checkOut')) || defaultCheckOut);
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 2);
  const [maxPrice, setMaxPrice] = useState(Number(searchParams.get('maxPrice')) || maxPriceLimit);
  const [bedrooms, setBedrooms] = useState(Number(searchParams.get('bedrooms')) || 0);
  const [amenities, setAmenities] = useState<string[]>(searchParams.get('amenities')?.split(',').filter(Boolean) || []);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    propertiesApi.getAll({
      city: searchParams.get('city')?.normalize('NFC').trim() || undefined,
      category: searchParams.get('category') || undefined,
      checkIn: searchParams.get('checkIn') || toIsoDate(defaultCheckIn),
      checkOut: searchParams.get('checkOut') || toIsoDate(defaultCheckOut),
      guests: Number(searchParams.get('guests')) || undefined,
      maxPrice: Number(searchParams.get('maxPrice')) || undefined,
      bedrooms: Number(searchParams.get('bedrooms')) || undefined,
      amenities: searchParams.get('amenities') || undefined,
      sortBy: searchParams.get('sortBy') || undefined,
      limit: 48,
    }).then(({ data }) => {
      setProperties(data.properties || []);
      setTotal(data.pagination?.total ?? data.properties?.length ?? 0);
    }).catch(() => {
      toast.error('Không thể tải danh sách chỗ nghỉ.');
      setProperties([]);
      setTotal(0);
    }).finally(() => setLoading(false));
  }, [searchParams]);

  const buildFilters = () => {
    const params = new URLSearchParams();
    const trimmedCity = city.normalize('NFC').trim();
    if (trimmedCity) params.set('city', trimmedCity);
    if (category) params.set('category', category);
    if (checkIn && checkOut) {
      params.set('checkIn', toIsoDate(checkIn));
      params.set('checkOut', toIsoDate(checkOut));
    }
    params.set('guests', String(guests));
    if (maxPrice < maxPriceLimit) params.set('maxPrice', String(maxPrice));
    if (bedrooms) params.set('bedrooms', String(bedrooms));
    if (amenities.length) params.set('amenities', amenities.join(','));
    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    return params;
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (checkIn && checkOut && checkOut <= checkIn) {
      toast.error('Ngày trả phòng phải sau ngày nhận phòng.');
      return;
    }
    setSearchParams(buildFilters());
  };

  const applyFilters = () => setSearchParams(buildFilters());

  const toggleAmenity = (amenity: string) => {
    setAmenities(current => current.includes(amenity)
      ? current.filter(item => item !== amenity)
      : [...current, amenity]);
  };

  const changeSort = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams);
    if (value === 'newest') params.delete('sortBy');
    else params.set('sortBy', value);
    setSearchParams(params);
  };

  return (
    <div className="min-h-[70vh] bg-slate-50">
      <div className="sticky top-16 z-30 border-b border-slate-200 bg-white shadow-sm">
        <form onSubmit={submit} className="container-main grid gap-2 py-4 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_0.8fr_auto]">
          <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Điểm đến</span>
            <input value={city} onChange={event => setCity(event.target.value)} placeholder="Bạn muốn đến đâu?" className="min-w-0 flex-1 border-0 p-0 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0" />
          </label>
          <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Ngày nhận phòng</span>
            <input type="date" value={checkIn} onChange={event => setCheckIn(event.target.value)} className="min-w-0 flex-1 border-0 p-0 text-sm text-slate-700 focus:outline-none focus:ring-0" />
          </label>
          <label className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
            <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Ngày trả phòng</span>
            <input type="date" min={checkIn || undefined} value={checkOut} onChange={event => setCheckOut(event.target.value)} className="min-w-0 flex-1 border-0 p-0 text-sm text-slate-700 focus:outline-none focus:ring-0" />
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100">
            <Users className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <span className="sr-only">Số khách</span>
            <input type="number" min={1} max={20} value={guests} onChange={event => setGuests(Math.max(1, Number(event.target.value)))} className="w-full border-0 p-0 text-sm text-slate-700 focus:outline-none focus:ring-0" />
            <span className="shrink-0 text-xs text-slate-500">khách</span>
          </label>
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
            <Search className="h-4 w-4" aria-hidden="true" />
            Tìm
          </button>
        </form>
      </div>

      <div className="container-main py-8 lg:py-10">
        <div className="grid items-start gap-7 lg:grid-cols-[270px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <SlidersHorizontal className="h-4 w-4 text-sky-600" aria-hidden="true" />
              <h1 className="font-bold text-slate-900">Bộ lọc</h1>
            </div>

            <fieldset className="border-b border-slate-100 py-5">
              <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Số phòng ngủ</legend>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3].map(count => (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={bedrooms === count}
                    onClick={() => setBedrooms(count)}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${bedrooms === count ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                  >
                    {count === 0 ? 'Tất cả' : count === 3 ? '3+' : count}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="border-b border-slate-100 py-5">
              <label htmlFor="max-price" className="mb-3 block text-xs font-bold uppercase tracking-wide text-slate-500">Giá tối đa / đêm</label>
              <input id="max-price" type="range" min={500000} max={maxPriceLimit} step={100000} value={maxPrice} onChange={event => setMaxPrice(Number(event.target.value))} className="w-full accent-sky-500" />
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>500.000 ₫</span>
                <span>{maxPrice === maxPriceLimit ? 'Không giới hạn' : `Tối đa ${formatPrice(maxPrice)}`}</span>
              </div>
            </div>

            <fieldset className="py-5">
              <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Tiện nghi</legend>
              <div className="space-y-3">
                {amenityOptions.map(amenity => (
                  <label key={amenity} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                    <input type="checkbox" checked={amenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} className="h-4 w-4 rounded border-slate-300 accent-sky-500 focus:ring-sky-500" />
                    {amenity}
                  </label>
                ))}
              </div>
            </fieldset>
            <button type="button" onClick={applyFilters} className="w-full rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600">
              Áp dụng bộ lọc
            </button>
          </aside>

          <section aria-label="Danh sách chỗ nghỉ">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{loading ? 'Đang tìm chỗ nghỉ…' : `${total} ${category ? PROPERTY_CATEGORY_LABELS[category].toLocaleLowerCase('vi') : 'chỗ nghỉ'}`}</h2>
                {searchParams.get('city') && <p className="mt-1 text-sm text-slate-500">Tại {searchParams.get('city')}</p>}
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-500">
                Sắp xếp
                <select value={sortBy} onChange={event => changeSort(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100">
                  <option value="newest">Mới nhất</option>
                  <option value="priceAsc">Giá thấp nhất</option>
                  <option value="priceDesc">Giá cao nhất</option>
                  <option value="rating">Được đánh giá nhiều</option>
                </select>
              </label>
            </div>
            {loading ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-[370px] animate-pulse rounded-2xl bg-slate-200" />)}
              </div>
            ) : properties.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{properties.map(property => <PropertyCard key={property.id} property={property} />)}</div>
            ) : (
              <EmptyState>Không tìm thấy chỗ nghỉ phù hợp. Hãy thử thay đổi điểm đến hoặc bộ lọc.</EmptyState>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
