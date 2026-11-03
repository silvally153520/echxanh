import { Router } from 'express';
import { propertyController } from '../controllers/propertyController';
import { validate } from '../middleware/validate';
import {
  createPropertySchema,
  updatePropertySchema,
  getPropertiesSchema,
} from '../validations/schemas';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', validate(getPropertiesSchema), propertyController.getProperties);
router.get('/:id', optionalAuth, propertyController.getProperty);
router.get('/:id/availability', propertyController.checkAvailability);

// Protected routes - Host/Admin
router.get('/host/me', authenticate, authorize('HOST', 'ADMIN'), propertyController.getHostProperties);
router.post('/', authenticate, authorize('HOST', 'ADMIN'), validate(createPropertySchema), propertyController.createProperty);
router.put('/:id', authenticate, authorize('HOST', 'ADMIN'), validate(updatePropertySchema), propertyController.updateProperty);
router.delete('/:id', authenticate, authorize('HOST', 'ADMIN'), propertyController.deleteProperty);

export default router;