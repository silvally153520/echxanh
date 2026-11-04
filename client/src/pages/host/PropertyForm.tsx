import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { propertiesApi } from '../../services/api';
import { PROPERTY_CATEGORY_LABELS, type PropertyCategory } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { PageHeader } from '../shared';

type FormFields = {
  title: string; description: string; address: string; city: string; country: string;
  latitude: string; longitude: string; pricePerNight: string; maxGuests: string;
  bedrooms: string; bathrooms: string; amenities: string; images: string; status: string;
  category: PropertyCategory;
};
const emptyForm: FormFields = {
  title: '', description: '', address: '', city: '', country: 'Việt Nam',
  latitude: '10.8231', longitude: '106.6297', pricePerNight: '', maxGuests: '2',
  bedrooms: '1', bathrooms: '1', amenities: '', images: '', status: 'DRAFT',
  category: 'HOTEL',
};

export const HostPropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormFields>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    propertiesApi.getOne(id).then(({ data }) => {
      const property = data.property;
      setForm({
        title: property.title, description: property.description, address: property.address,
        city: property.city, country: property.country, latitude: String(property.latitude),
        longitude: String(property.longitude), pricePerNight: String(property.pricePerNight),
        maxGuests: String(property.maxGuests), bedrooms: String(property.bedrooms),
        bathrooms: String(property.bathrooms), amenities: property.amenities.join(', '),
        images: property.images.join('\n'), status: property.status, category: property.category,
      });
    }).catch(() => toast.error('Không thể tải chỗ nghỉ.')).finally(() => setLoading(false));
  }, [id]);

  const setField = (field: keyof FormFields, value: string) => setForm(current => ({ ...current, [field]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const data = {
      title: form.title.trim(), description: form.description.trim(), address: form.address.trim(),
      city: form.city.trim(), country: form.country.trim(), latitude: Number(form.latitude),
      longitude: Number(form.longitude), pricePerNight: Number(form.pricePerNight),
      maxGuests: Number(form.maxGuests), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms),
      category: form.category,
      amenities: form.amenities.split(',').map(value => value.trim()).filter(Boolean),
      images: form.images.split('\n').map(value => value.trim()).filter(Boolean),
      ...(id ? { status: form.status } : {}),
    };
    setSaving(true);
    try {
      if (id) await propertiesApi.update(id, data);
      else await propertiesApi.create(data);
      toast.success(id ? 'Đã cập nhật chỗ nghỉ.' : 'Đã tạo chỗ nghỉ.');
      navigate('/host/properties');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu chỗ nghỉ.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container-main py-12 text-center">Đang tải chỗ nghỉ…</div>;

  return (
    <section className="container-main max-w-4xl py-10">
      <PageHeader title={id ? 'Chỉnh sửa chỗ nghỉ' : 'Đăng chỗ nghỉ'} description="Cung cấp thông tin chính xác để khách dễ dàng lựa chọn." />
      <form onSubmit={submit} className="grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <Input label="Tên chỗ nghỉ" value={form.title} onChange={event => setField('title', event.target.value)} minLength={5} maxLength={100} required />
        <Input label="Địa chỉ" value={form.address} onChange={event => setField('address', event.target.value)} minLength={5} required />
        <Input label="Thành phố" value={form.city} onChange={event => setField('city', event.target.value)} required />
        <Input label="Quốc gia" value={form.country} onChange={event => setField('country', event.target.value)} required />
        <Input label="Giá mỗi đêm (VND)" type="number" min={1} value={form.pricePerNight} onChange={event => setField('pricePerNight', event.target.value)} required />
        <Input label="Số khách tối đa" type="number" min={1} value={form.maxGuests} onChange={event => setField('maxGuests', event.target.value)} required />
        <Input label="Phòng ngủ" type="number" min={0} value={form.bedrooms} onChange={event => setField('bedrooms', event.target.value)} required />
        <Input label="Phòng tắm" type="number" min={0} value={form.bathrooms} onChange={event => setField('bathrooms', event.target.value)} required />
        <label className="block text-sm font-medium">Loại chỗ nghỉ<select className="input mt-1" value={form.category} onChange={event => setField('category', event.target.value)}>{Object.entries(PROPERTY_CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <Input label="Vĩ độ" type="number" step="any" value={form.latitude} onChange={event => setField('latitude', event.target.value)} required />
        <Input label="Kinh độ" type="number" step="any" value={form.longitude} onChange={event => setField('longitude', event.target.value)} required />
        <label className="block text-sm font-medium sm:col-span-2">Mô tả<textarea className="input mt-1 min-h-32" value={form.description} onChange={event => setField('description', event.target.value)} minLength={20} maxLength={5000} required /></label>
        <label className="block text-sm font-medium sm:col-span-2">Tiện nghi <span className="font-normal text-slate-500">(phân cách bằng dấu phẩy)</span><input className="input mt-1" value={form.amenities} onChange={event => setField('amenities', event.target.value)} placeholder="Wi-Fi, Máy lạnh, Bếp" /></label>
        <label className="block text-sm font-medium sm:col-span-2">Ảnh <span className="font-normal text-slate-500">(mỗi URL một dòng)</span><textarea className="input mt-1 min-h-24" value={form.images} onChange={event => setField('images', event.target.value)} placeholder="https://..." /></label>
        {id && <label className="block text-sm font-medium">Trạng thái<select className="input mt-1" value={form.status} onChange={event => setField('status', event.target.value)}><option value="DRAFT">Bản nháp</option><option value="ACTIVE">Đang hiển thị</option><option value="INACTIVE">Đã ẩn</option></select></label>}
        <div className="flex gap-3 sm:col-span-2"><Button type="submit" isLoading={saving}>{id ? 'Lưu thay đổi' : 'Tạo tin đăng'}</Button><Link to="/host/properties" className="btn-secondary">Hủy</Link></div>
      </form>
    </section>
  );
};
