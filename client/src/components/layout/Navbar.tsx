import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard, Home, Heart, ChevronDown, Plus, ShieldCheck, Globe2, CalendarDays, UserRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  useEffect(() => {
    if (!isUserMenuOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !userMenuRef.current?.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsUserMenuOpen(false);
    };

    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isUserMenuOpen]);

  const navLinks = [
    { path: '/', label: 'Trang chủ', icon: Home },
    { path: '/properties', label: 'Tìm phòng', icon: Heart },
  ];

  const userLinks = user?.role === 'ADMIN' ? [
    { path: '/admin', label: 'Quản trị', icon: ShieldCheck },
    { path: '/host', label: 'Khu vực Host', icon: Home },
  ] : user?.role === 'HOST' ? [
    { path: '/host', label: 'Bảng điều khiển Host', icon: LayoutDashboard },
    { path: '/host/properties/new', label: 'Đăng tin mới', icon: Plus },
  ] : [
    { path: '/dashboard', label: 'Đơn đặt phòng', icon: LayoutDashboard },
  ];
  const accountLinks = [
    { path: '/dashboard', label: 'Đặt phòng của tôi', icon: CalendarDays },
    { path: '/profile', label: 'Hồ sơ của tôi', icon: UserRound },
    ...(user?.role === 'HOST' || user?.role === 'ADMIN'
      ? [{ path: '/host', label: 'Dashboard Host', icon: LayoutDashboard }]
      : []),
    ...(user?.role === 'ADMIN'
      ? [{ path: '/admin', label: 'Bảng quản trị', icon: ShieldCheck }]
      : []),
  ];

  return (
    <header className={isHomePage
      ? 'absolute inset-x-0 top-0 z-40 border-b border-white/10 bg-transparent'
      : 'sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm'}
    >
      <nav className="container-main" aria-label="Main navigation">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className={`flex items-center gap-2 text-xl font-bold ${isHomePage ? 'text-white' : 'text-primary-600'}`} aria-label="sieuechxanh trang chủ">
            <span className={isHomePage ? 'flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500' : ''}>
            <svg className="h-8 w-8" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M16 2L4 8v16l12 6 12-6V8L16 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M16 8v16" stroke="currentColor" strokeWidth="2" />
              <path d="M8 14h16" stroke="currentColor" strokeWidth="2" />
            </svg>
            </span>
            <span className="hidden sm:block">sieuechxanh</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isHomePage ? ['Khách sạn', 'Resort', 'Biệt thự'].map(label => (
              <Link key={label} to="/properties" className="rounded-lg px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-white">
                {label}
              </Link>
            )) : navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>

          {/* Right side - Auth/User */}
          <div className="flex items-center gap-2">
            {/* Search button on mobile */}
            <button
              className={`md:hidden rounded-lg p-2 ${isHomePage ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
              onClick={() => navigate('/properties')}
              aria-label="Search properties"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {!isAuthenticated && isHomePage && (
              <span className="hidden items-center gap-1.5 text-sm font-semibold text-white/90 md:inline-flex">
                <Globe2 className="h-4 w-4" aria-hidden="true" /> VI
              </span>
            )}

            {isAuthenticated ? (
              <div className="hidden items-center gap-3 md:flex">
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${isHomePage ? 'text-white/90' : 'text-slate-600'}`}>
                  <Globe2 className="h-4 w-4" aria-hidden="true" /> VI
                </span>
                <div className="relative" ref={userMenuRef}>
                  <button
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition ${isHomePage ? 'border-white/15 bg-white/10 text-white hover:bg-white/20' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                    onClick={() => setIsUserMenuOpen(open => !open)}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                    aria-controls="account-menu"
                  >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500">
                        <span className="text-sm font-bold text-white">
                          {user?.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="max-w-32 truncate">{user?.name}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                  </button>
                  {isUserMenuOpen && (
                    <div id="account-menu" className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 text-slate-700 shadow-xl">
                      {accountLinks.map(({ path, label, icon: Icon }, index) => (
                        <Link
                          key={path}
                          to={path}
                          onClick={() => setIsUserMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-slate-50 hover:text-sky-700 ${index >= 2 ? 'border-t border-slate-100' : ''}`}
                        >
                          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                          {label}
                        </Link>
                      ))}
                      <div className="my-1 border-t border-slate-100" />
                      <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50">
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                {isHomePage ? (
                  <>
                    <button type="button" className="px-3 py-2 text-sm font-semibold text-white transition hover:text-sky-200" onClick={() => navigate('/login')}>Đăng nhập</button>
                    <button type="button" className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-600" onClick={() => navigate('/register')}>Đăng ký</button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                      Đăng nhập
                    </Button>
                    <Button size="sm" onClick={() => navigate('/register')}>
                      Đăng ký
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className={`md:hidden rounded-lg p-2 ${isHomePage ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden rounded-b-xl bg-white text-slate-700 shadow-xl transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="border-t border-slate-200 pt-4">
            <div className="flex flex-col gap-1 mb-4">
              {(isHomePage ? [
                { path: '/', label: 'Trang chủ', icon: Home },
                { path: '/properties', label: 'Khách sạn, resort & biệt thự', icon: Heart },
              ] : navLinks).map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${
                    location.pathname === path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>

            {isAuthenticated ? (
              <div className="space-y-1 mb-4">
                {userLinks.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-100"
                  >
                    <Icon className="w-5 h-5" aria-hidden="true" />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-slate-600 hover:bg-slate-100 text-left"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mb-4">
                <Button variant="secondary" className="w-full justify-start" onClick={() => { navigate('/login'); closeMobileMenu(); }}>
                  Đăng nhập
                </Button>
                <Button className="w-full justify-start" onClick={() => { navigate('/register'); closeMobileMenu(); }}>
                  Đăng ký
                </Button>
              </div>
            )}

            {/* User info in mobile menu */}
            {isAuthenticated && user && (
              <div className="pt-4 border-t border-slate-200 flex items-center gap-3 px-4">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-10 h-10 rounded-full" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-medium">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{user.name}</p>
                  <p className="text-sm text-slate-500 truncate">{user.email}</p>
                  <Badge variant="primary" className="mt-1 capitalize">{user.role.toLowerCase()}</Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};