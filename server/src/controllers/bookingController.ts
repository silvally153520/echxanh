import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { Prisma } from '@prisma/client';
import { getPagination } from '../utils/pagination';

const calculateTotalPrice = (pricePerNight: number, checkIn: Date, checkOut: Date): number => {
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  return pricePerNight * nights;
};

export const getBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required', 'NOT_AUTHENTICATED');
  }

  const { page, limit: take, skip } = getPagination(req.query.page, req.query.limit, 10);
  const { status } = req.query;

  const where: Prisma.BookingWhereInput = { userId: req.user.id };
  if (status) where.status = status as Prisma.EnumBookingStatusFilter;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            images: true,
            city: true,
            country: true,
            pricePerNight: true,
            host: {
              select: { id: true, name: true, avatar: true, phone: true },
            },
          },
        },
        review: {
          select: { id: true, rating: true },
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  res.json({
    bookings,
    pagination: {
      page: Number(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
});

export const getBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required', 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          host: {
            select: { id: true, name: true, avatar: true, phone: true, email: true },
          },
        },
      },
      user: {
        select: { id: true, name: true, email: true, phone: true, avatar: true },
      },
      review: true,
    },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
  }

  // Check authorization: user owns booking, or is host of property, or admin
  const isOwner = booking.userId === req.user.id;
  const isHost = booking.property.hostId === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isOwner && !isHost && !isAdmin) {
    throw new AppError(403, 'Not authorized to view this booking', 'FORBIDDEN');
  }

  res.json({ booking });
});

export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required', 'NOT_AUTHENTICATED');
  }

  const { propertyId, checkIn, checkOut, guests } = req.body;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Validate dates
  if (checkInDate >= checkOutDate) {
    throw new AppError(400, 'Check-out must be after check-in', 'INVALID_DATES');
  }

  if (checkInDate < new Date()) {
    throw new AppError(400, 'Check-in cannot be in the past', 'INVALID_CHECK_IN');
  }

  // Get property
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      host: { select: { id: true } },
    },
  });

  if (!property) {
    throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  }

  if (property.status !== 'ACTIVE') {
    throw new AppError(400, 'Property is not available for booking', 'PROPERTY_NOT_ACTIVE');
  }

  // Check if user is trying to book their own property
  if (property.hostId === req.user.id) {
    throw new AppError(400, 'Cannot book your own property', 'OWN_PROPERTY');
  }

  // Check guest capacity
  if (guests > property.maxGuests) {
    throw new AppError(400, `Maximum ${property.maxGuests} guests allowed`, 'GUEST_LIMIT_EXCEEDED');
  }

  // Check availability
  const conflictingBookings = await prisma.booking.count({
    where: {
      propertyId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        {
          checkIn: { lt: checkOutDate },
          checkOut: { gt: checkInDate },
        },
      ],
    },
  });

  if (conflictingBookings > 0) {
    throw new AppError(409, 'Property not available for selected dates', 'NOT_AVAILABLE');
  }

  // Calculate total price
  const totalPrice = calculateTotalPrice(property.pricePerNight, checkInDate, checkOutDate);

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      userId: req.user.id,
      propertyId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      status: 'PENDING',
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          images: true,
          city: true,
          country: true,
          host: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });

  res.status(201).json({ message: 'Booking created', booking });
});

export const cancelBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    throw new AppError(401, 'Authentication required', 'NOT_AUTHENTICATED');
  }

  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      property: { select: { hostId: true } },
    },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
  }

  // Check authorization: user owns booking, or is host of property, or admin
  const isOwner = booking.userId === req.user.id;
  const isHost = booking.property.hostId === req.user.id;
  const isAdmin = req.user.role === 'ADMIN';

  if (!isOwner && !isHost && !isAdmin) {
    throw new AppError(403, 'Not authorized to cancel this booking', 'FORBIDDEN');
  }

  // Check if booking can be cancelled
  if (booking.status === 'CANCELLED') {
    throw new AppError(400, 'Booking already cancelled', 'ALREADY_CANCELLED');
  }

  if (booking.status === 'COMPLETED') {
    throw new AppError(400, 'Cannot cancel completed booking', 'CANNOT_CANCEL_COMPLETED');
  }

  if (booking.checkIn <= new Date()) {
    throw new AppError(400, 'Cannot cancel booking that has already started', 'CANNOT_CANCEL_STARTED');
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: {
      property: {
        select: { id: true, title: true, images: true, city: true, country: true },
      },
    },
  });

  res.json({ message: 'Booking cancelled', booking: updated });
});

export const confirmBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'HOST' && req.user.role !== 'ADMIN')) {
    throw new AppError(403, 'Host access required', 'HOST_REQUIRED');
  }

  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { property: { select: { hostId: true } } },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
  }

  if (req.user.role !== 'ADMIN' && booking.property.hostId !== req.user.id) {
    throw new AppError(403, 'Not authorized to confirm this booking', 'FORBIDDEN');
  }

  if (booking.status !== 'PENDING') {
    throw new AppError(400, 'Only pending bookings can be confirmed', 'INVALID_STATUS');
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'CONFIRMED' },
    include: {
      property: { select: { id: true, title: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  // TODO: Send confirmation email to user

  res.json({ message: 'Booking confirmed', booking: updated });
});

export const completeBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'HOST' && req.user.role !== 'ADMIN')) {
    throw new AppError(403, 'Host access required', 'HOST_REQUIRED');
  }

  const { id } = req.params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { property: { select: { hostId: true } } },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found', 'BOOKING_NOT_FOUND');
  }

  if (req.user.role !== 'ADMIN' && booking.property.hostId !== req.user.id) {
    throw new AppError(403, 'Not authorized to complete this booking', 'FORBIDDEN');
  }

  if (booking.status !== 'CONFIRMED') {
    throw new AppError(400, 'Only confirmed bookings can be completed', 'INVALID_STATUS');
  }

  if (booking.checkOut > new Date()) {
    throw new AppError(400, 'Cannot complete booking before check-out date', 'CHECKOUT_NOT_PASSED');
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: 'COMPLETED' },
  });

  res.json({ message: 'Booking completed', booking: updated });
});

// Host bookings
export const getHostBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'HOST' && req.user.role !== 'ADMIN')) {
    throw new AppError(403, 'Host access required', 'HOST_REQUIRED');
  }

  const { page, limit: take, skip } = getPagination(req.query.page, req.query.limit, 10);
  const { status } = req.query;

  // Get host's property IDs
  const propertyIds = await prisma.property.findMany({
    where: { hostId: req.user.id },
    select: { id: true },
  });

  const ids = propertyIds.map(p => p.id);

  const where: Prisma.BookingWhereInput = {
    propertyId: { in: ids },
  };
  if (status) where.status = status as Prisma.EnumBookingStatusFilter;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        property: {
          select: { id: true, title: true, images: true, city: true, country: true },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  res.json({
    bookings,
    pagination: {
      page: Number(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
});

// Host earnings
export const getHostEarnings = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || (req.user.role !== 'HOST' && req.user.role !== 'ADMIN')) {
    throw new AppError(403, 'Host access required', 'HOST_REQUIRED');
  }

  const { startDate, endDate } = req.query;

  const propertyIds = await prisma.property.findMany({
    where: { hostId: req.user.id },
    select: { id: true },
  });

  const ids = propertyIds.map(p => p.id);

  const where: Prisma.BookingWhereInput = {
    propertyId: { in: ids },
    status: 'COMPLETED',
  };

  if (startDate || endDate) {
    where.checkOut = {};
    if (startDate) where.checkOut.gte = new Date(startDate as string);
    if (endDate) where.checkOut.lte = new Date(endDate as string);
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      property: { select: { id: true, title: true, pricePerNight: true } },
    },
    orderBy: { checkOut: 'desc' },
  });

  const totalEarnings = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalBookings = bookings.length;
  const averagePerBooking = totalBookings > 0 ? totalEarnings / totalBookings : 0;

  // Monthly breakdown
  const monthlyEarnings: Record<string, number> = {};
  bookings.forEach(b => {
    const month = b.checkOut.toISOString().slice(0, 7); // YYYY-MM
    monthlyEarnings[month] = (monthlyEarnings[month] || 0) + b.totalPrice;
  });

  res.json({
    totalEarnings,
    totalBookings,
    averagePerBooking: Math.round(averagePerBooking),
    monthlyEarnings: Object.entries(monthlyEarnings)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    bookings: bookings.map(b => ({
      id: b.id,
      propertyTitle: b.property.title,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guests: b.guests,
      totalPrice: b.totalPrice,
    })),
  });
});

export const bookingController = {
  getBookings,
  getBooking,
  createBooking,
  cancelBooking,
  confirmBooking,
  completeBooking,
  getHostBookings,
  getHostEarnings,
};