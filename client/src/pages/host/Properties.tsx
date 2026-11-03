import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertiesApi } from '../../services/api';
import type { Property } from '../../types';
import { EmptyState, formatPrice, PageHeader, StatusLabel } from '../shared';

export const HostProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const load = () => propertiesApi.getHostProperties({ limit: 100 }).then(({ data }) => setProperties(data.properties || [])).catch(() => toast.error('Không thể tải chỗ nghỉ.'));
  useEffect(() => { load(); }, []);

  const remove = async (property: Property) => {
    if (!window.confirm(`Xóa chỗ nghỉ "${property.title}"?`)) return;
    try {
      await propertiesApi.delete(property.id);
      toast.success('Đã xóa chỗ nghỉ.');
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xóa chỗ nghỉ.');
    }
  };

  return (
    <section className="container-main py-10">
      <PageHeader title="Chỗ nghỉ của tôi" description="Tạo mới, cập nhật hoặc ẩn tin đăng." action={<Link to="/host/properties/new" className="btn-primary">+ Đăng chỗ nghỉ</Link>} />
      {properties.length ? <div className="space-y-4">{properties.map(property => (
        <article key={property.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">
          <div className="h-36 w-full flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-48">{property.images[0] && <img src={property.images[0]} alt={property.title} className="h-full w-full object-cover" />}</div>
          <div className="flex flex-1 flex-col justify-between gap-3"><div className="flex flex-wrap justify-between gap-2"><div><h2 className="font-semibold">{property.title}</h2><p className="mt-1 text-sm text-slate-500">{property.city}, {property.country} · {formatPrice(property.pricePerNight)}/đêm</p></div><StatusLabel status={property.status} /></div><div className="flex gap-2"><Link to={`/host/properties/${property.id}/edit`} className="btn-secondary btn-sm">Chỉnh sửa</Link><button type="button" onClick={() => remove(property)} className="btn-danger btn-sm">Xóa</button></div></div>
        </article>
      ))}</div> : <EmptyState>Bạn chưa đăng chỗ nghỉ nào. <Link className="ml-1 font-semibold text-primary-700" to="/host/properties/new">Tạo tin đăng đầu tiên</Link></EmptyState>}
    </section>
  );
};
