# sieuechxanh - Full-Stack Booking Platform Specification

## Project Overview
A complete booking platform similar to Airbnb/sieuechxanh with user authentication, property listings, booking management, host dashboard, and admin panel.

## Tech Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (access + refresh tokens) with bcrypt
- **Validation**: Zod
- **File Upload**: Multer + Cloudinary (or local storage)
- **Email**: Nodemailer (for password reset, booking confirmations)

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: TanStack Query (React Query) + Zustand
- **Forms**: React Hook Form + Zod
- **UI Components**: Headless UI / Radix UI + custom components
- **Date Handling**: date-fns
- **Maps**: Leaflet / React Leaflet
- **Icons**: Lucide React

## Database Schema (Prisma)

```prisma
enum Role {
  USER
  HOST
  ADMIN
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}

enum PropertyStatus {
  DRAFT
  ACTIVE
  INACTIVE
}

enum PropertyCategory {
  HOTEL
  RESORT
  VILLA
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  name          String
  role          Role      @default(USER)
  avatar        String?
  phone         String?
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  properties    Property[]
  bookings      Booking[]
  reviews       Review[]
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Property {
  id              String        @id @default(cuid())
  hostId          String
  host            User          @relation(fields: [hostId], references: [id], onDelete: Cascade)
  title           String
  description     String
  address         String
  city            String
  country         String
  latitude        Float
  longitude       Float
  pricePerNight   Int           // in cents/VND
  maxGuests       Int
  bedrooms        Int
  bathrooms       Int
  category        PropertyCategory @default(HOTEL)
  amenities       String[]      // array of amenity IDs
  images          String[]      // array of image URLs
  status          PropertyStatus @default(DRAFT)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  bookings        Booking[]
  reviews         Review[]
}

model Booking {
  id            String        @id @default(cuid())
  userId        String
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  propertyId    String
  property      Property      @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  checkIn       DateTime
  checkOut      DateTime
  guests        Int
  totalPrice    Int           // in cents/VND
  status        BookingStatus @default(PENDING)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  review        Review?
}

model Review {
  id          String   @id @default(cuid())
  bookingId   String   @unique
  booking     Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  propertyId  String
  property    Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  rating      Int      // 1-5
  comment     String?
  createdAt   DateTime @default(now())
}

model Amenity {
  id    String    @id @default(cuid())
  name  String    @unique
  icon  String
}
```

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | Public |
| POST | /api/auth/login | Login user | Public |
| POST | /api/auth/refresh | Refresh access token | Public (refresh token) |
| POST | /api/auth/logout | Logout user | Private |
| GET | /api/auth/me | Get current user | Private |
| POST | /api/auth/forgot-password | Request password reset | Public |
| POST | /api/auth/reset-password | Reset password | Public |
| POST | /api/auth/verify-email | Verify email | Public |

### Properties
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/properties | List properties (filterable by category: HOTEL, RESORT, VILLA) | Public |
| GET | /api/properties/:id | Get property details | Public |
| GET | /api/properties/:id/availability | Check availability | Public |
| POST | /api/properties | Create property | Host/Admin |
| PUT | /api/properties/:id | Update property | Host/Admin (owner) |
| DELETE | /api/properties/:id | Delete property | Host/Admin (owner) |
| GET | /api/properties/host/me | Get host's properties | Host |

### Bookings
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/bookings | Get user's bookings | Private |
| GET | /api/bookings/:id | Get booking details | Private (owner/host/admin) |
| POST | /api/bookings | Create booking | Private |
| PUT | /api/bookings/:id/cancel | Cancel booking | Private (owner/host/admin) |
| PUT | /api/bookings/:id/confirm | Confirm booking | Host/Admin |
| PUT | /api/bookings/:id/complete | Complete booking | Host/Admin |

### Host Dashboard
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/bookings/host/me | Host's property bookings | Host |
| GET | /api/bookings/host/earnings | Host earnings report | Host |
| GET | /api/properties/host/me | Host's properties | Host |

### Admin Panel
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/admin/stats | Platform statistics | Admin |
| GET | /api/admin/users | List all users | Admin |
| PUT | /api/admin/users/:id/role | Update user role | Admin |
| PUT | /api/admin/users/:id/ban | Ban/unban user | Admin |
| GET | /api/admin/properties | All properties | Admin |
| PUT | /api/admin/properties/:id/status | Update property status | Admin |
| GET | /api/admin/bookings | All bookings | Admin |
| GET | /api/admin/revenue | Revenue analytics | Admin |

## Frontend Pages & Routes

### Public Routes
- `/` - Home page with hero, featured properties, search
- `/properties` - Properties listing with filters/sort
- `/properties/:id` - Property detail with booking widget
- `/login` - Login page
- `/register` - Register page
- `/forgot-password` - Forgot password
- `/reset-password/:token` - Reset password
- `/verify-email/:token` - Email verification

### User Routes (Protected)
- `/dashboard` - User dashboard with upcoming/past bookings
- `/dashboard/bookings/:id` - Booking detail
- `/profile` - User profile settings
- `/settings` - Account settings

### Host Routes (Protected, Host/Admin only)
- `/host` - Host dashboard with stats
- `/host/properties` - Manage properties (list, create, edit)
- `/host/properties/new` - Create new property
- `/host/properties/:id/edit` - Edit property
- `/host/bookings` - Manage bookings
- `/host/earnings` - Earnings & payouts

### Admin Routes (Protected, Admin only)
- `/admin` - Admin dashboard with overview stats
- `/admin/users` - User management
- `/admin/properties` - Property management
- `/admin/bookings` - Booking management
- `/admin/analytics` - Revenue & platform analytics

## UI/UX Requirements

### Design System
- **Colors**: 
  - Primary: Teal/Emerald (#0d9488, #14b8a6)
  - Secondary: Slate/Gray
  - Success: Green (#16a34a)
  - Warning: Amber (#f59e0b)
  - Error: Red (#dc2626)
- **Typography**: Inter font family
- **Spacing**: 4px base unit
- **Border Radius**: 8px (cards), 12px (modals), 4px (inputs)
- **Shadows**: Subtle elevation system

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Key Components
1. **Navbar** - Logo, search, auth/user menu, host/admin links
2. **Property Card** - Image, title, location, price, rating, favorite button
3. **Property Detail** - Gallery, info, amenities, host info, reviews, booking widget
4. **Booking Widget** - Date picker, guest selector, price breakdown, book button
5. **Dashboard Cards** - Stats, booking cards, property cards
6. **Forms** - Consistent styling with validation messages
7. **Modals** - Confirmation, image gallery, login/register
8. **Tables** - Sortable, filterable, paginated (admin/host)

## Security Considerations
- Password hashing with bcrypt (cost factor 12)
- JWT tokens: Access (15min), Refresh (7 days)
- Rate limiting on auth endpoints
- CORS configuration
- Helmet.js for security headers
- Input validation with Zod
- SQL injection prevention via Prisma
- XSS prevention via React's built-in escaping
- File upload validation (type, size)
- Role-based access control (RBAC)

## Development Phases

### Phase 1: Project Setup & Backend Core
1. Initialize monorepo structure (client/server)
2. Set up PostgreSQL + Prisma
3. Implement auth system (register, login, JWT, refresh)
4. Create base middleware (auth, validation, error handling)

### Phase 2: Properties & Bookings API
1. Property CRUD endpoints
2. Search/filter endpoints
3. Booking CRUD endpoints
4. Availability checking

### Phase 3: Frontend Foundation
1. Set up React + Vite + Tailwind
2. Create design system components
3. Implement routing & layout
4. Build auth pages & flow

### Phase 4: Core Features Frontend
1. Home page & property listing
2. Property detail with booking
3. User dashboard
4. Booking flow

### Phase 5: Host & Admin Panels
1. Host dashboard & property management
2. Host bookings & earnings
3. Admin dashboard & user management
4. Admin analytics

### Phase 6: Polish & Deploy
1. Email notifications
2. Image upload optimization
3. Map integration
4. Testing & bug fixes
5. Deployment configuration

## Running the implementation

1. Create a Supabase project. In its **Connect** dialog, copy the **Session pooler** URI (port 5432) to `DATABASE_URL` in `server/.env`, and the **Direct connection** URI to `DIRECT_URL`. If your network cannot reach the direct host, use the Session pooler URI for both. Replace `[PASSWORD]` with the database password from the Supabase project; percent-encode special characters in the password. Also set JWT secrets. Copy `client/.env.example` to `client/.env` if the API is not running on the default local URL.
2. Install dependencies from the repository root with `npm install`.
3. Generate the Prisma client and apply the schema to Supabase with `npm run db:generate` and `npm run db:push`.
4. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`, then run `npm run db:seed` to create or promote the initial administrator.
5. Start both applications with `npm run dev`. The client is available at `http://localhost:5173` and the API health check at `http://localhost:3001/api/health`.

The client includes public property search/detail pages, account and booking management, Host property/booking/revenue pages, and Admin user/property/booking/analytics pages. Admins can promote users to Host, and banned users lose access to authenticated endpoints. Password-reset links are logged locally when email credentials are unset; configure the `EMAIL_*` settings to deliver them by email.

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:pass@localhost:5432/localvibe"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_ACCESS_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
CLOUDINARY_CLOUD_NAME="your-cloud"
CLOUDINARY_API_KEY="your-key"
CLOUDINARY_API_SECRET="your-secret"
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:3001/api"
VITE_MAPBOX_TOKEN="your-mapbox-token"
```

## File Structure
```
localvibe/
├── client/                 # Frontend React app
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── contexts/       # React contexts
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── styles/         # Global styles
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── server/                 # Backend Express app
│   ├── src/
│   │   ├── config/         # Configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── models/         # Prisma models (generated)
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   ├── validations/    # Zod schemas
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── tsconfig.json
├── package.json            # Root package.json (workspaces)
└── README.md
```