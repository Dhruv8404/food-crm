# TODO: Fix DELETE Method for Orders Endpoint and Enhance Edit Functionality

## Steps to Complete:
- [x] Add import for PermissionDenied in backend/foodapp/views.py
- [x] Change OrderUpdateView to inherit from generics.RetrieveUpdateDestroyAPIView
- [x] Add destroy method to OrderUpdateView to restrict DELETE to admin users only
- [x] Remove confirmation dialog from frontend delete handler
- [x] Add functionality to add new dishes in the edit order dialog
- [ ] Test the DELETE functionality by running the backend server and attempting to delete an order as an admin user
- [ ] Ensure no regressions in existing update functionality
