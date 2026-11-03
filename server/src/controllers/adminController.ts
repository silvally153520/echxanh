import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { Prisma } from '@prisma/client';
import { getPagination } from '../utils/pagination';

export const getAdminStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required', 'ADMIN_REQUIRED');
  }

  const [
    totalUsers,
    totalProperties,
    totalBookings,
    totalRevenue,
    recentUsers,
    recentBookings,
    propertiesByStatus,
    bookingsByStatus,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.booking.count(),
    prisma.booking.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalPrice: true },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true } },
      },
    }),
    prisma.property.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.booking.groupBy({
      by: ['status'],
      _count: true,
    }),
  ]);

  // Monthly revenue for the last 12 months
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const monthlyRevenue = await prisma.booking.groupBy({
    by: ['checkOut'],
    where: {
      status: 'COMPLETED',
      checkOut: { gte: twelveMonthsAgo },
    },
    _sum: { totalPrice: true },
  });

  const revenueByMonth: Record<string, number> = {};
  monthlyRevenue.forEach(m => {
    const month = m.checkOut.toISOString().slice(0, 7);
    revenueByMonth[month] = (revenueByMonth[month] || 0) + (m._sum.totalPrice || 0);
  });

  res.json({
    stats: {
      totalUsers,
      totalProperties,
      totalBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    },
    recentUsers,
    recentBookings,
    propertiesByStatus: propertiesByStatus.map(p => ({ status: p.status, count: p._count })),
    bookingsByStatus: bookingsByStatus.map(b => ({ status: b.status, count: b._count })),
    monthlyRevenue: Object.entries(revenueByMonth)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month)),
  });
});

export const getAdminUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required', 'ADMIN_REQUIRED');
  }

  const { page, limit: take, skip } = getPagination(req.query.page, req.query.limit, 20, 100);
  const { search, role, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

  const where: Prisma.UserWhereInput = {};
  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { name: { contains: search as string, mode: 'insensitive' } },
    ];
  }
  if (role) where.role = role as Prisma.EnumRoleFilter;

  const orderBy: Prisma.UserOrderByWithRelationInput = {
    [sortBy as string]: sortOrder,
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
        emailVerified: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: { properties: true, bookings: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    users,
    pagination: {
      page: Number(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
});

export const updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required', 'ADMIN_REQUIRED');
  }

  const { id } = req.params;
  const { role } = req.body;

  if (id === req.user.id) {
    throw new AppError(400, 'Cannot change your own role', 'CANNOT_CHANGE_OWN_ROLE');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  });

  res.json({ message: 'User role updated', user: updated });
});

export const toggleUserBan = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required', 'ADMIN_REQUIRED');
  }

  const { id } = req.params;

  if (id === req.user.id) {
    throw new AppError(400, 'Cannot ban yourself', 'CANNOT_BAN_SELF');
  }

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { isBanned: !user.isBanned },
    select: { id: true, email: true, name: true, role: true, isBanned: true },
  });

  if (updated.isBanned) {
    await prisma.refreshToken.deleteMany({ where: { userId: id } });
  }

  res.json({ message: updated.isBanned ? 'User banned' : 'User unbanned', user: updated });
});

export const getAdminProperties = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required', 'ADMIN_REQUIRED');
  }

  const { page, limit: take, skip } = getPagination(req.query.page, req.query.limit, 20, 100);
  const { status, search } = req.query;

  const where: Prisma.PropertyWhereInput = {};
  if (status) where.status = status as Prisma.EnumPropertyStatusFilter;
  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: 'insensitive' } },
      { address: { contains: search as string, mode: 'insensitive' } },
      { city: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        host: { select: { id: true, name: true, email: true } },
        _count: { select: { bookings: true, reviews: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  res.json({
    properties,
    pagination: {
      page: Number(page),
      limit: take,
      total,
      totalPages: Math.ceil(total / take),
    },
  });
});

export const updatePropertyStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required', 'ADMIN_REQUIRED');
  }

  const { id } = req.params;
  const { status } = req.body;

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) {
    throw new AppError(404, 'Property not found', 'PROPERTY_NOT_FOUND');
  }

  const updated = await prisma.property.update({
    where: { id },
    data: { status },
    include: { host: { select: { id: true, name: true, email: true } } },
  });

  res.json({ message: 'Property status updated', property: updated });
});

export const getAdminBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required', 'ADMIN_REQUIRED');
  }

  const { page, limit: take, skip } = getPagination(req.query.page, req.query.limit, 20, 100);
  const { status } = req.query;

  const where: Prisma.BookingWhereInput = {};
  if (status) where.status = status as Prisma.EnumBookingStatusFilter;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: { select: { id: true, name: true, email: true } },
        property: { select: { id: true, title: true, hostId: true } },
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

export const getAdminRevenue = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    throw new AppError(403, 'Admin access required', 'ADMIN_REQUIRED');
  }

  const { startDate, endDate, groupBy = 'month' } = req.query;

  const where: Prisma.BookingWhereInput = { status: 'COMPLETED' };
  if (startDate || endDate) {
    where.checkOut = {};
    if (startDate) where.checkOut.gte = new Date(startDate as string);
    if (endDate) where.checkOut.lte = new Date(endDate as string);
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      property: { select: { pricePerNight: true } },
    },
    orderBy: { checkOut: 'asc' },
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);
  const totalBookings = bookings.length;

  // Group by period
  const grouped: Record<string, { revenue: number; bookings: number }> = {};
  bookings.forEach(b => {
    let key: string;
    const date = b.checkOut;
    if (groupBy === 'day') {
      key = date.toISOString().slice(0, 10);
    } else if (groupBy === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      key = weekStart.toISOString().slice(0, 10);
    } else {
      key = date.toISOString().slice(0, 7); // month
    }
    if (!grouped[key]) grouped[key] = { revenue: 0, bookings: 0 };
    grouped[key].revenue += b.totalPrice;
    grouped[key].bookings += 1;
  });

  const chartData = Object.entries(grouped)
    .map(([period, data]) => ({ period, ...data }))
    .sort((a, b) => a.period.localeCompare(b.period));

  res.json({
    totalRevenue,
    totalBookings,
    averageBookingValue: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
    chartData,
  });
});

export const adminController = {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  toggleUserBan,
  getAdminProperties,
  updatePropertyStatus,
  getAdminBookings,
  getAdminRevenue,
};