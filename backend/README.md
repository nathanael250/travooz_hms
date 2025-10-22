# Travooz HMS Backend

Hotel Management System Backend API built with Node.js, Express, and MySQL.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Hotel Management**: Complete hotel and room management
- **Booking System**: Comprehensive booking lifecycle management
- **Guest Management**: Guest profiles and preferences
- **Front Desk Operations**: Check-in/check-out and front desk logging
- **Housekeeping**: Task management and room status tracking
- **Inventory Management**: Room inventory and asset tracking
- **Reporting**: Occupancy, revenue, and guest analytics
- **Admin Panel**: User management and system administration

## Project Structure

```
src/
├── app.js                 # Main application file
├── controllers/           # Request handlers
├── middlewares/           # Custom middleware
│   ├── auth.middleware.js
│   ├── admin.middleware.js
│   ├── logging.middleware.js
│   └── rateLimiter.middleware.js
├── models/               # Database models
│   ├── index.js
│   ├── user.model.js
│   ├── hotel.model.js
│   ├── room.model.js
│   ├── guest.model.js
│   ├── booking.model.js
│   ├── payment.model.js
│   └── ...
├── routes/               # API routes
│   ├── auth.routes.js
│   ├── hotel.routes.js
│   ├── room.routes.js
│   ├── booking.routes.js
│   └── ...
├── services/             # Business logic
├── utils/                # Utility functions
│   ├── auth.utils.js
│   ├── response.utils.js
│   └── validation.utils.js
└── views/                # Email templates
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your database and other configurations

5. Create the database and run migrations:
   ```bash
   # Create database manually in MySQL
   # The application will sync tables automatically on startup
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

```env
NODE_ENV=development
PORT=3001

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=travooz_hms
DB_USER=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# API Configuration
API_VERSION=v1
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/logout` - User logout

### Hotels
- `GET /api/v1/hotels` - Get all hotels
- `GET /api/v1/hotels/:id` - Get hotel by ID
- `POST /api/v1/hotels` - Create hotel
- `PUT /api/v1/hotels/:id` - Update hotel
- `DELETE /api/v1/hotels/:id` - Delete hotel

### Rooms
- `GET /api/v1/rooms` - Get all rooms
- `GET /api/v1/rooms/:id` - Get room by ID
- `POST /api/v1/rooms` - Create room
- `PUT /api/v1/rooms/:id` - Update room
- `PATCH /api/v1/rooms/:id/status` - Update room status

### Guests
- `GET /api/v1/guests` - Get all guests
- `GET /api/v1/guests/:id` - Get guest by ID
- `POST /api/v1/guests` - Create guest
- `PUT /api/v1/guests/:id` - Update guest

### Bookings
- `GET /api/v1/bookings` - Get all bookings
- `GET /api/v1/bookings/:id` - Get booking by ID
- `POST /api/v1/bookings` - Create booking
- `PATCH /api/v1/bookings/:id/checkin` - Check-in guest
- `PATCH /api/v1/bookings/:id/checkout` - Check-out guest

### Front Desk
- `GET /api/v1/front-desk/logs` - Get front desk logs
- `POST /api/v1/front-desk/logs` - Create front desk log
- `GET /api/v1/front-desk/dashboard` - Get front desk dashboard

### Housekeeping
- `GET /api/v1/housekeeping/tasks` - Get housekeeping tasks
- `POST /api/v1/housekeeping/tasks` - Create housekeeping task
- `PATCH /api/v1/housekeeping/tasks/:id/status` - Update task status
- `GET /api/v1/housekeeping/dashboard` - Get housekeeping dashboard

### Reports
- `GET /api/v1/reports/occupancy` - Get occupancy report
- `GET /api/v1/reports/revenue` - Get revenue report
- `GET /api/v1/reports/guests` - Get guest statistics

### Admin (Admin only)
- `GET /api/v1/admin/dashboard` - Get admin dashboard
- `GET /api/v1/admin/users` - Get all users
- `POST /api/v1/admin/users` - Create user
- `PUT /api/v1/admin/users/:id` - Update user
- `PATCH /api/v1/admin/users/:id/deactivate` - Deactivate user

## User Roles

- `super_admin` - Full system access
- `admin` - Hotel group administration
- `hotel_manager` - Single hotel management
- `front_desk` - Front desk operations
- `housekeeping` - Housekeeping operations
- `staff` - Basic staff access

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error (development only)"
}
```

## Development

```bash
# Start development server with auto-reload
npm run dev

# Run tests
npm test

# Run tests with watch mode
npm run test:watch
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure production database settings
3. Set secure JWT secret
4. Configure email settings for notifications
5. Set up proper logging and monitoring

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Input validation
- SQL injection prevention
- CORS configuration
- Security headers with Helmet

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

This project is licensed under the ISC License.