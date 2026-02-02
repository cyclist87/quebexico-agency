# QUEBEXICO - Creative Agency Portfolio

## Overview

QUEBEXICO is a multilingual creative agency portfolio website built with a modern full-stack TypeScript architecture. The application showcases agency services, portfolio projects, and provides contact/newsletter functionality. It supports three languages (French, English, Spanish) with French as the default.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack React Query for server state, React Context for language preferences
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for page transitions and scroll animations
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Build Tool**: Vite with path aliases (@/, @shared/, @assets/)

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: REST endpoints defined in shared/routes.ts with Zod schema validation
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Storage**: connect-pg-simple for PostgreSQL-backed sessions

### Data Layer
- **Database**: PostgreSQL (requires DATABASE_URL environment variable)
- **Schema Location**: shared/schema.ts using Drizzle table definitions
- **Migrations**: Drizzle Kit with output to ./migrations directory
- **Tables**: messages (contact form), subscribers (newsletter), projects (portfolio items)

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database table definitions and Zod insert schemas
- `routes.ts`: API contract with method, path, input validation, and response schemas

### Build System
- **Development**: tsx for running TypeScript directly
- **Production Build**: Custom script using esbuild (server) + Vite (client)
- **Output**: dist/index.cjs (server) + dist/public/ (static assets)

### Key Design Decisions
1. **Type-safe API contracts**: Shared route definitions ensure frontend and backend stay in sync
2. **Multilingual support**: Translations stored in client/src/lib/translations.ts with LanguageContext provider
3. **Component architecture**: Presentation components in components/, pages in pages/, hooks in hooks/
4. **Static serving in production**: Express serves built client assets with SPA fallback

### Multilingual Localization System
The application uses a two-layer localization approach for complete FR/EN/ES support:

**Layer 1: Profile Content (useProfileLocalization)**
- `shared/localization.ts`: Defines LocalizedString/LocalizedArray types and helper functions
- Profile content (names, descriptions, portfolio items) uses `{ fr: "...", en: "...", es: "..." }` objects
- Components use `const { getText, getArray } = useProfileLocalization()` to extract current language value

**Layer 2: UI Labels (useLanguage)**
- `client/src/lib/translations.ts`: Contains all UI translations organized by section
- Demo-specific UI strings live under `translations.demo.*` (profileTypes, buttons, cta, footer, sponsors, calendar, properties)
- Components use `const { t, language } = useLanguage()` to access UI strings

**Key Files:**
- `shared/localization.ts`: LocalizedString type, getText/getArray helpers
- `shared/demo-profiles.ts`: Profile configs with localized content
- `client/src/lib/translations.ts`: All UI translations (includes `demo` section)
- `client/src/hooks/use-profile-localization.ts`: Hook for extracting profile content
- `client/src/contexts/LanguageContext.tsx`: Language state management and useLanguage hook

**Date Formatting:**
- CalendarSection uses date-fns with locale-aware formatting (fr/enUS/es locales)

### Client Tools (Value-Added Services)
The template system includes standalone tools that can be offered to clients:

**Email Signature Generator** (`/tools/signature`)
- Form-based editor with 4 templates: Modern, Classic, Minimal, Bold
- Customizable colors, social links, photo support
- Real-time preview with copy-to-clipboard and HTML download
- Instructions for Gmail, Outlook, Apple Mail
- File: `client/src/pages/tools/EmailSignature.tsx`

**Digital Business Card** (`/tools/carte`)
- QR code generator using qrcode.react library
- Generates vCard (.vcf) files for instant contact import
- Customizable profile card preview with theming
- Share via native Web Share API or link copy
- QR code downloads as PNG for printing
- File: `client/src/pages/tools/DigitalCard.tsx`

### Autonomous STR (Short-Term Rental) System
The application includes a complete autonomous property management and booking system that operates 100% independently without external dependencies.

**Database Tables (shared/schema.ts):**
- `properties`: Property listings with multilingual fields (nameFr/En/Es, descriptionFr/En/Es, amenitiesFr/En/Es, etc.)
- `blocked_dates`: Calendar blocking for unavailable dates
- `reservations`: Guest reservations with confirmation codes (QBX-{timestamp}-{random})
- `inquiries`: Pre-booking inquiries

**API Routes (server/routes.ts):**
- Public: GET /api/properties, GET /api/properties/:slug, GET /api/properties/:slug/availability, GET /api/properties/:slug/pricing, POST /api/reservations, POST /api/inquiries
- Admin: CRUD /api/admin/properties/*, GET/POST/DELETE /api/admin/blocked-dates, GET/PUT /api/admin/reservations

**Frontend Pages:**
- `/properties` - Public listing of all active properties
- `/properties/:slug` - Property detail with booking calendar and instant reservation
- `/admin/properties` - Admin property list with links to editor
- `/admin/properties/:id/edit` - Full-page property editor with 7 tabs (General, Languages, Location, Details, Photos, Rules, Calendar) and completion indicators

**Key Components:**
- `BookingFlowLocal.tsx`: Complete booking workflow with multilingual support (FR/EN/ES)
- `PricingBreakdown.tsx`: Dynamic pricing calculator with service fees and taxes
- `AvailabilityCalendar.tsx`: Visual calendar showing blocked dates

**Hooks (client/src/hooks/use-properties.ts):**
- useProperties, useProperty, usePropertyAvailability, usePropertyPricing
- useCreateReservation, useCreateInquiry
- useAdminProperties, useCreateProperty, useUpdateProperty, useDeleteProperty
- useAdminBlockedDates, useCreateBlockedDate, useDeleteBlockedDate
- useAdminReservations, useAdminInquiries

**Pricing Logic:**
- Service fee: Configurable (default 10%)
- Taxes: Configurable (default 15%)
- Cleaning fee: Per-property setting
- Min/max nights validation per property

**Multilingual Property Fields:**
- Names, descriptions, addresses: Separate columns for FR/EN/ES
- Amenities, house rules: Array fields per language
- Access codes: Separate columns for localized instructions

**iCal Calendar Synchronization:**
- Export: GET /api/properties/:slug/calendar.ics - Share with Airbnb, Booking.com, etc.
- Import: POST /api/admin/properties/:id/sync-ical - Sync external calendars as blocked dates
- Properties can store icalUrl field for configuring external calendar sync URLs
- Date Convention: ALL end dates stored as EXCLUSIVE (iCal RFC 5545 standard)
  - Manual blocks: User enters inclusive → +1 day before storage
  - iCal import: Stores exclusive dates as-is
  - iCal export: Uses stored exclusive dates directly
  - Admin UI: Subtracts 1 day for inclusive display to users
  - Availability API: Returns exclusive dates for booking logic
  - Server validates conflicts using exclusive comparison: `checkIn < blocked.endDate && checkOut > blocked.startDate`

### Modular Admin Architecture
The admin dashboard uses a modular architecture that dynamically shows features based on the selected template type.

**Key Files:**
- `client/src/contexts/TemplateContext.tsx`: Defines 5 template types (str, freelancer, sports_club, cleaning, agency) with feature lists
- `client/src/lib/admin-modules.ts`: Module registry mapping features to icons, routes, and translations
- `client/src/components/admin/AdminShell.tsx`: Sidebar layout with dynamic navigation based on active template

**Template Types:**
- STR (Short-term rental): properties, reservations, coupons
- Freelancer, Sports Club, Cleaning, Agency: coupons (other modules deferred for future)

**Admin Routes:**
- `/admin` - Dashboard overview
- `/admin/properties` - Property management (STR only)
- `/admin/reservations` - Reservation management (STR only)
- `/admin/coupons` - Coupon/promotion system (all templates)
- `/admin/content` - Content sections editor (all templates)
- `/admin/appearance` - Site appearance settings (all templates)
- `/admin/integrations` - Third-party integrations (all templates)
- `/admin/tools` - Value-added tools (all templates)
- `/admin/settings` - General settings (all templates)
- `/admin/super` - Super Admin module configuration (all templates)

**Design Principles:**
- Template configs only list features with implemented routes to prevent broken navigation
- Modules use `templates: "all"` for cross-template features (e.g., coupons)
- Template selection persists to localStorage
- Future modules should be added alongside their routes/components

### Email Confirmation System
Transactional emails are sent via Resend after successful reservations.

**Key Files:**
- `server/email.ts`: Email service with HTML templates for FR/EN/ES
- `server/routes.ts`: Sends confirmation after reservation creation (non-blocking)

**Features:**
- Language validation: Normalizes input and defaults to 'fr' for invalid codes
- Email includes: reservation details, pricing breakdown, coupon discounts
- Sending is non-blocking (uses .catch) to not delay API responses

### CMS System (Content Management)
The application includes a CMS system for managing site appearance and content sections.

**Database Tables (shared/schema.ts):**
- `siteConfig`: Global settings (logo, colors, fonts, contact info, social links, SEO meta, footer text)
- `contentSections`: Multilingual editable sections (hero, about, services, etc.) with enable/disable, ordering

**API Routes (server/routes.ts):**
- Public: `GET /api/site-config`, `GET /api/content-sections`
- Admin: `PUT /api/admin/site-config`, CRUD `/api/admin/content-sections/*`

**Admin Pages:**
- `/admin/appearance` - Logo, colors, fonts, footer text (multilingual)
- `/admin/content` - Create/edit/delete content sections with multilingual fields

**Frontend Hooks (client/src/hooks/):**
- `useSiteConfig()`: Returns site configuration with helper methods for multilingual fields
- `useContentSections()`: Returns content sections ordered by index
- `useContentSection(type)`: Returns specific section with helper methods (getTitle, getContent, etc.)

**Key Features:**
- All modules available across all template types (in COMMON_FEATURES)
- Multilingual support (FR/EN/ES) for all text fields
- Section types: hero, about, services, portfolio, testimonials, contact, cta, features, custom
- Toggle sections on/off without deleting
- Order sections by index

### Direct Site Integration
- **Purpose**: Site de réservation directe — connexion à l’API quebexico.com (config, propriétés, disponibilités, tarifs, réservations).
- **Status**: Variables d’environnement `DIRECT_SITE_API_URL` et `DIRECT_SITE_API_KEY` (clé du site direct créé sur quebexico.com).
- **Components**: PropertyCard, AvailabilityCalendar in `client/src/components/booking/`

## External Dependencies

### Database
- **PostgreSQL**: Required, connection via DATABASE_URL environment variable
- **Drizzle ORM**: Schema management and queries
- **connect-pg-simple**: Session storage in PostgreSQL

### UI Libraries
- **Radix UI**: Accessible component primitives (dialog, dropdown, tabs, etc.)
- **shadcn/ui**: Pre-styled component variants
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel/slider functionality

### Build & Development
- **Vite**: Frontend bundler with HMR
- **esbuild**: Server bundling for production
- **Tailwind CSS**: Utility-first styling with PostCSS

### Validation
- **Zod**: Schema validation for forms and API requests
- **drizzle-zod**: Generate Zod schemas from Drizzle table definitions