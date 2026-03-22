# ShopFlow — React Frontend

A full-featured React 18 + TypeScript + Vite frontend for the ShopFlow e-commerce microservices platform.

## Tech Stack
- **React 18** + **TypeScript** + **Vite**
- **TanStack Query v5** — server state, caching, mutations
- **Zustand** — client state (auth, cart) with localStorage persistence
- **React Router v6** — routing with layout routes and auth guards
- **Axios** — HTTP client with auth interceptor
- **Tailwind CSS** — utility-first styling
- **react-hot-toast** — toast notifications
- **lucide-react** — icons

## Two Separate UIs

### Customer UI (`/shop`, `/cart`, `/orders`, `/payments`, `/account`)
User-friendly storefront with product browsing, cart management, checkout, order tracking, and payment history.

### Admin Dashboard (`/admin/*`)
Dark sidebar layout with:
- Dashboard with live KPIs and service health
- Product management (CRUD)
- Order management with status updates
- Payment management with refunds
- User management
- Analytics with charts

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
```

Make sure all 4 microservices are running (docker-compose up --build).

## API Proxy (Vite)
All API calls go through Vite dev server proxy — no CORS issues in development.

| Prefix | Target |
|--------|--------|
| /api/auth, /api/users | http://localhost:3001 |
| /api/products | http://localhost:3002 |
| /api/orders | http://localhost:3003 |
| /api/payments | http://localhost:3004 |

## Build for Production

```bash
npm run build
# Serve dist/ with any static file server
# Set your actual service URLs in vite.config.ts proxy
```

## Auth Flow
- Guest users can browse products and view cart
- Sign in or register sends JWT to User Service
- JWT stored in localStorage via Zustand persist
- Role-based routing: customers → /shop, admins → /admin/dashboard
- Admin users can still access the customer storefront
