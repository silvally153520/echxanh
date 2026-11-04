import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { PROPERTY_CATEGORY_LABELS, type Booking, type Property } from '../types';

export const PageHeader = ({ title, description, action }: {
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      {description && <p className="mt-2 text-slate-600">{description}</p>}
    </div>
    {action}
  </div>
);

export const EmptyState = ({ children }: { children: ReactNode }) => (
  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
    {children}
  </div>
);

export const formatPrice = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(date));

export const StatusLabel = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-green-100 text-green-800',
    ACTIVE: 'bg-green-100 text-green-800',
    DRAFT: 'bg-slate-100 text-slate-700',
    INACTIVE: 'bg-slate-200 text-slate-700',
  };
  const labels: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    CANCELLED: 'Đã hủy',
    COMPLETED: 'Hoàn tất',
    ACTIVE: 'Đang hiển thị',
    DRAFT: 'Bản nháp',
    INACTIVE: 'Đã ẩn',
  };
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-700'}`}>{labels[status] || status}</span>;
};

const samplePropertyImage = (property: Property) => {
  const city = property.city.toLocaleLowerCase('vi');
  const coastal = city.includes('phú quốc') || city.includes('nha trang') || city.includes('đà nẵng');
  const highland = city.includes('đà lạt') || city.includes('hội an');
  const cityStay = city.includes('hà nội') || city.includes('hồ chí minh');
  const images = coastal
    ? ['photo-1571896349842-33c89424de2d', 'photo-1507525428034-b723cf961d3e', 'photo-1582719508461-905c673771fd']
    : highland
      ? ['photo-1510798831971-661eb04b3739', 'photo-1494526585095-c41746248156', 'photo-1564013799919-ab600027ffc6']
      : cityStay
        ? ['photo-1564013799919-ab600027ffc6', 'photo-1566073771259-6a8506099945', 'photo-1582719508461-905c673771fd']
        : ['photo-1566073771259-6a8506099945', 'photo-1510798831971-661eb04b3739', 'photo-1494526585095-c41746248156'];
  const imageId = images[property.title.length % images.length];
  return `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=1200&q=85`;
};

export const PropertyCard = ({ property }: { property: Property }) => {
  const image = property.images?.[0] || samplePropertyImage(property);
  const isSampleImage = !property.images?.[0];

  return (
    <article className="group overflow-hidden rounded-3xl border border-stone-200/80 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <Link to={`/properties/${property.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={isSampleImage ? `Ảnh minh họa cho ${property.title}` : property.title}
          loading="lazy"
          onError={event => { event.currentTarget.style.display = 'none'; }}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {isSampleImage && <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">Ảnh minh họa</span>}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm">
          {PROPERTY_CATEGORY_LABELS[property.category]}
        </span>
        {property.averageRating ? (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-sm font-semibold text-slate-900 shadow-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
            {property.averageRating.toFixed(1)}
          </span>
        ) : null}
      </Link>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{property.city}, {property.country}</span>
            </p>
            <Link to={`/properties/${property.id}`} className="mt-1 block truncate text-base font-semibold text-slate-900 transition hover:text-emerald-700">
              {property.title}
            </Link>
          </div>
          {property.reviewCount ? (
            <span className="shrink-0 rounded-md bg-emerald-700 px-2 py-1 text-xs font-bold text-white">{property.reviewCount} đánh giá</span>
          ) : null}
        </div>
        {property.amenities.length > 0 && (
          <div className="mt-3 flex min-h-7 flex-wrap gap-1.5">
            {property.amenities.slice(0, 3).map(amenity => (
              <span key={amenity} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">{amenity}</span>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <span className="block text-xs text-slate-400">Giá mỗi đêm</span>
            <span className="mt-0.5 font-bold text-slate-900">{formatPrice(property.pricePerNight)}</span>
          </div>
          <Link to={`/properties/${property.id}`} className="text-sm font-semibold text-emerald-700 transition hover:text-emerald-800">
            Xem chi tiết <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
};

export const BookingCard = ({ booking }: { booking: Booking }) => (
  <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
    <div className="h-36 w-full flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-44">
      {booking.property.images?.[0] && <img src={booking.property.images[0]} alt={booking.property.title} className="h-full w-full object-cover" />}
    </div>
    <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">{booking.property.title}</h2>
          <p className="mt-1 text-sm text-slate-500">{booking.property.city}, {booking.property.country}</p>
        </div>
        <StatusLabel status={booking.status} />
      </div>
      <p className="text-sm text-slate-600">{formatDate(booking.checkIn)} – {formatDate(booking.checkOut)} · {booking.guests} khách</p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-slate-900">{formatPrice(booking.totalPrice)}</span>
        <Link to={`/dashboard/bookings/${booking.id}`} className="font-medium text-primary-700 hover:text-primary-800">Xem chi tiết →</Link>
      </div>
    </div>
  </article>
);
