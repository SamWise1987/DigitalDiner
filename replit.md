# Restaurant QR Code Ordering System

## Overview

This is a full-stack restaurant ordering system that enables customers to scan QR codes at tables, browse a digital menu, place orders, and make payments through Stripe. The system includes an admin dashboard for restaurant management and real-time order tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Payment Processing**: Stripe integration for secure payments
- **Session Management**: Custom session handling with PostgreSQL storage

### Development Setup
- **Monorepo Structure**: Client, server, and shared code in single repository
- **Build Process**: Vite for frontend, ESBuild for backend bundling
- **Development Server**: Hot reload with Vite middleware integration
- **Path Aliases**: TypeScript path mapping for clean imports

## Key Components

### Database Schema (shared/schema.ts)
- **Tables**: Restaurant table management with QR codes and status tracking
- **Menu Items**: Product catalog with categories, pricing, and availability
- **Orders**: Order lifecycle management with status tracking
- **Order Items**: Individual items within orders with quantities
- **Sessions**: Customer session management linking tables to orders

### API Layer (server/routes.ts)
- **RESTful Endpoints**: CRUD operations for all entities
- **Table Management**: QR code generation and table status updates
- **Order Processing**: Order creation, status updates, and payment integration
- **Stripe Integration**: Payment intent creation and webhook handling
- **Session Management**: Customer session creation and validation

### Frontend Pages
- **Admin Dashboard**: Table status overview, order management, and analytics
- **QR Landing**: Table session initialization from QR code scan
- **Digital Menu**: Customer-facing menu with category filtering and cart functionality
- **Order Cart**: Order review and modification before payment
- **Payment**: Stripe payment processing with multiple payment methods
- **Order Confirmation**: Success page with order status and receipt

### Storage Layer (server/storage.ts)
- **Data Access Layer**: Abstracted database operations with TypeScript interfaces
- **Transaction Management**: Ensures data consistency across related operations
- **Query Optimization**: Efficient database queries using Drizzle ORM

## Data Flow

### Customer Journey
1. **QR Code Scan**: Customer scans table QR code → Creates session and locks table
2. **Menu Browsing**: Session ID routes to digital menu → Real-time menu data
3. **Order Placement**: Items added to cart → Order created with session ID
4. **Payment Processing**: Stripe payment intent → Secure payment confirmation
5. **Order Confirmation**: Payment success → Order status updates and receipt

### Admin Operations
1. **Dashboard Monitoring**: Real-time table status and order tracking
2. **Order Management**: Status updates flow through to customer interface
3. **Table Management**: Manual status changes and session management

### Data Persistence
- **Session State**: Stored in PostgreSQL with table relationships
- **Cart Data**: Client-side storage with session backup
- **Order History**: Complete audit trail in database
- **Payment Records**: Stripe payment intent IDs stored for reconciliation

## External Dependencies

### Payment Processing
- **Stripe**: Primary payment processor with support for multiple payment methods
- **Payment Elements**: Modern, customizable payment UI components
- **Webhook Integration**: Real-time payment status updates

### Database
- **Neon Database**: Serverless PostgreSQL with connection pooling
- **Drizzle ORM**: Type-safe database operations with migration support
- **Connection Management**: Optimized for serverless environments

### UI/UX Libraries
- **Radix UI**: Accessible, unstyled component primitives
- **Tailwind CSS**: Utility-first styling with custom design system
- **Lucide Icons**: Consistent iconography throughout the application

### Development Tools
- **TypeScript**: Full type safety across frontend and backend
- **Vite**: Fast development builds with hot module replacement
- **ESBuild**: Production bundling for server-side code

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations handle schema changes

### Environment Configuration
- **Database**: `DATABASE_URL` for Neon connection string
- **Stripe**: `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLIC_KEY` for payment processing
- **Development**: Local development with Vite middleware for seamless full-stack development

### Production Considerations
- **Static Assets**: Frontend served as static files with Express fallback
- **Database Connections**: Connection pooling for optimal performance
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Security**: CORS configuration and input validation throughout the stack