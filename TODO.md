# TODO: Fix 404 Errors in Food-Order System

## Steps to Complete

- [x] Update next.config.mjs to add rewrites for SPA routing support
- [x] Update backend/foodapp/views.py to change QR URL generation (remove /scan prefix)
- [x] Update food-crm/app/AppContent.tsx to change scan route from /scan/:hash/:table to /:hash/:table
- [ ] Test the changes by running the frontend and backend servers and checking for 404s
