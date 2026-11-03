import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/api';
import { formatPrice, PageHeader } from '../shared';

type AnalyticsData = { totalRevenue: number; totalBookings: number; averageBookingValue: number; chartData: Array<{ period: string; revenue: number; bookings: number }> };
export const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  useEffect(() => {
    adminApi.getRevenue().then(({ data: result }) => setData(result)).catch(() => toast.error('Không thể tải báo cáo doanh thu.'));
  }, []);

  return (
    <section className="container-main py-10">
      <PageHeader title="Doanh thu & phân tích" description="Doanh thu được tính từ các đơn đã hoàn tất." />
      {!data ? <p className="py-12 text-center text-slate-500">Đang tải báo cáo…</p> : <>
        <div className="grid gap-4 sm:grid-cols-3">{[['Tổng doanh thu', formatPrice(data.totalRevenue)], ['Đơn hoàn tất', data.totalBookings], ['Giá trị trung bình', formatPrice(data.averageBookingValue)]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>
        <div className="mt-8 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Kỳ</th><th className="p-4">Số đơn</th><th className="p-4">Doanh thu</th></tr></thead><tbody>{data.chartData.map(row => <tr key={row.period} className="border-t border-slate-100"><td className="p-4">{row.period}</td><td className="p-4">{row.bookings}</td><td className="p-4 font-medium">{formatPrice(row.revenue)}</td></tr>)}</tbody></table>
          {!data.chartData.length && <p className="p-8 text-center text-slate-500">Chưa có doanh thu để hiển thị.</p>}
        </div>
      </>}
    </section>
  );
};
