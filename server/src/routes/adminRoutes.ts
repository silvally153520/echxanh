import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { validate } from '../middleware/validate';
import {
  adminUpdatePropertyStatusSchema,
  adminUpdateUserSchema,
  adminUserParamsSchema,
} from '../validations/schemas';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticate, authorize('ADMIN'));

// Dashboard stats
router.get('/stats', adminController.getAdminStats);

// User management
router.get('/users', adminController.getAdminUsers);
router.put('/users/:id/role', validate(adminUpdateUserSchema), adminController.updateUserRole);
router.put('/users/:id/ban', validate(adminUserParamsSchema), adminController.toggleUserBan);

// Property management
router.get('/properties', adminController.getAdminProperties);
router.put('/properties/:id/status', validate(adminUpdatePropertyStatusSchema), adminController.updatePropertyStatus);

// Booking management
router.get('/bookings', adminController.getAdminBookings);

// Revenue analytics
router.get('/revenue', adminController.getAdminRevenue);

export default router;