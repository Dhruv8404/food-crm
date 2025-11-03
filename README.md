# Food-Order System

A comprehensive restaurant management and ordering system built with Django REST Framework for the backend and Next.js for the frontend. This system enables QR code-based table ordering, role-based access control, and integrated payment processing for a seamless dining experience.

## Features

### Core Functionality
- **QR Code Table Access**: Generate unique QR codes for each table, allowing customers to scan and access the menu directly from their devices
- **Dynamic Menu Management**: Admin panel for adding, updating, and categorizing menu items with images and descriptions
- **Real-time Order Processing**: Track orders from placement to completion with status updates
- **Role-Based Access Control**: Separate dashboards for customers, chefs, and administrators
- **Secure Authentication**: OTP-based email verification for user registration and login
- **Payment Integration**: Razorpay integration for secure online payments
- **Order History**: Customers can view their past orders and current order status

### User Roles
- **Guest**: Can scan QR codes and browse the menu
- **Customer**: Can place orders, view order history, and make payments
- **Chef**: Can view and update order statuses in the kitchen
- **Admin**: Full system management including menu, orders, QR codes, and billing

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS and Radix UI components
- **Real-time Updates**: Live order status tracking
- **Secure API**: JWT authentication with Django REST Framework
- **Database**: SQLite for development, easily configurable for production
- **CORS Support**: Configured for frontend-backend communication

## Tech Stack

### Backend
- **Django 4.2**: Web framework
- **Django REST Framework**: API development
- **JWT Authentication**: Secure token-based auth
- **SQLite**: Database (configurable)
- **Razorpay**: Payment gateway
- **MongoEngine/PyMongo**: Additional data handling
- **CORS Headers**: Cross-origin resource sharing

### Frontend
- **Next.js 15**: React framework
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Radix UI**: Component library
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **Framer Motion**: Animations
- **QR Code Libraries**: For generation and scanning

## Installation

### Prerequisites
- Python 3.8+
- Node.js 18+
- pnpm (recommended) or npm

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables (create `.env` file):
   ```env
   SECRET_KEY=your-secret-key-here
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   BASE_URL=http://localhost:3000
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_SECRET=your-razorpay-secret
   ```

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Create a superuser:
   ```bash
   python manage.py createsuperuser
   ```

7. Start the development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd food-crm
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server:
   ```bash
   pnpm dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Admin Panel: http://localhost:8000/admin

## Usage

### For Customers
1. **Scan QR Code**: Use your phone's camera to scan the QR code on your table
2. **Browse Menu**: View available items categorized by type
3. **Add to Cart**: Select items and quantities
4. **Place Order**: Review cart and submit order
5. **Track Order**: Monitor preparation status
6. **Make Payment**: Pay securely through integrated gateway

### For Staff
- **Chefs**: Access kitchen dashboard to update order statuses
- **Admins**: Manage menu items, view all orders, generate QR codes, handle billing

### Admin Features
- **Menu Management**: Add/edit/delete menu items with images
- **Order Oversight**: View and manage all orders
- **QR Code Generation**: Create unique codes for tables
- **User Management**: Handle staff accounts
- **Analytics**: Track sales and performance

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration with OTP
- `POST /api/auth/login/` - User login
- `POST /api/auth/verify-otp/` - OTP verification

### Menu
- `GET /api/menu/` - Get all menu items
- `POST /api/menu/` - Add new menu item (Admin)

### Orders
- `POST /api/orders/` - Create new order
- `GET /api/orders/` - Get user's orders
- `PATCH /api/orders/{id}/` - Update order status

### Tables
- `GET /api/tables/` - List all tables with QR URLs
- `POST /api/tables/` - Create new table (Admin)

### Payments
- `POST /api/payments/create/` - Create payment order
- `POST /api/payments/verify/` - Verify payment completion

## Project Structure

```
food-order-system/
├── backend/                    # Django backend
│   ├── foodapp/               # Main app
│   │   ├── models.py         # Database models
│   │   ├── views.py          # API views
│   │   ├── serializers.py    # Data serialization
│   │   └── urls.py           # URL routing
│   ├── foodproject/          # Django project settings
│   └── requirements.txt      # Python dependencies
├── food-crm/                  # Next.js frontend
│   ├── app/                  # Next.js app directory
│   ├── components/           # Reusable components
│   ├── routes/               # Page components
│   ├── context/              # React context
│   └── package.json          # Node dependencies
├── demo.py                    # Demo script
├── README.md                  # This file
└── TODO.md                    # Task tracking
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please open an issue in the GitHub repository.

---

Built with ❤️ using Django and Next.js
