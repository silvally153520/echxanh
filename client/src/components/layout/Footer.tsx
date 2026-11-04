import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone, Heart } from 'lucide-react';
import { FrogLogo } from '../ui/FrogLogo';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'Về chúng tôi', href: '/about' },
      { label: 'Tuyển dụng', href: '/careers' },
      { label: 'Báo chí', href: '/press' },
      { label: 'Đối tác', href: '/partners' },
    ],
    support: [
      { label: 'Trung tâm trợ giúp', href: '/help' },
      { label: 'Chính sách hủy', href: '/cancellation-policy' },
      { label: 'Điều khoản dịch vụ', href: '/terms' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
    ],
    community: [
      { label: 'Cộng đồng Host', href: '/host-community' },
      { label: 'Trải nghiệm', href: '/experiences' },
      { label: 'Blog', href: '/blog' },
      { label: 'Khách sạn', href: '/hotels' },
    ],
    host: [
      { label: 'Đăng tin cho thuê', href: '/host/properties/new' },
      { label: 'Hướng dẫn Host', href: '/host-guide' },
      { label: 'Bảo hiểm Host', href: '/host-insurance' },
      { label: 'Hỗ trợ 24/7', href: '/host-support' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  const contactInfo = [
    { icon: MapPin, text: '123 Đường ABC, Quận 1, TP.HCM' },
    { icon: Phone, text: '1900 123 456' },
    { icon: Mail, text: 'support@localvibe.vn' },
  ];

  return (
    <footer className="bg-[#12382d] text-slate-300" role="contentinfo">
      <div className="container-main py-16 lg:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white mb-4" aria-label="sieuechxanh trang chủ">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <FrogLogo className="h-8 w-8" />
              </span>
              <span>sieuechxanh</span>
            </Link>
            <p className="text-slate-400 mb-6 max-w-xs">
              Nền tảng đặt phòng nhà nghỉ, homestay, khách sạn uy tín nhất Việt Nam.
              Khám phá những nơi nghỉ độc đáo, trải nghiệm địa phương chân thật.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <nav aria-label="Company links">
            <h3 className="font-semibold text-white mb-4">Công ty</h3>
            <ul className="space-y-3">
              {footerLinks.company.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support */}
          <nav aria-label="Support links">
            <h3 className="font-semibold text-white mb-4">Hỗ trợ</h3>
            <ul className="space-y-3">
              {footerLinks.support.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Community */}
          <nav aria-label="Community links">
            <h3 className="font-semibold text-white mb-4">Cộng đồng</h3>
            <ul className="space-y-3">
              {footerLinks.community.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Host */}
          <nav aria-label="Host links">
            <h3 className="font-semibold text-white mb-4">Dành cho Host</h3>
            <ul className="space-y-3">
              {footerLinks.host.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-white mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              {contactInfo.map(({ icon: Icon, text }, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span className="text-slate-400">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} sieuechxanh. Tất cả quyền được bảo lưu.
          </p>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link to="/terms" className="hover:text-white transition-colors">Điều khoản</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Bảo mật</Link>
            <Link to="/cookies" className="hover:text-white transition-colors">Cookie</Link>
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-red-500" aria-hidden="true" />
              <span>Được tạo với tình yêu tại Việt Nam</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};