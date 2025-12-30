# Marketplace Roadmap & Architecture

## Overview
Unified marketplace for both **services** and **products**, enabling users to publish, discover, and transact offerings within the Acredita ecosystem.

---

## Architecture

### Backend (Django/DRF)

#### Models

**ServiceListing** (Unified)
- `listing_type`: 'service' | 'product' — determines behavior
- `title`, `description`, `category`, `provider`
- `price_type`: 'fixed' | 'hourly' | 'negotiable'
- `base_price`, `currency` (default: AOA)
- `available`, `featured`, `views`
- **Service-specific**: `delivery_time` (e.g., "2-3 dias")
- **Product-specific**: `quantity_available`, `sku`
- `tags`, `images`, `video_url`

**ServiceProvider** 
- Links user to business info (name, type, categories, location)
- Tracks reputation (rating, total_reviews, verified)
- Auto-created on first listing

**ServiceCategory**
- Shared categories for services and products
- `name`, `slug`, `description`, `is_active`

**ServiceOrder**
- Represents a transaction (service request or product purchase)
- `listing`, `customer`, `status`, `total_amount`, `payment_status`
- Lifecycle: pending → accepted → in_progress → completed

**MarketplaceReview**
- Tied to completed orders
- `rating`, `comment`, `helpful_count`

#### Views (DRF)

**ServiceListingViewSet**
- `GET /listings/` — browse all listings (paginated, filterable, searchable)
- `POST /listings/` — create new listing (auto-creates provider if needed)
- `GET /listings/:id/` — view single listing
- `PUT/PATCH /listings/:id/` — update (provider only)
- `DELETE /listings/:id/` — delete (provider only)
- **Actions**:
  - `mark_featured` (POST) — admin only
  - `reduce_stock` (POST) — decrements `quantity_available` for products

**Filters**: `listing_type`, `category`, `provider`, `price_type`, `available`  
**Search**: `title`, `description`, `tags`, `sku`  
**Ordering**: `created_at`, `views`, `featured`, `base_price`

#### Serializers

**ServiceListingSerializer** (read)
- Full nested data + provider & category details

**ServiceListingCreateUpdateSerializer** (write)
- Accepts `price` (maps to `base_price`)
- Validates products require `quantity_available`
- Auto-sets `provider` in view

---

### Frontend (React/TypeScript)

#### Types

**ServiceListingDTO**
```typescript
{
  id: number;
  listing_type: 'service' | 'product';
  title: string;
  description: string;
  price_type: 'fixed' | 'hourly' | 'negotiable';
  base_price: number;
  currency: string;
  available: boolean;
  delivery_time?: string;           // Services
  quantity_available?: number | null; // Products
  sku?: string;                       // Products
  tags?: string[];
  images?: string[];
  views: number;
  featured: boolean;
  provider: ServiceProviderDTO;
  category: ServiceCategoryDTO;
}
```

#### Services

**MarketplaceService**
- `getCategories()` — fetch active categories
- `getListings(filters)` — paginated browse (supports `listing_type`)
- `getListingsByType(type, filters)` — convenience for filtering
- `getListing(id)` — single listing detail
- `createListing(data)` — create service or product
- `updateListing(id, data)` — update
- `deleteListing(id)` — delete
- `markFeatured(id)` — admin action
- `getMyListings()` — user's listings

#### Components

**MarketplacePage**
- Browse all listings (services + products)
- Filter by type, category, price range, search
- Grid display with listing cards

**MarketplaceDetailPage**
- Single listing detail
- Provider info (rating, reviews, contact)
- CTA: "Request Service" / "Add to Cart"
- Reviews section

**MarketplaceCreatePage** (Enhanced)
- Toggle: Service vs Product
- **Common fields**: title, description, category, price, price_type, images
- **Service-specific**: delivery_time field
- **Product-specific**: quantity_available, sku fields
- Form validation ensures products have stock

---

## Feature Flags

**marketplace** — Feature flag (default enabled in DEBUG mode)
- Controls access to all marketplace endpoints
- Auto-enabled for admins and beta testers

---

## Best Practices Implemented

1. **DRY (Don't Repeat Yourself)**
   - Single `ServiceListing` model handles both services & products
   - Unified serializer with conditional validation
   - Reusable filtering/search across types

2. **Validation**
   - Products require `quantity_available`
   - Serializer-level validation prevents invalid states
   - View-level checks for permissions (featured, stock reduction)

3. **Performance**
   - `select_related` for provider/category (avoid N+1)
   - `prefetch_related` for provider categories
   - Indexed fields: `listing_type`, `available`, `featured`, `category`

4. **Security**
   - `AllowAny` for reads; `IsAuthenticated` for writes
   - Auto-create provider only on first listing (no privilege escalation)
   - Admin-only actions protected

5. **Scalability**
   - Pagination built-in (default 20 per page)
   - Lazy filtering via query params
   - Stock reduction via atomic operation

---

## Usage Examples

### Create a Service
```bash
curl -X POST http://localhost:8000/api/v2/marketplace/listings/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "listing_type": "service",
    "title": "Web Design",
    "description": "Custom website design",
    "category_id": 1,
    "price": 50000,
    "price_type": "fixed",
    "delivery_time": "5-7 dias"
  }'
```

### Create a Product
```bash
curl -X POST http://localhost:8000/api/v2/marketplace/listings/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "listing_type": "product",
    "title": "T-Shirt Premium",
    "description": "100% cotton premium shirt",
    "category_id": 2,
    "price": 2500,
    "price_type": "fixed",
    "quantity_available": 100,
    "sku": "TSHIRT-PREM-001"
  }'
```

### Browse by Type
```bash
# Services only
GET /api/v2/marketplace/listings/?listing_type=service

# Products only
GET /api/v2/marketplace/listings/?listing_type=product

# Specific category
GET /api/v2/marketplace/listings/?category=1&listing_type=product
```

### Reduce Product Stock
```bash
curl -X POST http://localhost:8000/api/v2/marketplace/listings/5/reduce_stock/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'
```

---

## Database Migration

After model changes, run:
```bash
python manage.py makemigrations
python manage.py migrate
```

**New fields**: `listing_type`, `quantity_available`, `sku`

---

## Testing & Seeding

Seed marketplace with sample services and products:
```bash
python manage.py seed_marketplace
```

This creates:
- 1 "Consultoria" category
- 1 provider (first user)
- 1 sample service listing

Extend seed script to add multiple categories/listings as needed.

---

## Future Enhancements

- **Reviews & Ratings**: Full system linked to completed orders
- **Messaging**: In-app messaging between buyer/seller
- **Payment Integration**: Stripe/payment gateway
- **Stock Management**: Webhooks for out-of-stock alerts
- **Analytics**: Dashboard for providers (views, conversions, revenue)
- **Bulk Operations**: CSV import for products
- **Variants**: Product size/color variants
- **Shipping**: Shipping rates, address validation
- **Wishlists**: Save favorites
- **Recommendations**: Similar items, trending

---

## Support

For questions or issues, refer to:
- `backend/marketplace/` — models, views, serializers
- `frontend/src/services/marketplace/` — service layer
- `frontend/src/pages/Marketplace*.tsx` — UI components
- `frontend/src/types/api.ts` — TypeScript types
