# Homestay Deletion with Cascade Delete - Implementation Guide

## 🎯 Overview

This feature implements a safe deletion flow for homestays with related properties (rooms). Instead of showing a cryptic foreign key constraint error, users now see a clear confirmation dialog showing:
- Which properties will be deleted
- How many rooms are in each property type
- Total count of rooms affected

## 📋 What Changed

### Backend Changes

#### 1. New Function: `checkHomestayDependencies` (homestay.controller.js)
- **Location**: `/backend/src/controllers/homestay.controller.js` (line 634)
- **Endpoint**: `GET /api/homestays/:id/check-dependencies`
- **Purpose**: Check for related room types before deletion
- **Returns**:
  ```json
  {
    "success": true,
    "homestayName": "My Homestay",
    "relatedRooms": [
      {
        "room_type_id": 1,
        "type_name": "Deluxe Suite",
        "price": 100,
        "total_rooms": 5
      }
    ],
    "hasRelatedRooms": true,
    "totalRoomTypes": 1,
    "totalRooms": 5
  }
  ```

#### 2. Enhanced Function: `deleteHomestay` (homestay.controller.js)
- **Location**: `/backend/src/controllers/homestay.controller.js` (line 688)
- **Changes**:
  - Now uses database transactions for safety
  - Accepts `confirmed` flag in request body
  - If homestay has related rooms and `confirmed: false`, returns 409 status with message
  - If `confirmed: true`, performs cascade deletion:
    1. Deletes all rooms in related room types
    2. Deletes all room types
    3. Deletes homestay images
    4. Deletes the homestay itself
  - All-or-nothing approach using transactions

#### 3. New Route (homestay.routes.js)
```javascript
router.get('/:id/check-dependencies', homestayController.checkHomestayDependencies);
```

### Frontend Changes

#### Updated: `Homestays.jsx` (frontend/src/pages/hotels/Homestays.jsx)

**New State Management**:
```javascript
const [deleteModal, setDeleteModal] = useState({
  isOpen: false,
  homestayId: null,
  homestayName: null,
  relatedRooms: [],
  hasRelatedRooms: false,
  totalRooms: 0,
  isDeleting: false
});
```

**New Functions**:

1. **handleDeleteClick()**: 
   - Triggered when user clicks delete button
   - Calls check-dependencies endpoint
   - Populates modal with relationship data

2. **handleConfirmDelete()**:
   - Confirmed deletion with cascade flag
   - Sends `confirmed: true` when rooms exist
   - Updates UI after successful deletion

3. **closeDeleteModal()**:
   - Closes modal (disabled during deletion)

**New UI Component**: Beautiful deletion confirmation modal showing:
- Homestay name being deleted
- List of room types with count
- Total properties count
- Warning styling (red theme)
- Cancel/Delete buttons with loading state

## 🔄 How It Works

### User Flow

1. **User clicks delete button**
   ```
   ┌─────────────────────┐
   │ User clicks delete  │
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────────────────┐
   │ Frontend checks dependencies     │
   │ GET /check-dependencies         │
   └──────────┬──────────────────────┘
              │
              ▼
   ┌─────────────────────────────────┐
   │ Does homestay have rooms?       │
   └──────┬───────────────────────┬──┘
          │                       │
        YES                      NO
          │                       │
          ▼                       ▼
   ┌──────────────────┐   ┌──────────────────┐
   │ Show detailed    │   │ Proceed with     │
   │ confirmation     │   │ deletion         │
   │ modal with       │   └──────────────────┘
   │ room list        │
   └────────┬─────────┘
            │
            ▼
   ┌──────────────────────┐
   │ User confirms delete │
   └────────┬─────────────┘
            │
            ▼
   ┌─────────────────────────────────┐
   │ DELETE with confirmed: true     │
   │ Cascade deletes all rooms       │
   └────────┬────────────────────────┘
            │
            ▼
   ┌──────────────────────────────────┐
   │ Success! Modal closes,           │
   │ homestay removed from list       │
   └──────────────────────────────────┘
   ```

## 📱 User Experience Improvements

### Before Fix
```
❌ ERROR: "Cannot delete or update a parent row: a foreign key constraint 
   fails (`travooz_hms`.`room_types`, CONSTRAINT `room_types_ibfk_1` 
   FOREIGN KEY (`homestay_id`) REFERENCES `homestays` (`homestay_id`))"
```
- Generic MySQL error
- No indication of what's related
- No option to delete related items

### After Fix
```
✅ Clear Modal Dialog:
   - "Are you sure you want to delete 'My Homestay'?"
   - "Properties will also be deleted:"
   - "  • Deluxe Suite (5 rooms)"
   - "  • Standard Room (3 rooms)"
   - "Total: 8 properties will be permanently deleted"
   - Cancel / Delete buttons
```
- Clear, actionable information
- User knows exactly what will be deleted
- Safe cascade deletion with confirmation

## 🧪 Testing

### Test Case 1: Delete homestay with no rooms
```bash
# Create homestay with no room types
# Click delete
# Should delete immediately without confirmation modal
```

### Test Case 2: Delete homestay with multiple room types
```bash
# Create homestay with 2-3 room types
# Add several rooms to each type
# Click delete
# Confirm modal appears showing:
#   - Room type names
#   - Individual room counts
#   - Total count
# Click confirm
# Homestay, rooms, and room types all deleted
```

### Test Case 3: Cancel deletion
```bash
# Click delete
# Modal appears
# Click Cancel
# Modal closes, nothing deleted
```

## 🛡️ Safety Features

1. **Database Transactions**: All-or-nothing deletion
   - If any step fails, entire operation rolls back
   - No orphaned data

2. **Clear Confirmation**: User sees exactly what will be deleted
   - Room type names
   - Individual counts
   - Total count

3. **Vendor Authorization**: Already checked
   - Only vendor can delete their own homestays
   - Cannot delete other vendors' homestays

4. **Soft Loading States**:
   - Modal disabled during deletion
   - Loading spinner shown
   - Prevention of double-click

## 📁 Modified Files

1. `/backend/src/controllers/homestay.controller.js`
   - Added `checkHomestayDependencies` function
   - Updated `deleteHomestay` function
   - Updated exports

2. `/backend/src/routes/homestay.routes.js`
   - Added GET `/api/homestays/:id/check-dependencies` route

3. `/frontend/src/pages/hotels/Homestays.jsx`
   - Added import for AlertCircle and X icons
   - Added deleteModal state
   - Added `handleDeleteClick` function
   - Added `handleConfirmDelete` function
   - Added `closeDeleteModal` function
   - Updated delete button handler
   - Added confirmation modal JSX component

## ✅ API Endpoints

### Check Dependencies
```
GET /api/homestays/:id/check-dependencies

Response (200):
{
  "success": true,
  "homestayName": "My Homestay",
  "relatedRooms": [...],
  "hasRelatedRooms": true,
  "totalRoomTypes": 2,
  "totalRooms": 8
}
```

### Delete Homestay (No Related Rooms)
```
DELETE /api/homestays/:id

Response (200):
{
  "success": true,
  "message": "Homestay deleted successfully",
  "deletedRoomTypes": 0
}
```

### Delete Homestay (With Related Rooms - First Call)
```
DELETE /api/homestays/:id
Body: {}

Response (409):
{
  "success": false,
  "message": "Homestay has related properties",
  "hasRelatedRooms": true,
  "requiresConfirmation": true
}
```

### Delete Homestay (With Related Rooms - Confirmed)
```
DELETE /api/homestays/:id
Body: { "confirmed": true }

Response (200):
{
  "success": true,
  "message": "Homestay deleted successfully",
  "deletedRoomTypes": 2
}
```

## 🚀 Next Steps

1. Test the deletion flow with sample data
2. Verify database transactions work correctly
3. Test with different numbers of rooms
4. Verify error handling and rollback behavior
5. Check frontend UI rendering at different screen sizes

## 🔧 Debugging Tips

### Enable Debug Logging
```javascript
// In homestay.controller.js - deleteHomestay function
console.log('Checking dependencies for homestay:', id);
console.log('Found room types:', relatedRooms.length);
console.log('Confirmed flag:', confirmed);
```

### Test with cURL
```bash
# Check dependencies
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/homestays/9/check-dependencies

# Delete with confirmation
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"confirmed": true}' \
  http://localhost:3001/api/homestays/9
```

## 📝 Notes

- All deletions are logged to the console
- Homestay images are also deleted
- Room inventory items are cleaned up
- Transaction rollback on any error
- Vendor ownership verified before deletion