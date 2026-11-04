import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const refreshTokenSchema = z.object({
  cookies: z.object({
    refreshToken: z.string().optional(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
    avatar: z.string().url('Invalid avatar URL').optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  }),
});

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100),
    description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City is required'),
    country: z.string().min(2, 'Country is required'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    pricePerNight: z.number().int().positive('Price must be positive'),
    maxGuests: z.number().int().positive('Max guests must be positive'),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().int().nonnegative(),
    category: z.enum(['HOTEL', 'RESORT', 'VILLA']).optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string().url('Invalid image URL')).optional(),
  }),
});

export const updatePropertySchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid property ID'),
  }),
  body: z.object({
    title: z.string().min(5).max(100).optional(),
    description: z.string().min(20).max(5000).optional(),
    address: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    country: z.string().min(2).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    pricePerNight: z.number().int().positive().optional(),
    maxGuests: z.number().int().positive().optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    category: z.enum(['HOTEL', 'RESORT', 'VILLA']).optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).optional(),
  }),
});

export const getPropertiesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(12),
    city: z.string().optional(),
    country: z.string().optional(),
    category: z.enum(['HOTEL', 'RESORT', 'VILLA']).optional(),
    minPrice: z.coerce.number().int().nonnegative().optional(),
    maxPrice: z.coerce.number().int().nonnegative().optional(),
    guests: z.coerce.number().int().positive().optional(),
    bedrooms: z.coerce.number().int().nonnegative().optional(),
    bathrooms: z.coerce.number().int().nonnegative().optional(),
    amenities: z.string().optional(), // comma-separated
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    sortBy: z.enum(['priceAsc', 'priceDesc', 'newest', 'rating']).optional(),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    propertyId: z.string().cuid('Invalid property ID'),
    checkIn: z.string().datetime('Invalid check-in date'),
    checkOut: z.string().datetime('Invalid check-out date'),
    guests: z.number().int().positive('Guests must be positive'),
  }).refine(data => new Date(data.checkIn) < new Date(data.checkOut), {
    message: 'Check-out must be after check-in',
    path: ['checkOut'],
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid booking ID'),
  }),
  body: z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
  }),
});

export const createReviewSchema = z.object({
  body: z.object({
    bookingId: z.string().cuid('Invalid booking ID'),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(1000).optional(),
  }),
});

export const adminUpdateUserSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid user ID'),
  }),
  body: z.object({
    role: z.enum(['USER', 'HOST', 'ADMIN']),
  }),
});

export const adminUserParamsSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid user ID'),
  }),
});

export const adminUpdatePropertyStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid property ID'),
  }),
  body: z.object({
    status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']),
  }),
});