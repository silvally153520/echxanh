import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { Prisma } from '@prisma/client';
import { getPagination } from '../utils/pagination';
import { normalizeSearchText } from '../utils/search';

type PropertyQuery = Record<string, string | number | undefined>;

const buildPropertyWhere = (query: PropertyQuery) => {
  const where: Prisma.PropertyWhereInput = {
    status: 'ACTIVE',
  };

  if (typeof query.city === 'string' && query.city) {
    where.city = { contains: normalizeSearchText(query.city), mode: 'insensitive' };
  }

  if (typeof query.country === 'string' && query.country) {
    where.country = { contains: normalizeSearchText(query.country), mode: 'insensitive' };
  }

  if (query.minPrice || query.maxPrice) {
    where.pricePerNight = {};
    if (query.minPrice) where.pricePerNight.gte = Number(query.minPrice);
    if (query.maxPrice) where.pricePerNight.lte = Number(query.maxPrice);
  }

  if (query.guests) {
    where.maxGuests = { gte: Number(query.guests) };
  }

  if (query.bedrooms) {
    where.bedrooms = { gte: Number(query.bedrooms) };
  }

  if (query.bathrooms) {
    where.bathrooms = { gte: Number(query.bathrooms) };
  }

  if (typeof query.amenities === 'string' && query.amenities) {
    const amenities = query.amenities.split(',');
    where.amenities = { hasEvery: amenities };
  }

  if (typeof query.checkIn === 'string' && typeof query.checkOut === 'string') {
    const checkIn = new Date(query.checkIn);
    const checkOut = new Date(query.checkOut);

    where.NOT = {
      bookings: {
        some: {
          status: { in: ['PENDING', 'CONFIRMED'] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      },
    };
  }

  return where;
};

const buildPropertyOrderBy = (sortBy?: string) => {
  switch (sortBy) {
    case 'priceAsc':
      return { pricePerNight: 'asc' as const };
    case 'priceDesc':
      return { pricePerNight: 'desc' as const };
    case 'newest':
      return { createdAt: 'desc' as const };
    case 'rating':
      return { reviews: { _count: 'desc' as const } };
    default:
      return { createdAt: 'desc' as const };
  }
};

export const getProperties = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { page, limit: take, skip } = getPagination(req.query.page, req.query.limit, 12);
  const filters = req.query as PropertyQuery;

  const where = buildPropertyWhere(filters);
  const orderBy = buildPropertyOrderBy(String(filters.sortBy || ''));

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        host: {
          select: { id: true, name: true, avatar: true },
        },
        reviews: {
          select: { rating: true },
        },
        _count: {
          select: { reviews: true, bookings: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  const propertiesWithRating = properties.map(p => ({
    ...p,
    averageRating: p.reviews.length > 0
      ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
      : 0,
    reviewCount: p.reviews.length,
  }));

  res.json({
    properties: propertiesWithRating,
    pagination: {
      page,
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
});

export const getProperty = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      host: {
        select: { id: true, name: true, avatar: true, phone: true, createdAt: true },
      },
      reviews: {
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!property) {
    throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  }

  if (
    property.status !== 'ACTIVE' &&
    (!req.user || (req.user.role !== 'ADMIN' && property.hostId !== req.user.id))
  ) {
    throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  }

  const averageRating = property.reviews.length > 0
    ? property.reviews.reduce((sum, r) => sum + r.rating, 0) / property.reviews.length
    : 0;

  res.json({
    property: {
      ...property,
      averageRating,
      reviewCount: property.reviews.length,
    },
  });
});

export const getHostProperties = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'HOST' && req.user.role !== 'ADMIN')) {
    throw new AppError(403, 'Host access required', 'HOST_REQUIRED');
  }

  const { page, limit: take, skip } = getPagination(req.query.page, req.query.limit, 10);
  const { status } = req.query;

  const where: Prisma.PropertyWhereInput = { hostId: req.user.id };
  if (status) where.status = status as Prisma.EnumPropertyStatusFilter;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        _count: {
          select: { bookings: true, reviews: true },
        },
        reviews: {
          select: { rating: true },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  const propertiesWithStats = properties.map(p => ({
    ...p,
    averageRating: p.reviews.length > 0
      ? p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length
      : 0,
    reviewCount: p.reviews.length,
    bookingCount: p._count.bookings,
  }));

  res.json({
    properties: propertiesWithStats,
    pagination: {
      page: Number(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
});

export const createProperty = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'HOST' && req.user.role !== 'ADMIN')) {
    throw new AppError(403, 'Host access required', 'HOST_REQUIRED');
  }

  const {
    title,
    description,
    address,
    city,
    country,
    latitude,
    longitude,
    pricePerNight,
    maxGuests,
    bedrooms,
    bathrooms,
    amenities = [],
    images = [],
  } = req.body;

  const property = await prisma.property.create({
    data: {
      hostId: req.user.id,
      title,
      description,
      address,
      city: normalizeSearchText(city),
      country: normalizeSearchText(country),
      latitude,
      longitude,
      pricePerNight,
      maxGuests,
      bedrooms,
      bathrooms,
      amenities,
      images,
      status: 'DRAFT',
    },
  });

  res.status(201).json({ message: 'Property created', property });
});

export const updateProperty = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required', 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;
  const data = {
    ...req.body,
    ...(typeof req.body.city === 'string' ? { city: normalizeSearchText(req.body.city) } : {}),
    ...(typeof req.body.country === 'string' ? { country: normalizeSearchText(req.body.country) } : {}),
  };

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  }

  // Check ownership
  if (req.user.role !== 'ADMIN' && property.hostId !== req.user.id) {
    throw new AppError(403, 'Not authorized to update this property', 'FORBIDDEN');
  }

  const updated = await prisma.property.update({
    where: { id },
    data,
  });

  res.json({ message: 'Property updated', property: updated });
});

export const deleteProperty = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required', 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  }

  if (req.user.role !== 'ADMIN' && property.hostId !== req.user.id) {
    throw new AppError(403, 'Not authorized to delete this property', 'FORBIDDEN');
  }

  // Check for active bookings
  const activeBookings = await prisma.booking.count({
    where: {
      propertyId: id,
      status: { in: ['PENDING', 'CONFIRMED'] },
      checkOut: { gte: new Date() },
    },
  });

  if (activeBookings > 0) {
    throw new AppError(400, 'Cannot delete property with active bookings', 'ACTIVE_BOOKINGS_EXIST');
  }

  await prisma.property.delete({ where: { id } });

  res.json({ message: 'Property deleted' });
});

export const checkAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { checkIn, checkOut } = req.query;

  if (!checkIn || !checkOut) {
    throw new AppError(400, 'Check-in and check-out dates required', 'DATES_REQUIRED');
  }

  const checkInDate = new Date(checkIn as string);
  const checkOutDate = new Date(checkOut as string);

  if (checkInDate >= checkOutDate) {
    throw new AppError(400, 'Check-out must be after check-in', 'INVALID_DATES');
  }

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  }

  const conflictingBookings = await prisma.booking.count({
    where: {
      propertyId: id,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        {
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      ],
    },
  });

  const available = conflictingBookings === 0;

  res.json({
    available,
    propertyId: id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
  });
});

export const propertyController = {
  getProperties,
  getProperty,
  getHostProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  checkAvailability,
};