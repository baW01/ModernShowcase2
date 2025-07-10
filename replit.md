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

## Recent Changes

### Latest modifications with dates (July 10, 2025)

- Added cookie consent banner with Polish text and localStorage persistence
- Updated product contact buttons to use clickable phone numbers (tel: links) for direct calling
- Successfully integrated sample data: 5 products and 7 categories for proper testing
- Added Categories management tab in admin panel with full CRUD functionality
- Integrated product statistics tracking displaying views/clicks on product cards
- Added sorting functionality for products by popularity/newest/price
- Created and routed Terms and Privacy Policy pages
- Integrated footer with donation links to suppi.pl/spottedgfc

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
- **Terms of Service**: Polish terms page (/regulamin)
- **Privacy Policy**: Polish privacy policy page (/polityka-prywatnosci)
- **Donation Footer**: Links to suppi.pl/spottedgfc for financial support