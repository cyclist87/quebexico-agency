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

### HostPro Integration (Short-Term Rental Booking)
- **Purpose**: Enables direct booking functionality for property rental sites
- **API Proxy**: Server-side proxy at `/api/hostpro/*` to centralized HostPro API
- **Secrets Required**: HOSTPRO_API_KEY, HOSTPRO_API_URL (optional, defaults to production URL)
- **Types**: Shared Zod schemas in `shared/hostpro.ts` for config, properties, availability, pricing
- **Client**: `server/hostpro/client.ts` handles API communication with error handling
- **Routes**: `server/hostpro/routes.ts` validates queries (400 for bad params) and responses (502 for upstream failures)
- **Hooks**: `client/src/hooks/use-hostpro.ts` provides React Query hooks for all endpoints
- **Components**: PropertyCard, AvailabilityCalendar, PricingBreakdown in `client/src/components/booking/`
- **Feature Flags**: `enableInstantBooking` (controls booking vs inquiry flow), `enablePayments` (controls pricing display)
- **Phase 2 TODO**: POST /reservations and /inquiries endpoints for submitting bookings

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