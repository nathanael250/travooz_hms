# Travooz Hotel Management System (HMS)

A comprehensive Hotel Management System built with Node.js/Express backend and React frontend, designed to integrate seamlessly with the main Travooz system.

## 🏗️ Project Structure

```
travooz_hms/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database & app configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions
│   └── server.js          # Entry point
└── frontend/              # React/Vite frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── contexts/      # React contexts
    │   ├── pages/         # Page components
    │   ├── services/      # API services
    │   └── utils/         # Utility functions
    └── package.json
```

## 🚀 Technologies Used

### Backend
- **Node.js** with **Express.js**
- **Sequelize ORM** with **MySQL**
- **JWT Authentication**
- **bcrypt** for password hashing
- **Express Rate Limiting**
- **Helmet** for security headers

### Frontend
- **React 18** with **Vite**
- **React Router v6** for routing
- **Tailwind CSS** for styling
- **React Query** for state management
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons

## 👥 User Roles & Permissions

The system supports 6 hierarchical user roles:

1. **Super Admin** - Full system access
2. **Admin** - Hotel management and oversight
3. **Hotel Manager** - Hotel operations management
4. **Front Desk** - Guest services and bookings
5. **Housekeeping** - Room maintenance and cleaning
6. **Staff** - Basic access for operational tasks

## 📊 Core Features

### Hotel Management
- Multi-hotel support
- Hotel registration and configuration
- Amenities and services management

### Room Management
- Room types and categories
- Real-time availability tracking
- Pricing and inventory management

### Guest Management
- Guest profiles and history
- Contact information and preferences
- Guest services tracking

### Booking System
- Reservation management
- Check-in/Check-out processes
- Payment processing and invoicing

### Front Desk Operations
- Daily operations logging
- Guest service requests
- Incident reporting

### Housekeeping
- Room cleaning schedules
- Maintenance task tracking
- Status updates and reporting

### Reporting & Analytics
- Occupancy reports
- Revenue analytics
- Performance metrics
- Custom report generation

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Set up MySQL database:
   ```bash
   # Create database
   mysql -u root -p
   CREATE DATABASE travooz_hms;
   ```

5. Run database migrations:
   ```bash
   npm run migrate
   ```

6. Start the server:
   ```bash
   npm run dev
   ```

Backend will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

Frontend will be available at `http://localhost:5173`

## 🔗 API Documentation

The backend provides RESTful APIs for all HMS operations:

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get user profile

### Hotels
- `GET /api/hotels` - List all hotels
- `POST /api/hotels` - Create new hotel
- `GET /api/hotels/:id` - Get hotel details
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel

### Rooms
- `GET /api/rooms` - List rooms
- `POST /api/rooms` - Create room
- `GET /api/rooms/:id` - Get room details
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Guests
- `GET /api/guests` - List guests
- `POST /api/guests` - Create guest
- `GET /api/guests/:id` - Get guest details
- `PUT /api/guests/:id` - Update guest

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Front Desk
- `GET /api/front-desk/logs` - Get daily logs
- `POST /api/front-desk/logs` - Create log entry
- `POST /api/front-desk/checkin` - Check-in guest
- `POST /api/front-desk/checkout` - Check-out guest

### Housekeeping
- `GET /api/housekeeping/tasks` - List tasks
- `POST /api/housekeeping/tasks` - Create task
- `PUT /api/housekeeping/tasks/:id` - Update task status

### Reports
- `GET /api/reports/occupancy` - Occupancy report
- `GET /api/reports/revenue` - Revenue report
- `GET /api/reports/bookings` - Booking statistics

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Security headers with Helmet

## 🎨 Frontend Architecture

### Component Structure
- **Pages**: Route-level components
- **Components**: Reusable UI components
- **Contexts**: Global state management
- **Services**: API communication layer
- **Utils**: Helper functions

### State Management
- **React Query** for server state
- **React Context** for global app state
- **React Hook Form** for form state

## 🔄 Integration with Main Travooz System

This HMS is designed with the same architectural patterns as the main Travooz system:

- **Consistent API structure** for easy integration
- **Shared authentication patterns** for SSO capability
- **Compatible database schema** for data synchronization
- **Matching UI/UX patterns** for seamless user experience
- **Similar deployment structure** for operational consistency

## 📝 Development Status

### ✅ Completed
- [x] Complete backend API structure
- [x] Database models and relationships
- [x] Authentication and authorization system
- [x] Frontend component architecture
- [x] Basic page layouts and routing
- [x] Development environment setup

### 🚧 In Progress
- [ ] API integration in frontend components
- [ ] Form handling and validation
- [ ] Data fetching and state management
- [ ] UI component completion

### 📋 Upcoming
- [ ] Database seeding and testing
- [ ] End-to-end testing
- [ ] Production deployment configuration
- [ ] Documentation completion
- [ ] Integration with main Travooz system

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Maintain consistency with the main Travooz system
3. Write clean, documented code
4. Test all changes thoroughly
5. Update documentation as needed

## 📄 License

This project is part of the Travooz ecosystem and follows the same licensing terms.

---

**Note**: This HMS system is designed specifically for integration with the main Travooz platform and follows its architectural patterns for seamless future integration.