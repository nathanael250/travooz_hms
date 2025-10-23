import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import {
  Dashboard,
  Hotels,
  Rooms,
  Guests,
  FrontDesk,
  Housekeeping,
  Reports,
  Settings,
  Homestays,
  HomestayDetails,
  CreateHomestay,
  HMSUsers,
  RoomTypes,
  RoomInventory,
  RoomImages,
  RoomRates,
  RoomAvailability,
  RoomStatusLog,
  RoomAssignments,
  BookingsList,
  RoomBookings,
  MultiRoomBookings,
  BookingGuests,
  BookingModifications,
  BookingCharges,
  ExternalBookings,
  Accounts,
  AccountLinkage,
  AccountSummary,
  GuestProfiles,
  GuestRequests,
  GuestComplaints,
  GuestReviews,
  UserFavorites,
  HousekeepingDashboard,
  HousekeepingTasks,
  MyTasks,
  UpcomingArrivals,
  CheckOut,
  InHouseGuests,
  FrontDeskRoomStatus,
  WalkInBooking,
  GuestFolio
} from './pages';
import {Bookings} from './pages/bookings/Bookings';
import { FrontDeskBookingsList } from './pages/frontdesk';
import { DashboardRouter } from './pages/DashboardRouter';
import { MaintenanceRequests, MaintenanceAssets, MaintenanceDashboard } from './pages/maintenance';
import StaffDashboard from './pages/staff/StaffDashboard';
import { RestaurantTables, MenuManagement, RestaurantOrders, OrderItems, KitchenQueue, OrderDelivery } from './pages/restaurant';
import { StockItems, StockMovements, Suppliers, PurchaseOrders, UsageLogs, InventoryAlerts } from './pages/stock';
import { Invoices } from './pages/financial';
import { EditHomestay } from './pages/hotels/EditHomestay';
import { StayView } from './pages/hotels/StayView';
import InvoiceSettings from './pages/settings/InvoiceSettings';
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import HotelAccessGuard from './components/HotelAccessGuard'
import { Layout } from './components/Layout'
import { Login, Register } from './pages'
import './i18n/config' // Initialize i18n

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with main layout */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardRouter />} />
          
          {/* Hotel Management Routes */}
          <Route path="hotels/homestays" element={<Homestays />} />
          <Route path="hotels/homestays/:id" element={<HomestayDetails />} />
          <Route path="hotels/homestays/:id/edit" element={<EditHomestay />} />
          <Route path="hotels/homestays/:id/stay-view" element={<StayView />} />
          <Route path="hotels/homestays/create" element={<CreateHomestay />} />
          <Route path="hotels/hms-users" element={<HMSUsers />} />
          <Route path="hotels/room-types" element={<RoomTypes />} />
          <Route path="hotels/room-inventory" element={<RoomInventory />} />
          <Route path="hotels/room-images" element={<RoomImages />} />
          <Route path="hotels/room-rates" element={<RoomRates />} />
          <Route path="hotels/room-availability" element={<RoomAvailability />} />
          <Route path="hotels/room-status" element={<RoomStatusLog />} />
          <Route path="hotels/room-assignments" element={<RoomAssignments />} />
          
          {/* Booking Management Routes */}
          <Route path="bookings/bookings" element={<BookingsList />} />
          <Route path="bookings/room-bookings" element={<Bookings />} />
          <Route path="bookings/multi-room-bookings" element={<MultiRoomBookings />} />
          <Route path="bookings/booking-guests" element={<BookingGuests />} />
          <Route path="bookings/booking-modifications" element={<BookingModifications />} />
          <Route path="bookings/booking-charges" element={<BookingCharges />} />
          <Route path="bookings/external-bookings" element={<ExternalBookings />} />

          {/* Financial Management Routes */}
          <Route path="financial/accounts" element={<Accounts />} />
          <Route path="financial/account-linkage" element={<AccountLinkage />} />
          <Route path="financial/account-summary" element={<AccountSummary />} />
          <Route path="financial/invoices" element={<Invoices />} />

          {/* Guest Management Routes */}
          <Route path="guests/guest-requests" element={<GuestRequests />} />
          <Route path="guests/guest-complaints" element={<GuestComplaints />} />
          <Route path="guests/guest-reviews" element={<GuestReviews />} />
          <Route path="guests/user-favorites" element={<UserFavorites />} />

          {/* Housekeeping Management Routes */}
          <Route path="housekeeping/dashboard" element={<HousekeepingDashboard />} />
          <Route path="housekeeping/tasks" element={<HousekeepingTasks />} />
          <Route path="housekeeping/my-tasks" element={<MyTasks />} />
          <Route path="housekeeping/pending" element={<HousekeepingTasks />} />
          <Route path="housekeeping/completed" element={<HousekeepingTasks />} />

          {/* Staff Dashboard Routes */}
          <Route path="staff/dashboard" element={<StaffDashboard />} />
          <Route path="staff/my-tasks" element={<StaffDashboard />} />

          {/* Maintenance Management Routes */}
          <Route path="maintenance/dashboard" element={<MaintenanceDashboard />} />
          <Route path="maintenance/requests" element={<MaintenanceRequests />} />
          <Route path="maintenance/assets" element={<MaintenanceAssets />} />

          {/* Restaurant & Kitchen Routes */}
          <Route path="restaurant/tables" element={<RestaurantTables />} />
          <Route path="restaurant/menu" element={<MenuManagement />} />
          <Route path="restaurant/orders" element={<RestaurantOrders />} />
          <Route path="restaurant/order-items" element={<OrderItems />} />
          <Route path="restaurant/kitchen-queue" element={<KitchenQueue />} />
          <Route path="restaurant/delivery" element={<OrderDelivery />} />

          {/* Stock Management Routes */}
          <Route path="stock/items" element={<StockItems />} />
          <Route path="stock/movements" element={<StockMovements />} />
          <Route path="stock/suppliers" element={<Suppliers />} />
          <Route path="stock/orders" element={<PurchaseOrders />} />
          <Route path="stock/usage-logs" element={<UsageLogs />} />
          <Route path="stock/alerts" element={<InventoryAlerts />} />

          {/* Front Desk Routes - RECEPTIONIST */}
          <Route path="front-desk/bookings" element={<FrontDeskBookingsList />} />
          <Route path="front-desk/upcoming-arrivals" element={<UpcomingArrivals />} />
          <Route path="front-desk/check-out" element={<CheckOut />} />
          <Route path="front-desk/in-house-guests" element={<InHouseGuests />} />
          <Route path="front-desk/room-status" element={<FrontDeskRoomStatus />} />
          <Route path="front-desk/walk-in-booking" element={<WalkInBooking />} />
          <Route path="front-desk/guest-folio" element={<GuestFolio />} />
          <Route path="front-desk/guest-profiles" element={<GuestProfiles />} />

          {/* Front Desk Routes - MANAGER */}
          <Route path="manager/front-desk/bookings" element={<FrontDeskBookingsList />} />
          <Route path="manager/front-desk/upcoming-arrivals" element={<UpcomingArrivals />} />
          <Route path="manager/front-desk/check-out" element={<CheckOut />} />
          <Route path="manager/front-desk/in-house-guests" element={<InHouseGuests />} />
          <Route path="manager/front-desk/room-status" element={<FrontDeskRoomStatus />} />
          <Route path="manager/front-desk/walk-in-booking" element={<WalkInBooking />} />
          <Route path="manager/front-desk/guest-folio" element={<GuestFolio />} />
          <Route path="manager/front-desk/guest-profiles" element={<GuestProfiles />} />

          {/* Settings Routes */}
          <Route path="settings" element={<Settings />} />
          <Route path="settings/invoice" element={<InvoiceSettings />} />

          {/* Legacy routes */}
          <Route path="hotels" element={<Hotels />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="guests" element={<Guests />} />
          <Route path="bookings" element={<Navigate to="/bookings/bookings" replace />} />
          <Route path="front-desk" element={<FrontDesk />} />
          <Route path="housekeeping" element={<Housekeeping />} />
          <Route path="reports" element={<Reports />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App