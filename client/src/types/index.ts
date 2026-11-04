export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'HOST' | 'ADMIN';
  avatar?: string;
  phone?: string;
  emailVerified: boolean;
  createdAt: string;
}

export const PROPERTY_CATEGORY_LABELS = {
  HOTEL: 'Khách sạn',
  RESORT: 'Resort',
  VILLA: 'Biệt thự',
} as const;

export type PropertyCategory = keyof typeof PROPERTY_CATEGORY_LABELS;

export interface Property {
  id: string;
  hostId: string;
  host?: {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
  };
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  category: PropertyCategory;
  amenities: string[];
  images: string[];
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  reviewCount?: number;
  bookingCount?: number;
  reviews?: Review[];
}

export interface Booking {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  propertyId: string;
  property: {
    id: string;
    title: string;
    images: string[];
    city: string;
    country: string;
    pricePerNight: number;
    host?: {
      id: string;
      name: string;
      avatar?: string;
      phone?: string;
      email?: string;
    };
  };
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  review?: Review;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  propertyId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PropertyFilters extends PaginationParams {
  city?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  guests?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string;
  checkIn?: string;
  checkOut?: string;
  sortBy?: 'priceAsc' | 'priceDesc' | 'newest' | 'rating';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface BookingFormData {
  propertyId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

export interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  pricePerNight: number;
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
}

export interface StatsData {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  totalRevenue: number;
}