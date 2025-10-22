// Export all pages
export { Login } from './Login';
export { Register } from './Register';
export { Dashboard } from './Dashboard';
export { Hotels } from './Hotels';
export { Rooms } from './Rooms';
export { Guests } from './Guests';
export { FrontDesk } from './FrontDesk';
export { Housekeeping } from './Housekeeping';
export { Settings } from './Settings';

// Default exports
export { default as Reports } from './Reports';

// Export Hotel Management pages
export {
  Homestays,
  HomestayDetails,
  CreateHomestay,
  HMSUsers,
  RoomTypes,
  RoomInventory,
  RoomImages,
  RoomRates,
  RoomAvailability,
  RoomStatus,
  RoomStatusLog,
  RoomAssignments
} from './hotels';

// Export Booking Management pages
export {
  Bookings as BookingsList,
  RoomBookings,
  MultiRoomBookings,
  BookingGuests,
  BookingModifications,
  BookingCharges,
  ExternalBookings
} from './bookings';

// Export Financial Management pages
export {
  Accounts,
  AccountLinkage,
  AccountSummary
} from './financial';

// Export Guest Management pages
export {
  GuestProfiles,
  GuestRequests,
  GuestComplaints,
  GuestReviews,
  UserFavorites
} from './guests';

// Export Housekeeping Management pages
export {
  HousekeepingDashboard,
  HousekeepingTasks,
  MyTasks
} from './housekeeping';

// Export Front Desk Management pages
export {
  UpcomingArrivals,
  CheckOut,
  InHouseGuests,
  RoomStatus as FrontDeskRoomStatus,
  WalkInBooking,
  GuestFolio
} from './frontdesk';