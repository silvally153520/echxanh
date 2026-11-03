import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface UIState {
  // Mobile menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Search modal
  isSearchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;

  // Auth modals
  isLoginOpen: boolean;
  isRegisterOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  openRegister: () => void;
  closeRegister: () => void;
  switchToLogin: () => void;
  switchToRegister: () => void;

  // Property detail modal
  selectedPropertyId: string | null;
  openPropertyDetail: (id: string) => void;
  closePropertyDetail: () => void;

  // Booking modal
  isBookingOpen: boolean;
  bookingPropertyId: string | null;
  openBooking: (propertyId: string) => void;
  closeBooking: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Mobile menu
      isMobileMenuOpen: false,
      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),

      // Search
      isSearchOpen: false,
      openSearch: () => set({ isSearchOpen: true }),
      closeSearch: () => set({ isSearchOpen: false }),

      // Auth modals
      isLoginOpen: false,
      isRegisterOpen: false,
      openLogin: () => set({ isLoginOpen: true, isRegisterOpen: false }),
      closeLogin: () => set({ isLoginOpen: false }),
      openRegister: () => set({ isRegisterOpen: true, isLoginOpen: false }),
      closeRegister: () => set({ isRegisterOpen: false }),
      switchToLogin: () => set({ isLoginOpen: true, isRegisterOpen: false }),
      switchToRegister: () => set({ isRegisterOpen: true, isLoginOpen: false }),

      // Property detail
      selectedPropertyId: null,
      openPropertyDetail: (id: string) => set({ selectedPropertyId: id }),
      closePropertyDetail: () => set({ selectedPropertyId: null }),

      // Booking
      isBookingOpen: false,
      bookingPropertyId: null,
      openBooking: (propertyId: string) => set({ isBookingOpen: true, bookingPropertyId: propertyId }),
      closeBooking: () => set({ isBookingOpen: false, bookingPropertyId: null }),

      // Theme
      isDarkMode: false,
      toggleDarkMode: () => set((state) => {
        const newValue = !state.isDarkMode;
        if (newValue) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        return { isDarkMode: newValue };
      }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ isDarkMode: state.isDarkMode }),
    }
  )
);