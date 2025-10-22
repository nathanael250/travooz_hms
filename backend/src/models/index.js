const User = require('./user.model');
const HMSUser = require('./hmsUser.model');
const Location = require('./location.model');
const Homestay = require('./homestay.model');
const Booking = require('./booking.model');
const GuestProfile = require('./guestProfile.model');
const GuestRequest = require('./guestRequest.model');
const RestaurantImage = require('./restaurantImage.model');
const Room = require('./room.model');
const RoomType = require('./roomType.model');
const RoomRate = require('./roomRate.model');
const RoomAvailability = require('./roomAvailability.model');
const RoomStatusLog = require('./roomStatusLog.model');
const RoomBooking = require('./roomBooking.model');
const BookingGuest = require('./bookingGuest.model');
const BookingCharge = require('./bookingCharge.model');
const BookingModification = require('./bookingModification.model');
const ExternalBooking = require('./externalBooking.model');
const MultiRoomBooking = require('./multiRoomBooking.model');
const FinancialAccount = require('./financialAccount.model');
const GuestComplaint = require('./guestComplaint.model');
const GuestReview = require('./guestReview.model');
const UserFavorite = require('./userFavorite.model');
const HousekeepingTask = require('./housekeepingTask.model');
const MaintenanceRequest = require('./maintenanceRequest.model');
const MaintenanceAsset = require('./maintenanceAsset.model');
const HotelRestaurant = require('./hotelRestaurant.model');
const RestaurantTable = require('./restaurantTable.model');
const MenuCategory = require('./menuCategory.model');
const MenuItem = require('./menuItem.model');
const RestaurantOrder = require('./restaurantOrder.model');
const OrderItem = require('./orderItem.model');
const KitchenQueue = require('./kitchenQueue.model');
const OrderDeliveryInfo = require('./orderDeliveryInfo.model');
const StockItem = require('./stockItem.model');
const StockMovement = require('./stockMovement.model');
const StockSupplier = require('./stockSupplier.model');
const StockUsageLog = require('./stockUsageLog.model');
const StockOrder = require('./stockOrder.model');
const StockOrderItem = require('./stockOrderItem.model');
const RoomAssignment = require('./roomAssignment.model');
const MenuItemIngredient = require('./menuItemIngredient.model');

// Define associations
// Location associations
Location.hasMany(Homestay, { foreignKey: 'location_id', as: 'homestays' });
Homestay.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });

User.hasMany(Homestay, { foreignKey: 'vendor_id', as: 'homestays' });
Homestay.belongsTo(User, { foreignKey: 'vendor_id', as: 'vendor' });

User.hasMany(Booking, { foreignKey: 'user_id', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(GuestProfile, { foreignKey: 'user_id', as: 'guestProfile' });
GuestProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Booking.hasMany(GuestRequest, { foreignKey: 'booking_id', as: 'requests' });
GuestRequest.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

GuestProfile.hasMany(GuestRequest, { foreignKey: 'guest_id', as: 'requests' });
GuestRequest.belongsTo(GuestProfile, { foreignKey: 'guest_id', as: 'guest' });

User.hasMany(GuestRequest, { foreignKey: 'assigned_to', as: 'assignedRequests' });
GuestRequest.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedStaff' });

// Room Type associations
Homestay.hasMany(RoomType, { foreignKey: 'homestay_id', as: 'roomTypes' });
RoomType.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

RoomType.hasMany(Room, { foreignKey: 'room_type_id', as: 'rooms' });
Room.belongsTo(RoomType, { foreignKey: 'room_type_id', as: 'roomType' });

// Room associations
Room.hasMany(RoomStatusLog, { foreignKey: 'inventory_id', as: 'statusLogs' });
RoomStatusLog.belongsTo(Room, { foreignKey: 'inventory_id', as: 'room' });

Room.hasMany(RoomAvailability, { foreignKey: 'inventory_id', as: 'availability' });
RoomAvailability.belongsTo(Room, { foreignKey: 'inventory_id', as: 'room' });

User.hasMany(RoomStatusLog, { foreignKey: 'changed_by', as: 'statusChanges' });
RoomStatusLog.belongsTo(User, { foreignKey: 'changed_by', as: 'changedByUser' });

// Room Booking associations
Booking.hasOne(RoomBooking, { foreignKey: 'booking_id', as: 'roomBooking' });
RoomBooking.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

RoomType.hasMany(RoomBooking, { foreignKey: 'room_type_id', as: 'bookings' });
RoomBooking.belongsTo(RoomType, { foreignKey: 'room_type_id', as: 'roomType' });

Room.hasMany(RoomBooking, { foreignKey: 'inventory_id', as: 'bookings' });
RoomBooking.belongsTo(Room, { foreignKey: 'inventory_id', as: 'room' });

// Room Assignment associations
Booking.hasMany(RoomAssignment, { foreignKey: 'booking_id', as: 'roomAssignments' });
RoomAssignment.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

Room.hasMany(RoomAssignment, { foreignKey: 'inventory_id', as: 'assignments' });
RoomAssignment.belongsTo(Room, { foreignKey: 'inventory_id', as: 'room' });

User.hasMany(RoomAssignment, { foreignKey: 'assigned_by', as: 'roomAssignmentsCreated' });
RoomAssignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedByUser' });

// Booking Guest associations
Booking.hasMany(BookingGuest, { foreignKey: 'booking_id', as: 'guests' });
BookingGuest.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

GuestProfile.hasMany(BookingGuest, { foreignKey: 'guest_id', as: 'bookings' });
BookingGuest.belongsTo(GuestProfile, { foreignKey: 'guest_id', as: 'guest' });

// Booking Charge associations
Booking.hasMany(BookingCharge, { foreignKey: 'booking_id', as: 'charges' });
BookingCharge.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

User.hasMany(BookingCharge, { foreignKey: 'charged_by', as: 'chargesCreated' });
BookingCharge.belongsTo(User, { foreignKey: 'charged_by', as: 'chargedByUser' });

// Booking Modification associations
Booking.hasMany(BookingModification, { foreignKey: 'booking_id', as: 'modifications' });
BookingModification.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

User.hasMany(BookingModification, { foreignKey: 'requested_by', as: 'modificationsRequested' });
BookingModification.belongsTo(User, { foreignKey: 'requested_by', as: 'requestedByUser' });

User.hasMany(BookingModification, { foreignKey: 'approved_by', as: 'modificationsApproved' });
BookingModification.belongsTo(User, { foreignKey: 'approved_by', as: 'approvedByUser' });

User.hasMany(BookingModification, { foreignKey: 'rejected_by', as: 'modificationsRejected' });
BookingModification.belongsTo(User, { foreignKey: 'rejected_by', as: 'rejectedByUser' });

// External Booking associations
Booking.hasOne(ExternalBooking, { foreignKey: 'internal_booking_id', as: 'externalBooking' });
ExternalBooking.belongsTo(Booking, { foreignKey: 'internal_booking_id', as: 'booking' });

User.hasMany(ExternalBooking, { foreignKey: 'created_by', as: 'externalBookingsCreated' });
ExternalBooking.belongsTo(User, { foreignKey: 'created_by', as: 'createdByUser' });

User.hasMany(ExternalBooking, { foreignKey: 'synced_by', as: 'externalBookingsSynced' });
ExternalBooking.belongsTo(User, { foreignKey: 'synced_by', as: 'syncedByUser' });

// Multi-Room Booking associations
MultiRoomBooking.hasMany(RoomBooking, { foreignKey: 'multi_room_booking_id', as: 'roomBookings' });
RoomBooking.belongsTo(MultiRoomBooking, { foreignKey: 'multi_room_booking_id', as: 'multiRoomBooking' });

User.hasMany(MultiRoomBooking, { foreignKey: 'created_by', as: 'multiRoomBookingsCreated' });
MultiRoomBooking.belongsTo(User, { foreignKey: 'created_by', as: 'createdByUser' });

// Financial Account associations
Homestay.hasMany(FinancialAccount, { foreignKey: 'homestay_id', as: 'financialAccounts' });
FinancialAccount.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

// Guest Complaint associations
Booking.hasMany(GuestComplaint, { foreignKey: 'booking_id', as: 'complaints' });
GuestComplaint.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

GuestProfile.hasMany(GuestComplaint, { foreignKey: 'guest_id', as: 'complaints' });
GuestComplaint.belongsTo(GuestProfile, { foreignKey: 'guest_id', as: 'guest' });

User.hasMany(GuestComplaint, { foreignKey: 'assigned_to', as: 'assignedComplaints' });
GuestComplaint.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedStaff' });

// Guest Review associations
Booking.hasMany(GuestReview, { foreignKey: 'booking_id', as: 'reviews' });
GuestReview.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

GuestProfile.hasMany(GuestReview, { foreignKey: 'guest_id', as: 'reviews' });
GuestReview.belongsTo(GuestProfile, { foreignKey: 'guest_id', as: 'guest' });

Homestay.hasMany(GuestReview, { foreignKey: 'homestay_id', as: 'reviews' });
GuestReview.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

Room.hasMany(GuestReview, { foreignKey: 'inventory_id', as: 'reviews' });
GuestReview.belongsTo(Room, { foreignKey: 'inventory_id', as: 'room' });

// User Favorite associations
GuestProfile.hasMany(UserFavorite, { foreignKey: 'guest_id', as: 'favorites' });
UserFavorite.belongsTo(GuestProfile, { foreignKey: 'guest_id', as: 'guest' });

// Housekeeping Task associations
Homestay.hasMany(HousekeepingTask, { foreignKey: 'homestay_id', as: 'housekeepingTasks' });
HousekeepingTask.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

Room.hasMany(HousekeepingTask, { foreignKey: 'inventory_id', as: 'housekeepingTasks' });
HousekeepingTask.belongsTo(Room, { foreignKey: 'inventory_id', as: 'room' });

User.hasMany(HousekeepingTask, { foreignKey: 'assigned_to', as: 'assignedTasks' });
HousekeepingTask.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedStaff' });

User.hasMany(HousekeepingTask, { foreignKey: 'assigned_by', as: 'tasksAssigned' });
HousekeepingTask.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignedByUser' });

User.hasMany(HousekeepingTask, { foreignKey: 'verified_by', as: 'tasksVerified' });
HousekeepingTask.belongsTo(User, { foreignKey: 'verified_by', as: 'verifiedByUser' });

Booking.hasMany(HousekeepingTask, { foreignKey: 'booking_id', as: 'housekeepingTasks' });
HousekeepingTask.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

// Maintenance Request associations
Homestay.hasMany(MaintenanceRequest, { foreignKey: 'homestay_id', as: 'maintenanceRequests' });
MaintenanceRequest.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

Room.hasMany(MaintenanceRequest, { foreignKey: 'room_id', as: 'maintenanceRequests' });
MaintenanceRequest.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

User.hasMany(MaintenanceRequest, { foreignKey: 'reported_by', as: 'reportedMaintenanceRequests' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'reported_by', as: 'reportedByUser' });

User.hasMany(MaintenanceRequest, { foreignKey: 'assigned_to', as: 'assignedMaintenanceRequests' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedStaff' });

// Maintenance Asset associations
Homestay.hasMany(MaintenanceAsset, { foreignKey: 'homestay_id', as: 'maintenanceAssets' });
MaintenanceAsset.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

// Restaurant & Kitchen associations
Homestay.hasMany(HotelRestaurant, { foreignKey: 'homestay_id', as: 'restaurants' });
HotelRestaurant.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

Homestay.hasMany(RestaurantTable, { foreignKey: 'homestay_id', as: 'restaurantTables' });
RestaurantTable.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

// MenuItem uses eating_out table (restaurant_id references eating_out_id)
// Note: The database schema doesn't have menu_categories or associations with HotelRestaurant
// MenuItem.restaurant_id -> eating_out.eating_out_id

Homestay.hasMany(RestaurantOrder, { foreignKey: 'homestay_id', as: 'restaurantOrders' });
RestaurantOrder.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

Booking.hasMany(RestaurantOrder, { foreignKey: 'booking_id', as: 'restaurantOrders' });
RestaurantOrder.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

RestaurantTable.hasMany(RestaurantOrder, { foreignKey: 'table_id', as: 'orders' });
RestaurantOrder.belongsTo(RestaurantTable, { foreignKey: 'table_id', as: 'table' });

Room.hasMany(RestaurantOrder, { foreignKey: 'room_id', as: 'restaurantOrders' });
RestaurantOrder.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });

User.hasMany(RestaurantOrder, { foreignKey: 'created_by', as: 'createdOrders' });
RestaurantOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

RestaurantOrder.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(RestaurantOrder, { foreignKey: 'order_id', as: 'order' });

MenuItem.hasMany(OrderItem, { foreignKey: 'menu_item_id', as: 'orderItems' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'menuItem' });

RestaurantOrder.hasMany(KitchenQueue, { foreignKey: 'order_id', as: 'queueItems' });
KitchenQueue.belongsTo(RestaurantOrder, { foreignKey: 'order_id', as: 'order' });

OrderItem.hasMany(KitchenQueue, { foreignKey: 'order_item_id', as: 'queueEntries' });
KitchenQueue.belongsTo(OrderItem, { foreignKey: 'order_item_id', as: 'orderItem' });

User.hasMany(KitchenQueue, { foreignKey: 'assigned_chef', as: 'assignedQueueItems' });
KitchenQueue.belongsTo(User, { foreignKey: 'assigned_chef', as: 'chef' });

RestaurantOrder.hasOne(OrderDeliveryInfo, { foreignKey: 'order_id', as: 'deliveryInfo' });
OrderDeliveryInfo.belongsTo(RestaurantOrder, { foreignKey: 'order_id', as: 'order' });

User.hasMany(OrderDeliveryInfo, { foreignKey: 'delivered_by', as: 'deliveries' });
OrderDeliveryInfo.belongsTo(User, { foreignKey: 'delivered_by', as: 'deliveryPerson' });

// Menu Item Ingredients (Recipe) associations
MenuItem.hasMany(MenuItemIngredient, { foreignKey: 'menu_id', as: 'ingredients' });
MenuItemIngredient.belongsTo(MenuItem, { foreignKey: 'menu_id', as: 'menuItem' });

StockItem.hasMany(MenuItemIngredient, { foreignKey: 'stock_item_id', as: 'usedInMenuItems' });
MenuItemIngredient.belongsTo(StockItem, { foreignKey: 'stock_item_id', as: 'stockItem' });

// Stock Management associations
Homestay.hasMany(StockItem, { foreignKey: 'homestay_id', as: 'stockItems' });
StockItem.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

StockSupplier.hasMany(StockItem, { foreignKey: 'default_supplier_id', as: 'suppliedItems' });
StockItem.belongsTo(StockSupplier, { foreignKey: 'default_supplier_id', as: 'supplier' });

FinancialAccount.hasMany(StockItem, { foreignKey: 'account_id', as: 'stockItems' });
StockItem.belongsTo(FinancialAccount, { foreignKey: 'account_id', as: 'account' });

StockItem.hasMany(StockMovement, { foreignKey: 'item_id', as: 'movements' });
StockMovement.belongsTo(StockItem, { foreignKey: 'item_id', as: 'item' });

Homestay.hasMany(StockMovement, { foreignKey: 'homestay_id', as: 'stockMovements' });
StockMovement.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

User.hasMany(StockMovement, { foreignKey: 'staff_id', as: 'recordedMovements' });
StockMovement.belongsTo(User, { foreignKey: 'staff_id', as: 'staff' });

StockSupplier.hasMany(StockMovement, { foreignKey: 'supplier_id', as: 'movements' });
StockMovement.belongsTo(StockSupplier, { foreignKey: 'supplier_id', as: 'supplier' });

FinancialAccount.hasMany(StockMovement, { foreignKey: 'account_id', as: 'stockMovements' });
StockMovement.belongsTo(FinancialAccount, { foreignKey: 'account_id', as: 'account' });

Homestay.hasMany(StockSupplier, { foreignKey: 'homestay_id', as: 'suppliers' });
StockSupplier.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

StockItem.hasMany(StockUsageLog, { foreignKey: 'item_id', as: 'usageLogs' });
StockUsageLog.belongsTo(StockItem, { foreignKey: 'item_id', as: 'item' });

Homestay.hasMany(StockUsageLog, { foreignKey: 'homestay_id', as: 'stockUsageLogs' });
StockUsageLog.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

User.hasMany(StockUsageLog, { foreignKey: 'used_by', as: 'stockUsages' });
StockUsageLog.belongsTo(User, { foreignKey: 'used_by', as: 'user' });

Homestay.hasMany(StockOrder, { foreignKey: 'homestay_id', as: 'stockOrders' });
StockOrder.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

StockSupplier.hasMany(StockOrder, { foreignKey: 'supplier_id', as: 'orders' });
StockOrder.belongsTo(StockSupplier, { foreignKey: 'supplier_id', as: 'supplier' });

User.hasMany(StockOrder, { foreignKey: 'created_by', as: 'createdStockOrders' });
StockOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

User.hasMany(StockOrder, { foreignKey: 'approved_by', as: 'approvedStockOrders' });
StockOrder.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

User.hasMany(StockOrder, { foreignKey: 'received_by', as: 'receivedStockOrders' });
StockOrder.belongsTo(User, { foreignKey: 'received_by', as: 'receiver' });

FinancialAccount.hasMany(StockOrder, { foreignKey: 'account_id', as: 'stockOrders' });
StockOrder.belongsTo(FinancialAccount, { foreignKey: 'account_id', as: 'account' });

StockOrder.hasMany(StockOrderItem, { foreignKey: 'order_id', as: 'items' });
StockOrderItem.belongsTo(StockOrder, { foreignKey: 'order_id', as: 'order' });

StockItem.hasMany(StockOrderItem, { foreignKey: 'item_id', as: 'orderItems' });
StockOrderItem.belongsTo(StockItem, { foreignKey: 'item_id', as: 'item' });

module.exports = {
  User,
  HMSUser,
  Location,
  Homestay,
  Booking,
  GuestProfile,
  GuestRequest,
  RestaurantImage,
  Room,
  RoomType,
  RoomRate,
  RoomAvailability,
  RoomStatusLog,
  RoomBooking,
  BookingGuest,
  BookingCharge,
  BookingModification,
  ExternalBooking,
  MultiRoomBooking,
  FinancialAccount,
  GuestComplaint,
  GuestReview,
  UserFavorite,
  HousekeepingTask,
  MaintenanceRequest,
  MaintenanceAsset,
  HotelRestaurant,
  RestaurantTable,
  MenuCategory,
  MenuItem,
  MenuItemIngredient,
  RestaurantOrder,
  OrderItem,
  KitchenQueue,
  OrderDeliveryInfo,
  StockItem,
  StockMovement,
  StockSupplier,
  StockUsageLog,
  StockOrder,
  StockOrderItem,
  RoomAssignment
};
