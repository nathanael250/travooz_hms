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
import { FrontDeskBookingsList, ReceptionistDashboard, FrontDeskDashboard } from './pages/frontdesk';
import { DashboardRouter } from './pages/DashboardRouter';
import { MaintenanceRequests, MaintenanceAssets, MaintenanceDashboard } from './pages/maintenance';
import MaintenanceMyTasks from './pages/maintenance/MyTasks';
import StaffDashboard from './pages/staff/StaffDashboard';
import { RestaurantTables, MenuManagement, RestaurantOrders, OrderItems, KitchenQueue, OrderDelivery } from './pages/restaurant';
import { StockItems, StockMovements, Suppliers, PurchaseOrders, UsageLogs, InventoryAlerts, InventoryDashboard } from './pages/stock';
import { Invoices, AccountantDashboard } from './pages/financial';
import { AdminDashboard } from './pages/admin';
import { EditHomestay } from './pages/hotels/EditHomestay';
import { StayView } from './pages/hotels/StayView';
import InvoiceSettings from './pages/settings/InvoiceSettings';
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleProtectedRoute } from './components/RoleProtectedRoute'
import { Layout } from './components/Layout'
import { RoleBasedRedirect } from './components/RoleBasedRedirect'
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
          <Route index element={<RoleBasedRedirect />} />
          <Route path="dashboard" element={<DashboardRouter />} />
          
          {/* ROLE-BASED ROUTES */}
          
          {/* ACCOUNTANT ROUTES */}
          <Route path="accountant/*" element={
            <RoleProtectedRoute requiredSection="Financial Management">
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AccountantDashboard />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="payments" element={<div className="p-6"><h1>Payments</h1></div>} />
                <Route path="reports" element={<div className="p-6"><h1>Financial Reports</h1></div>} />
                <Route path="accounts" element={<Accounts />} />
              </Routes>
            </RoleProtectedRoute>
          } />

          {/* FRONT DESK ROUTES */}
          <Route path="front-desk/*" element={
            <RoleProtectedRoute requiredSection="Front Desk">
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                 <Route path="dashboard" element={<ReceptionistDashboard />} />
                <Route path="bookings" element={<FrontDeskBookingsList />} />
                <Route path="room-status" element={<FrontDeskRoomStatus />} />
                <Route path="in-house-guests" element={<InHouseGuests />} />
                <Route path="checkouts" element={<CheckOut />} />
                <Route path="walk-in-booking" element={<WalkInBooking />} />
                <Route path="guest-profiles" element={<GuestProfiles />} />
                <Route path="guest-folio/:bookingId" element={<GuestFolio />} />
                <Route path="upcoming-arrivals" element={<UpcomingArrivals />} />
                <Route path="check-out" element={<CheckOut />} />
              </Routes>
            </RoleProtectedRoute>
          } />

          {/* HOUSEKEEPING ROUTES */}
          <Route path="housekeeping/*" element={
            <RoleProtectedRoute requiredSection="Housekeeping">
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<HousekeepingDashboard />} />
                <Route path="my-tasks" element={<HousekeepingTasks />} />
                <Route path="tasks" element={<MyTasks />} />
                <Route path="pending" element={<MyTasks />} />
                <Route path="completed" element={<MyTasks />} />
                <Route path="room-cleaning" element={<div className="p-6"><h1>Room Cleaning</h1></div>} />
                <Route path="supply-requests" element={<div className="p-6"><h1>Supply Requests</h1></div>} />
              </Routes>
            </RoleProtectedRoute>
          } />

          {/* MAINTENANCE ROUTES */}
          <Route path="maintenance/*" element={
            <RoleProtectedRoute requiredSection="Maintenance">
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<MaintenanceDashboard />} />
                <Route path="my-tasks" element={<MaintenanceMyTasks />} />
                <Route path="requests" element={<MaintenanceRequests />} />
                <Route path="equipment" element={<MaintenanceAssets />} />
                <Route path="assets" element={<MaintenanceAssets />} />
              </Routes>
            </RoleProtectedRoute>
          } />

          {/* RESTAURANT ROUTES */}
          <Route path="restaurant/*" element={
            <RoleProtectedRoute requiredSection="Restaurant">
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<div className="p-6"><h1>Restaurant Dashboard</h1></div>} />
                <Route path="tables" element={<RestaurantTables />} />
                <Route path="orders" element={<RestaurantOrders />} />
                <Route path="kitchen-queue" element={<KitchenQueue />} />
                <Route path="menu" element={<MenuManagement />} />
                <Route path="order-items" element={<OrderItems />} />
                <Route path="delivery" element={<OrderDelivery />} />
              </Routes>
            </RoleProtectedRoute>
          } />

          {/* INVENTORY ROUTES */}
          <Route path="inventory/*" element={
            <RoleProtectedRoute requiredSection="Stock Management">
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<InventoryDashboard />} />
                <Route path="items" element={<StockItems />} />
                <Route path="movements" element={<StockMovements />} />
                <Route path="orders" element={<PurchaseOrders />} />
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="usage-logs" element={<UsageLogs />} />
                <Route path="alerts" element={<InventoryAlerts />} />
              </Routes>
            </RoleProtectedRoute>
          } />

          {/* ADMIN/MANAGER ROUTES */}
          <Route path="admin/*" element={
            <RoleProtectedRoute requiredSection="Admin">
              <Routes>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="bookings" element={<RoomBookings />} />
                <Route path="guests" element={<div className="p-6"><h1>Guest Management</h1></div>} />
                <Route path="financial" element={<AccountantDashboard />} />
                <Route path="staff" element={<div className="p-6"><h1>Staff Management</h1></div>} />
                <Route path="reports" element={<div className="p-6"><h1>Reports</h1></div>} />
                <Route path="settings" element={<InvoiceSettings />} />
                <Route path="hotels/*" element={
                  <Routes>
                    <Route path="homestays" element={<Homestays />} />
                    <Route path="homestays/:id" element={<HomestayDetails />} />
                    <Route path="homestays/:id/edit" element={<EditHomestay />} />
                    <Route path="homestays/:id/stay-view" element={<StayView />} />
                    <Route path="homestays/create" element={<CreateHomestay />} />
                    <Route path="hms-users" element={<HMSUsers />} />
                    <Route path="room-types" element={<RoomTypes />} />
                    <Route path="room-inventory" element={<RoomInventory />} />
                    <Route path="room-images" element={<RoomImages />} />
                    <Route path="room-rates" element={<RoomRates />} />
                    <Route path="room-availability" element={<RoomAvailability />} />
                    <Route path="room-status" element={<RoomStatusLog />} />
                    <Route path="room-assignments" element={<RoomAssignments />} />
                  </Routes>
                } />
              </Routes>
            </RoleProtectedRoute>
          } />

          {/* MANAGER/VENDOR ROUTES */}
          <Route path="manager/*" element={
            <RoleProtectedRoute requiredSection="Hotel Management">
              <Routes>
                <Route path="front-desk/*" element={
                  <Routes>
                    <Route path="dashboard" element={<FrontDeskDashboard />} />
                    <Route path="bookings" element={<FrontDeskBookingsList />} />
                    <Route path="upcoming-arrivals" element={<UpcomingArrivals />} />
                    <Route path="in-house-guests" element={<InHouseGuests />} />
                    <Route path="check-out" element={<CheckOut />} />
                    <Route path="room-status" element={<FrontDeskRoomStatus />} />
                    <Route path="walk-in-booking" element={<WalkInBooking />} />
                    <Route path="guest-folio" element={<GuestFolio />} />
                    <Route path="guest-folio/:bookingId" element={<GuestFolio />} />
                    <Route path="guest-profiles" element={<GuestProfiles />} />
                  </Routes>
                } />
              </Routes>
            </RoleProtectedRoute>
          } />

          {/* LEGACY ROUTES (for backward compatibility) */}
          <Route path="bookings/room-bookings" element={<RoomBookings />} />
          <Route path="bookings/multi-room-bookings" element={<MultiRoomBookings />} />
          <Route path="bookings/booking-guests" element={<BookingGuests />} />
          <Route path="bookings/booking-modifications" element={<BookingModifications />} />
          <Route path="bookings/booking-charges" element={<BookingCharges />} />
          <Route path="bookings/external-bookings" element={<ExternalBookings />} />

          <Route path="financial/accounts" element={<Accounts />} />
          <Route path="financial/account-linkage" element={<AccountLinkage />} />
          <Route path="financial/account-summary" element={<AccountSummary />} />
          <Route path="financial/invoices" element={<Invoices />} />

          <Route path="restaurant/tables" element={<RestaurantTables />} />
          <Route path="restaurant/menu" element={<MenuManagement />} />
          <Route path="restaurant/orders" element={<RestaurantOrders />} />
          <Route path="restaurant/order-items" element={<OrderItems />} />
          <Route path="restaurant/kitchen-queue" element={<KitchenQueue />} />
          <Route path="restaurant/delivery" element={<OrderDelivery />} />

          <Route path="stock/items" element={<StockItems />} />
          <Route path="stock/movements" element={<StockMovements />} />
          <Route path="stock/suppliers" element={<Suppliers />} />
          <Route path="stock/orders" element={<PurchaseOrders />} />
          <Route path="stock/usage-logs" element={<UsageLogs />} />
          <Route path="stock/alerts" element={<InventoryAlerts />} />

          <Route path="front-desk/bookings" element={<FrontDeskBookingsList />} />
          <Route path="front-desk/upcoming-arrivals" element={<UpcomingArrivals />} />
          <Route path="front-desk/in-house-guests" element={<InHouseGuests />} />
          <Route path="front-desk/check-out" element={<CheckOut />} />
          <Route path="front-desk/room-status" element={<FrontDeskRoomStatus />} />
          <Route path="front-desk/walk-in-booking" element={<WalkInBooking />} />
          <Route path="front-desk/guest-folio" element={<GuestFolio />} />
          <Route path="front-desk/guest-folio/:bookingId" element={<GuestFolio />} />
          <Route path="front-desk/guest-profiles" element={<GuestProfiles />} />

          <Route path="housekeeping/dashboard" element={<HousekeepingDashboard />} />
          <Route path="housekeeping/tasks" element={<MyTasks />} />

          <Route path="maintenance/dashboard" element={<MaintenanceDashboard />} />
          <Route path="maintenance/requests" element={<MaintenanceRequests />} />
          <Route path="maintenance/assets" element={<MaintenanceAssets />} />
          <Route path="maintenance/my-tasks" element={<MaintenanceMyTasks />} />

          <Route path="staff/dashboard" element={<StaffDashboard />} />
          <Route path="staff/my-tasks" element={<StaffDashboard />} />

          <Route path="settings/invoice-settings" element={<InvoiceSettings />} />

          <Route path="hotels/edit-homestay" element={<EditHomestay />} />
          <Route path="hotels/stay-view" element={<StayView />} />

          <Route path="reports" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Reports</h1>
              <p>Reports functionality coming soon...</p>
            </div>
          } />

          <Route path="settings" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold">Settings</h1>
              <p>Settings functionality coming soon...</p>
            </div>
          } />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;