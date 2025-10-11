# Chef Page Development TODO

- [ ] Update app-context.tsx: Add fetchOrders function to GET /api/orders/ from backend, filtered by role (chef/admin see all).
- [ ] Update app-context.tsx: Call fetchOrders on login (for chef/admin) or app init to sync orders.
- [ ] Update app-context.tsx: Modify markPrepared to PATCH order status to "completed" via API, then refetch orders.
- [ ] Update app-context.tsx: Add markPreparing function to PATCH order status to "preparing" via API, then refetch.
- [ ] Update app-context.tsx: Add markPreparing to Ctx type and value for use in components.
- [ ] Update chef-dashboard.tsx: Separate "Pending Orders" (status: pending) and "Preparing Orders" (status: preparing) sections.
- [ ] Update chef-dashboard.tsx: Add "Start Preparing" button for pending orders (calls markPreparing).
- [ ] Update chef-dashboard.tsx: Add "Mark Completed" button for preparing orders (calls markPrepared).
- [ ] Update chef-dashboard.tsx: Add a refresh button to manually fetch latest orders.
- [ ] Test the flow: Login as chef, create order as customer, verify fetch/update in chef dashboard.
- [ ] Run frontend: cd food-crm && pnpm install && pnpm dev (if not done).
- [ ] Run backend: cd backend && python manage.py runserver.
- [ ] Verify API endpoints: Test /api/orders/ GET/PATCH with chef token.

# QR Code Generation for Tables TODO

- [x] Backend: Add Table model to models.py (table_no: str, hash: str, active: bool).
- [x] Backend: Create and run migration for Table model.
- [x] Backend: Add TableSerializer to serializers.py.
- [x] Backend: Add generate_table view in views.py (POST /api/tables/generate/, admin-only, returns next table_no, hash, url).
- [x] Backend: Update Order model to include table_no field.
- [x] Backend: Create and run migration for Order table_no.
- [x] Backend: Update OrderSerializer to include table_no.
- [x] Backend: Update OrderListCreateView to set table_no from request or context.
- [x] Backend: Add table URLs to urls.py.
- [x] Frontend: Install qrcode.react via pnpm add qrcode.react.
- [x] Frontend: Update admin-dashboard.tsx to add "Generate New Table QR" section with button, API call, QR display.
- [x] Frontend: Update scan-page.tsx to read table and hash from URL params, validate hash via API, auto-set code, navigate to menu.
- [x] Frontend: Update app-context.tsx to store current table_no for orders.
- [ ] Test: Run backend and frontend, generate QR in admin, scan (simulate URL), verify menu loads with table.
