# Product Catalog Management System

## Overview

This is a full-stack web application for managing a product catalog. It's built with React on the frontend and Express on the backend, featuring a clean product listing interface for customers and an admin dashboard for managing products and store settings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints for CRUD operations
- **Validation**: Zod schemas for request/response validation

## Key Components

### Frontend Components
- **Product Display**: ProductCard component for showing individual products
- **Admin Interface**: Tabbed admin dashboard with product management, add product form, and settings
- **Forms**: ProductForm for adding products, SettingsForm for store configuration
- **Navigation**: AdminNav for admin dashboard navigation
- **UI Library**: Comprehensive set of reusable UI components from shadcn/ui

### Backend Components
- **Storage Layer**: Abstract storage interface with PostgreSQL database implementation
- **Route Handlers**: RESTful API endpoints for products and settings
- **Database Schema**: Products and settings tables with proper relationships using Drizzle ORM
- **Development Server**: Vite integration for hot module replacement in development

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **API Layer**: Express routes handle CRUD operations
3. **Validation**: Zod schemas validate incoming data
4. **Storage**: Uses PostgreSQL database with Drizzle ORM for persistent data storage
5. **Response**: JSON responses sent back to client
6. **State Management**: TanStack Query manages caching and synchronization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **react-hook-form**: Form handling
- **zod**: Schema validation
- **tailwindcss**: Utility-first CSS framework

### Development Tools
- **drizzle-kit**: Database migration and introspection tool
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations in `migrations/` directory

### Environment Configuration
- **Development**: Uses Vite dev server with Express API
- **Production**: Serves built React app from Express static middleware
- **Database**: Requires `DATABASE_URL` environment variable

### Key Features
- **Hot Module Replacement**: Vite integration for fast development
- **Error Handling**: Runtime error overlay in development
- **Static Assets**: Proper asset handling and serving
- **Database Migration**: Ready for PostgreSQL with Drizzle schema

The application is structured as a monorepo with shared types and schemas, making it easy to maintain consistency between frontend and backend while supporting both development and production environments.

## Security Features

### Authentication & Authorization (July 11, 2025)
- **JWT Token-based Authentication**: Secure server-side authentication using JSON Web Tokens
- **Protected API Endpoints**: All admin endpoints require valid JWT tokens
- **Rate Limiting**: Prevents brute force attacks on authentication endpoints
- **Security Headers**: Helmet.js for XSS protection, CSP, and other security headers
- **CORS Configuration**: Properly configured Cross-Origin Resource Sharing
- **Password Hashing**: Bcrypt for secure password storage (no plaintext passwords)
- **Environment Variables**: Sensitive configuration stored in .env file

### Security Implementation Details
- JWT tokens expire after 24 hours
- Rate limiting: 5 login attempts per 15 minutes per IP
- General API rate limit: 100 requests per 15 minutes per IP
- Authorization header format: `Bearer <token>`
- All admin operations require authentication token

## Recent Changes

### Latest modifications with dates (July 15, 2025)
- **Fixed Post Display Delay After Acceptance** (Afternoon, July 15, 2025)
  - Identified and resolved cache invalidation issue causing delays in displaying accepted posts
  - Added missing public products cache invalidation to all product mutations
  - Updated ProductRequestsTable, ProductForm, EditProductModal, ProductsTable, and DeleteRequestsTable components
  - Fixed VerifySale page to invalidate cache after sale verification
  - Products now appear immediately on homepage after admin approval without 10-minute cache delay
  - Enhanced user experience by eliminating waiting time for approved content visibility

### Latest modifications with dates (July 13, 2025)
- **Performance Optimization and Loading Speed Improvements** (Late Evening, July 13, 2025)
  - Implemented lazy loading for product images with `loading="lazy"` attribute for better initial page load
  - Created LazyProductCard component with intersection observer for viewport-based loading
  - Added performance-optimized image component with preloading and responsive srcset
  - Implemented server-side compression middleware (gzip) to reduce response sizes
  - Added HTTP caching headers to API endpoints (5-10 minute cache with stale-while-revalidate)
  - Optimized TanStack Query cache settings (10 min stale time, 30 min cache retention)
  - Added debounced view tracking to reduce excessive API calls
  - Created performance monitoring utilities with debounce, throttle, and API batching
  - Implemented static asset caching with 1-year max-age for better browser caching
  - Added database optimization indexes for frequently queried columns
  - Created adaptive image quality based on connection speed detection

- **Updated Domain Configuration and Simplified Delete Requests** (Evening, July 13, 2025)
  - Configured all email links and Open Graph URLs to use custom domain https://spottedgfc.pl
  - Removed email requirement from delete request forms when using secure tokens from emails
  - Enhanced backend to validate delete request tokens and automatically extract submitter email
  - Maintained backward compatibility for legacy delete requests without tokens
  - Updated email footers to include branded domain links

- **Implemented Sale Verification System** (Evening, July 13, 2025)
  - Added sale verification functionality allowing product owners to mark items as sold directly from emails
  - Created secure token-based system for sale confirmation without admin intervention
  - Implemented `/verify-sale` page with optional comment field for sale details
  - Added green "Zweryfikowane" badge display on product cards for verified sales
  - Enhanced email templates with "Oznacz jako sprzedane" button alongside delete request button
  - Products marked as sold via email automatically become both sold and verified
  - Simplified workflow: Admin approves → Email sent → Owner clicks "Sprzedane" → Product marked as sold & verified

- **Enhanced Image Upload with Compression and Immediate Upload** (Afternoon, July 13, 2025)
  - Added automatic image compression for files over 10MB down to 5MB with quality preservation
  - Implemented individual loading indicators (spinning circles) for each image during upload
  - Created immediate image upload functionality - images are uploaded to server as soon as selected
  - Added `/api/upload-image` endpoint for real-time image processing
  - Increased server payload limit to 50MB to handle large image uploads before compression
  - Enhanced user feedback with compression notifications and progress indicators
  - Updated both single and multiple image upload components with new functionality

### Latest modifications with dates (July 12, 2025)
- **Implemented Multiple Image Upload Support and Touch Gallery Navigation** (Evening, July 12, 2025)
  - Added MultipleImageUpload component supporting up to 5 images per product
  - Enhanced database schema with imageUrls array field for products and product requests
  - Created touch-enabled ImageGallery component with swipe gesture navigation
  - Fixed backend API endpoints to properly handle and return imageUrls field
  - Resolved product request to product conversion to preserve multiple images
  - Implemented touch-only navigation (swipe left/right) removing button controls
  - Added visual indicators: image counter, dot navigation, and smooth transitions
  - Increased request payload limit to handle multiple base64 encoded images

### Latest modifications with dates (July 11, 2025)
- **Enhanced API Security and Data Privacy** (Evening, July 11, 2025)
  - Fixed public API endpoints to filter sensitive data (removed submitterEmail from public responses)
  - Added dedicated `/api/admin/products` endpoint for authenticated admin access with full data
  - Updated all admin frontend components to use secure admin endpoints
  - Verified authentication works correctly - public endpoints return filtered data, admin endpoints require JWT
  - **Updated Privacy Policy** to reflect new security measures and data protection practices
  - Added detailed security measures documentation (JWT, bcrypt, rate limiting, data filtering)
  - Documented deletion request process and GDPR compliance (right to be forgotten)
  - Maintained data privacy while preserving admin functionality

- **Implemented comprehensive JWT-based security system**
  - Added server-side authentication with bcrypt password hashing
  - Protected all admin API endpoints with authentication middleware
  - Implemented rate limiting to prevent brute force attacks
  - Added security headers (Helmet.js) for XSS and CSRF protection
  - Updated frontend to use JWT tokens for all authenticated requests
  - Created secure .env configuration for sensitive data

### Latest modifications with dates (July 10, 2025)

- Added cookie consent banner with Polish text and localStorage persistence
- Updated product contact buttons to use clickable phone numbers (tel: links) for direct calling
- Successfully integrated sample data: 5 products and 7 categories for proper testing
- Added Categories management tab in admin panel with full CRUD functionality
- Integrated product statistics tracking displaying views/clicks on product cards
- Added sorting functionality for products by popularity/newest/price
- Created and routed Terms and Privacy Policy pages
- Integrated footer with donation links to suppi.pl/spottedgfc
- Implemented unique tracking system for views and clicks (one per IP address per product)
- Fixed DialogContent accessibility warning by adding proper aria-describedby attribute
- **Updated Privacy Policy and Terms of Service** to reflect new data collection practices:
  - Added details about statistical tracking (views/clicks with IP and user agent)
  - Included category management functionality
  - Expanded cookie usage description to cover analytics tracking
  - Added prohibition against artificial statistics manipulation

## Key Features Added

### User Interface Enhancements
- **Cookie Consent Banner**: EU-compliant cookie consent with Polish text
- **Clickable Phone Numbers**: Direct calling functionality via tel: links
- **Product Statistics**: View/click tracking displayed on product cards
- **Product Sorting**: Sort by popularity, newest, or price (ascending/descending)

### Admin Features
- **Categories Management**: Full CRUD operations for product categories
- **Product Management**: Enhanced product forms with category dropdown
- **Statistics Dashboard**: View engagement metrics for products

### Legal & Footer
- **Terms of Service**: Polish terms page (/regulamin) with comprehensive prohibited items list
- **Privacy Policy**: Polish privacy policy page (/polityka-prywatnosci) with legal compliance monitoring
- **Donation Footer**: Links to suppi.pl/spottedgfc for financial support

## Recent Changes

### Legal Compliance Update (July 29, 2025)
- ✓ Updated Terms of Service with detailed list of prohibited products including:
  - Weapons, ammunition, and explosive materials
  - Drugs and psychotropic substances  
  - Prescription medicines and medical devices
  - Human organs, tissues, and bodily fluids
  - Protected species (CITES)
  - Illegal software and hacking tools
  - Child pornography and obscene materials
  - Counterfeits and pirated content
  - Official documents and banking cards
  - Gambling equipment and licenses
  - Alcohol and tobacco products
  - Dangerous chemicals and precursors
- ✓ Added moderation and content control section to terms
- ✓ Updated Privacy Policy to include monitoring for prohibited content
- ✓ Added legal compliance data sharing provisions
- ✓ Enhanced user responsibility clauses for product legality