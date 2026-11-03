import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { PageHeader, StatusLabel } from '../shared';

type ManagedProperty = { id: string; title: string; city: string; status: 'DRAFT' | 'ACTIVE' | 'INACTIVE'; host: { name: string; email: string } };

export const AdminProperties = () => {
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [status, setStatus] = useState('');
  const load = useCallback(() => adminApi.getProperties({ limit: 100, status: status || undefined }).then(({ data }) => setProperties(data.properties || [])).catch(() => toast.error('Không thể tải chỗ nghỉ.')), [status]);
  useEffect(() => { load(); }, [load]);
  const updateStatus = async (property: ManagedProperty, nextStatus: string) => {
    try {
      await adminApi.updatePropertyStatus(property.id, nextStatus);
      toast.success('Đã cập nhật trạng thái tin đăng.');
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật tin đăng.');
    }
  };

  return (
    <section className="container-main py-10">
      <PageHeader title="Quản lý chỗ nghỉ" description="Duyệt trạng thái và theo dõi các tin đăng." />
      <select aria-label="Lọc trạng thái" value={status} onChange={event => setStatus(event.target.value)} className="input mb-5 max-w-xs"><option value="">Tất cả trạng thái</option><option value="DRAFT">Bản nháp</option><option value="ACTIVE">Đang hiển thị</option><option value="INACTIVE">Đã ẩn</option></select>
      <div className="space-y-3">{properties.map(property => <article key={property.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5"><div><h2 className="font-semibold">{property.title}</h2><p className="mt-1 text-sm text-slate-500">{property.city} · Host: {property.host.name} ({property.host.email})</p><div className="mt-2"><StatusLabel status={property.status} /></div></div><select aria-label={`Trạng thái ${property.title}`} value={property.status} onChange={event => updateStatus(property, event.target.value)} className="rounded border border-slate-300 p-2"><option value="DRAFT">Bản nháp</option><option value="ACTIVE">Đang hiển thị</option><option value="INACTIVE">Đã ẩn</option></select></article>)}</div>
      {!properties.length && <p className="rounded-xl bg-white p-8 text-center text-slate-500">Không có tin đăng phù hợp.</p>}
    </section>
  );
};
