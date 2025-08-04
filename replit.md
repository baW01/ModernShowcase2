# Product Catalog Management System

## Overview
This is a full-stack web application designed for comprehensive product catalog management. It provides a clean interface for customer browsing and an administrative dashboard for product and store settings. The project aims to offer a robust, scalable solution for online product display and management, enhancing user experience and streamlining administrative tasks with a focus on legal compliance, security, and performance.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with a custom design system and shadcn/ui component library built on Radix UI primitives.
- **State Management**: TanStack Query for server state.
- **Routing**: Wouter for lightweight client-side routing.
- **Forms**: React Hook Form with Zod validation.
- **Key Features**: Product display, admin dashboard for product management, forms for product and settings, reusable UI components.
- **User Interface Enhancements**: Cookie consent banner, clickable phone numbers, product statistics display, product sorting (popularity, newest, price), multiple image upload with compression, touch-enabled image gallery.

### Backend
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **Database**: PostgreSQL with Drizzle ORM (using Neon Database for serverless PostgreSQL). Fully optimized with 17 strategic indexes covering: product filtering, sorting, statistics tracking, admin operations, and full-text search.
- **API Design**: RESTful endpoints for CRUD operations.
- **Validation**: Zod schemas for request/response validation.
- **Key Components**: Abstract storage interface, RESTful API endpoints for products and settings, Drizzle ORM database schema.
- **Security Features**: JWT token-based authentication with protected API endpoints, rate limiting for various actions (login, product creation, requests, delete requests), Helmet.js for security headers, CORS configuration, Bcrypt for password hashing, environment variable usage. Admin users bypass rate limits.
- **Performance Optimizations**: Comprehensive performance optimization including: 17 strategic database indexes, multi-level HTTP caching (5-10 min), gzip compression (level 6), lazy loading with Intersection Observer, optimized TanStack Query settings, debounced view tracking, progressive image loading, full-text search capabilities, and performance monitoring with request timing logs.
- **Key Features**: Sale verification system via secure tokens, enhanced image upload with compression and immediate upload.

### Overall System Design
- **Structure**: Monorepo with shared types and schemas for consistency.
- **Deployment**: Vite for frontend build, esbuild for backend bundling, Drizzle for database migrations.
- **Data Flow**: Client requests via TanStack Query -> Express routes (validation via Zod) -> PostgreSQL with Drizzle ORM -> JSON responses to client.
- **Legal & Footer**: Terms of Service and Privacy Policy pages (in Polish) covering data collection, content moderation, and prohibited items. Donation links.

## External Dependencies

### Core Dependencies
- `@neondatabase/serverless`: Serverless PostgreSQL driver
- `drizzle-orm`: Type-safe ORM for database operations
- `@tanstack/react-query`: Server state management
- `@radix-ui/*`: Headless UI components
- `react-hook-form`: Form handling
- `zod`: Schema validation
- `tailwindcss`: Utility-first CSS framework
- `wouter`: Lightweight client-side routing
- `bcrypt`: Password hashing
- `jsonwebtoken`: JWT creation and verification
- `express-rate-limit`: Rate limiting middleware
- `helmet`: Security headers
- `cors`: Cross-Origin Resource Sharing

### Development Tools
- `drizzle-kit`: Database migration and introspection tool
- `vite`: Build tool and development server
- `typescript`: Type checking and compilation
- `@replit/vite-plugin-*`: Replit-specific development enhancements