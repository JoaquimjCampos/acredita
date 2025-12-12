# Kixikila Implementation - Complete Documentation

## Overview
Kixikila is a rotating savings and credit association (ROSCA) module integrated into the Acredita platform. Members contribute a fixed amount monthly, and each cycle one member receives the pooled funds.

## Architecture

### Backend (Django REST Framework)

#### Models (`backend/kixikila/models.py`)
- **KixikilaGroup**: Main group entity with cycle configuration
- **KixikilaMembership**: User membership in a group with position tracking
- **KixikilaContribution**: Individual contributions with status tracking
- **KixikilaPayout**: Payout records when members receive funds
- **KixikilaRating**: Member ratings for trust scoring

#### Key Features
1. **Contribution Status Flow**: `pending` → `confirmed` → (`late`/`missed`)
2. **Round Calculation**: Auto-increments based on group's current cycle
3. **Participation Rate**: `(confirmed_count / total_count) × 100`
4. **Cash Calculation**: Only confirmed contributions count toward group total

#### API Endpoints (`/api/v2/kixikila/`)

**Groups**
- `GET /groups/` - List all groups (paginated)
- `POST /groups/` - Create new group (authenticated)
- `GET /groups/{id}/` - Group detail
- `PUT/PATCH /groups/{id}/` - Update group (authenticated)
- `DELETE /groups/{id}/` - Delete group (authenticated)

**Group Actions**
- `POST /groups/{id}/join/` - Join group (creates membership)
- `GET /groups/{id}/membership/` - Check user's membership
- `GET /groups/{id}/members/` - List group members
- `GET /groups/{id}/contributions/` - List all contributions
- `GET /groups/{id}/stats/` - Get aggregated stats
  ```json
  {
    "cash": 1500.00,
    "active": 10,
    "next": 150.00,
    "participation_rate": 85.71
  }
  ```

**Contributions**
- `GET /contributions/` - List user's contributions
- `POST /contributions/` - Create contribution
  ```json
  {
    "membership_id": 1,
    "amount": 150.00,
    "payment_method": "transfer"
  }
  ```
- `POST /contributions/{id}/confirm/` - Confirm pending contribution

**Memberships**
- `GET /memberships/` - List user's memberships

**Payouts**
- `GET /payouts/` - List user's payouts

**Ratings**
- `GET /ratings/` - List ratings
- `POST /ratings/` - Rate a member

### Frontend (React + TypeScript)

#### Pages

**1. KixikilaPage** (`/kixikila`)
- Lists all available groups with search/filter
- Shows group status, members, and contribution amount
- "Ver Detalhes" button navigates to detail page

**2. KixikilaDetailPage** (`/kixikila/{id}`)
- Four stats cards: Total em Caixa, Membros Ativos, Próximo Ciclo, Taxa de Participação
- Membership status display
- Join/Leave buttons
- "Contribuir" button for members
- "Gerir Grupo" button for admins

**3. KixikilaCreatePage** (`/kixikila/create`)
- Group creation form with validation
- Fields: name, description, type, contribution amount, frequency, max members, duration
- Province/municipality selection

**4. KixikilaManagementPage** (`/kixikila/{id}/manage`) - Admin Dashboard
- **Overview Tab**: Group info, stats cards, quick actions
- **Members Tab**: 
  - Member list with contribution totals
  - Add/Remove member actions
  - Per-member confirmed contribution totals
- **Contributions Tab**:
  - Filters: Status (all/confirmed/pending), Round (numeric input)
  - Refresh button for live data updates
  - Pending contributions table with Confirm/Reject buttons
  - History table with all contributions

**5. KixikilaContributePage** (`/kixikila/{id}/contribute`)
- Contribution form for members
- Auto-calculates next round
- Payment method selection (transfer/card/cash)
- Receipt upload (optional)
- Success confirmation with stats refresh

#### Service Layer (`kixikilaService.ts`)
```typescript
export interface GroupStats {
  cash: number;
  active: number;
  next: number;
  participation_rate?: number;
}

// Key methods
getGroups(params): Promise<PaginatedResponse<KixikilaGroup>>
getGroupById(id): Promise<KixikilaGroup>
createGroup(data): Promise<KixikilaGroup>
joinGroup(groupId): Promise<KixikilaMembership>
checkMembership(groupId): Promise<KixikilaMembership>
getGroupMembers(groupId): Promise<KixikilaMembership[]>
getGroupContributions(groupId): Promise<KixikilaContribution[]>
getGroupStats(groupId): Promise<GroupStats>
createContribution(data): Promise<KixikilaContribution>
confirmContribution(contributionId): Promise<{id, status}>
```

## Implementation Highlights

### 1. Backend-Driven Stats
All totals and metrics are calculated on the backend for consistency:
- Cash total: Sum of confirmed contributions only
- Active members: Count of active memberships
- Next cycle: Group's monthly_contribution amount
- Participation rate: Percentage of confirmed vs total contributions

### 2. Contribution Filters
Management page supports:
- **Status filter**: all/confirmed/pending
- **Round filter**: numeric input to view specific cycle contributions
- **Derived state pattern**: `filteredContributions` computed from filters

### 3. Per-Member Totals
Management page computes per-member contribution totals:
```typescript
const memberTotals = contributions
  .filter(c => c.status === 'confirmed')
  .reduce((acc, c) => {
    const key = c.membership_id || c.membership?.member?.email;
    acc[key] = (acc[key] || 0) + Number(c.amount);
    return acc;
  }, {});
```

### 4. Real-Time Updates
- Refresh button in management page re-fetches all data
- Stats auto-refresh after contribution creation/confirmation
- Optimistic UI updates with error rollback

## Testing Checklist

### Backend Tests
- [ ] Create group with valid data
- [ ] Join group increments current_members
- [ ] Cannot join full group
- [ ] Contribution POST calculates correct round
- [ ] Stats endpoint returns accurate participation_rate
- [ ] Confirm contribution changes status to 'confirmed'
- [ ] Only confirmed contributions count in cash total

### Frontend Tests
- [ ] Group list displays with pagination
- [ ] Detail page shows correct stats from backend
- [ ] Participation rate displays as percentage
- [ ] Filters work correctly (status, round)
- [ ] Refresh button updates all data
- [ ] Per-member totals match confirmed contributions
- [ ] Contribution creation shows success message
- [ ] Confirm button updates contribution status

### Integration Tests
- [ ] Create group → Join → Contribute → Confirm flow
- [ ] Multiple members contributing in same round
- [ ] Participation rate updates after confirmation
- [ ] Cash total updates only for confirmed contributions
- [ ] Filter by round shows correct contributions

## Known Issues & Future Enhancements

### Current Limitations
1. No automated round advancement (manual/cron job needed)
2. Payout creation is manual (not auto-triggered)
3. No contribution late/missed status auto-update
4. Receipt file upload not fully wired to backend storage

### Planned Enhancements
1. **Automated Cycle Management**: Cron job to advance rounds and mark late contributions
2. **Payout Automation**: Auto-create payout when all members contribute in a round
3. **Notifications**: Email/SMS alerts for pending contributions and payouts
4. **Mobile App**: Native iOS/Android with offline contribution tracking
5. **Analytics Dashboard**: Charts for contribution trends, participation rates
6. **Trust Score**: Weighted rating system based on contribution history

## Configuration

### Feature Flag
The Kixikila module is controlled by the `kixikila` feature flag:
```python
# In Django shell or admin
from backend.core.feature_flags import FeatureFlagService
FeatureFlagService.is_enabled("kixikila", user=request.user)
```

### Environment Variables
```bash
# Add to .env if needed
KIXIKILA_DEFAULT_MAX_MEMBERS=20
KIXIKILA_MIN_CONTRIBUTION=1000  # AOA
```

### Frontend Routes
Add to React Router:
```tsx
<Route path="/kixikila" element={<KixikilaPage />} />
<Route path="/kixikila/create" element={<KixikilaCreatePage />} />
<Route path="/kixikila/:id" element={<KixikilaDetailPage />} />
<Route path="/kixikila/:id/manage" element={<KixikilaManagementPage />} />
<Route path="/kixikila/:id/contribute" element={<KixikilaContributePage />} />
```

## Deployment

### Database Migrations
```bash
cd backend
python manage.py makemigrations kixikila
python manage.py migrate kixikila
```

### Static Files
```bash
cd frontend
npm run build
# Copy build/ to backend/static/
```

### Production Checklist
- [ ] Run migrations on production DB
- [ ] Enable `kixikila` feature flag for target users
- [ ] Set up SSL for payment receipt uploads
- [ ] Configure CORS for frontend domain
- [ ] Set up automated backups for contribution records
- [ ] Enable Django logging for kixikila module
- [ ] Test with small pilot group before full rollout

## Support & Maintenance

### Logs
Django logs kixikila operations to `backend/logs/` with logger name `backend.kixikila.views`.

### Common Admin Tasks
```bash
# Check group stats via Django shell
python manage.py shell
>>> from backend.kixikila.models import KixikilaGroup
>>> group = KixikilaGroup.objects.get(id=1)
>>> group.get_total_cash()
>>> group.get_participation_rate()

# List pending contributions
>>> from backend.kixikila.models import KixikilaContribution
>>> KixikilaContribution.objects.filter(status='pending')

# Confirm contribution manually
>>> contrib = KixikilaContribution.objects.get(id=123)
>>> contrib.status = 'confirmed'
>>> contrib.save()
```

## Contributors
- Backend: Django REST Framework implementation with feature flags and logging
- Frontend: React + TypeScript with Tailwind CSS
- Integration: JWT authentication, pagination, real-time stats

---
**Last Updated**: December 12, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (with pilot testing recommended)
