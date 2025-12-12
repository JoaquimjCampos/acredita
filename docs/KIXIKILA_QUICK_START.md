# Kixikila - Quick Start Guide

## Prerequisites
✅ Django backend running on `http://localhost:8000`  
✅ React frontend running on `http://localhost:3000`  
✅ User account created and authenticated  

## Test Flow

### 1. Create a Kixikila Group
Navigate to: `http://localhost:3000/kixikila/create`

**Required Fields:**
- **Nome**: "Grupo Teste Kixikila"
- **Descrição**: "Grupo de poupança rotativa para testes"
- **Tipo**: Select "Poupança Familiar" or "Negócio Local"
- **Contribuição Mensal**: 5000 (AOA)
- **Frequência**: "monthly"
- **Máximo de Membros**: 10
- **Duração (meses)**: 12
- **Província**: Select any
- **Município**: Select any

Click **"Criar Grupo"** → Should redirect to group detail page

### 2. View Group Details
Navigate to: `http://localhost:3000/kixikila/{id}` (replace {id} with created group ID)

**Expected Display:**
- 4 stats cards:
  - **Total em Caixa**: 0 AOA (initially)
  - **Membros Ativos**: 1 (creator auto-joins)
  - **Próximo Ciclo**: 5000 AOA
  - **Taxa de Participação**: 0% (no contributions yet)

- Membership badge: "✓ Você é membro"
- Buttons: "Contribuir", "Gerir Grupo"

### 3. Make First Contribution
Click **"Contribuir"** button or navigate to: `http://localhost:3000/kixikila/{id}/contribute`

**Fill Form:**
- **Valor**: 5000 (pre-filled from group monthly_contribution)
- **Método de Pagamento**: Select "Transferência Bancária"
- **Comprovativo**: (optional) Upload receipt image

Click **"Submeter Contribuição"**

**Expected Result:**
- Success toast: "Contribuição criada com sucesso!"
- Redirect to detail page
- Status still shows 0 AOA (contribution is pending)

### 4. Manage Group & Confirm Contribution
Navigate to: `http://localhost:3000/kixikila/{id}/manage`

**Overview Tab:**
- See group details
- Stats cards (same as detail page)

**Members Tab:**
- Table showing your membership
- Total contributed: 0 AOA (contribution pending)

**Contributions Tab:**
- **Filters:**
  - Status: Select "Pendente" or "All"
  - Round: Leave empty or enter "1"
- **Pending Contributions Section:**
  - Your contribution should appear in table
  - Status: "Pendente"
  - Round: 1
  - Click **"Confirmar"** button

**Expected Result:**
- Success toast: "Contribuição confirmada!"
- Contribution moves from pending to history
- Stats refresh automatically

### 5. Verify Updated Stats
Click **"Atualizar"** (refresh button) or navigate back to detail page

**Expected Stats:**
- **Total em Caixa**: 5000 AOA ✅
- **Membros Ativos**: 1
- **Próximo Ciclo**: 5000 AOA
- **Taxa de Participação**: 100% ✅

### 6. Filter Contributions
In Management page → Contributions tab:

**Test Filters:**
1. **Status: "Confirmado"** → Should show your confirmed contribution
2. **Status: "Pendente"** → Should show empty
3. **Round: 1** → Should show your Round 1 contribution
4. **Round: 2** → Should show empty

### 7. Multi-Member Test (Optional)
1. Create second user account
2. Login as second user
3. Navigate to group list: `http://localhost:3000/kixikila`
4. Click "Ver Detalhes" on test group
5. Click "Aderir ao Grupo"
6. Make contribution (follow step 3)
7. Login as first user (admin)
8. Manage group → Confirm second user's contribution
9. Verify:
   - Total em Caixa: 10000 AOA
   - Membros Ativos: 2
   - Taxa de Participação: 100%
   - Members tab shows both members with correct totals

## API Testing (Backend Only)

### Get Groups
```bash
curl -X GET http://localhost:8000/api/v2/kixikila/groups/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Group Stats
```bash
curl -X GET http://localhost:8000/api/v2/kixikila/groups/1/stats/
```

**Expected Response:**
```json
{
  "cash": 5000.0,
  "active": 1,
  "next": 5000.0,
  "participation_rate": 100.0
}
```

### Create Contribution
```bash
curl -X POST http://localhost:8000/api/v2/kixikila/contributions/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "membership_id": 1,
    "amount": 5000,
    "payment_method": "transfer"
  }'
```

**Expected Response (201):**
```json
{
  "id": 1,
  "membership": 1,
  "amount": "5000.00",
  "payment_method": "transfer",
  "status": "pending",
  "round": 1,
  "payment_date": "2025-12-12T01:30:00Z"
}
```

### Confirm Contribution
```bash
curl -X POST http://localhost:8000/api/v2/kixikila/contributions/1/confirm/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response (200):**
```json
{
  "id": 1,
  "status": "confirmed"
}
```

## Troubleshooting

### Frontend Not Loading
```bash
cd C:\apps\Acredita\frontend
npm start
```

### Backend Not Running
```bash
cd C:\apps\Acredita\backend
python manage.py runserver
```

### Authentication Errors
1. Login at `http://localhost:3000/login`
2. Check browser console for JWT token
3. Verify token in localStorage: `localStorage.getItem('token')`

### Stats Not Updating
1. Click "Atualizar" (refresh button) in management page
2. Check browser network tab for API calls
3. Verify backend logs: `backend/logs/`

### Contribution Round Not Auto-Calculating
- Check backend logs for errors in `perform_create`
- Verify group has `current_round` value set
- Default starts at round 1 if not set

### Filters Not Working
1. Open browser DevTools console
2. Check for TypeScript errors
3. Verify `filteredContributions` is being computed
4. Check filter state in React DevTools

## Success Criteria

✅ Group created successfully  
✅ User can join group  
✅ Contribution created with status "pending"  
✅ Admin can confirm contribution  
✅ Stats show correct cash total (confirmed only)  
✅ Participation rate calculated correctly  
✅ Filters work (status, round)  
✅ Refresh button updates data  
✅ Per-member totals display correctly  

## Next Steps

After successful testing:
1. Review `KIXIKILA_IMPLEMENTATION.md` for full documentation
2. Set up automated round advancement (cron job)
3. Implement payout automation
4. Add notification system
5. Deploy to staging environment

---
**Testing Date**: December 12, 2025  
**Version**: 1.0.0  
**Status**: Ready for QA Testing
