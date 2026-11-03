import { Router } from 'express';
import { bookingController } from '../controllers/bookingController';
import { validate } from '../middleware/validate';
import { createBookingSchema } from '../validations/schemas';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// User bookings (protected)
router.get('/', authenticate, bookingController.getBookings);
router.get('/:id', authenticate, bookingController.getBooking);
router.post('/', authenticate, validate(createBookingSchema), bookingController.createBooking);
router.put('/:id/cancel', authenticate, bookingController.cancelBooking);

// Host/Admin booking management
router.put('/:id/confirm', authenticate, authorize('HOST', 'ADMIN'), bookingController.confirmBooking);
router.put('/:id/complete', authenticate, authorize('HOST', 'ADMIN'), bookingController.completeBooking);

// Host routes
router.get('/host/me', authenticate, authorize('HOST', 'ADMIN'), bookingController.getHostBookings);
router.get('/host/earnings', authenticate, authorize('HOST', 'ADMIN'), bookingController.getHostEarnings);

export default router;