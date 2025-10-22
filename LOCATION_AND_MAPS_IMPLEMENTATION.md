# Location & Google Maps Integration Implementation Guide

## Overview
This document describes the implementation of location-based property management with Google Maps integration for the Travooz HMS Homestay system.

---

## ✅ Completed Implementation

### 1. **Backend Changes**

#### New API Endpoint: `/api/locations`
- **File**: `backend/src/routes/location.routes.js` ✅ Created
- **Controller**: `backend/src/controllers/location.controller.js` ✅ Created
- **Models**: Already configured in `backend/src/models/index.js` ✅

**Endpoints:**
- `GET /api/locations` - Fetch all locations (public access)
- `GET /api/locations/:id` - Fetch specific location by ID (public access)

**Response Format:**
```json
{
  "success": true,
  "locations": [
    {
      "location_id": 1,
      "location_name": "New York"
    },
    {
      "location_id": 2,
      "location_name": "Los Angeles"
    }
  ]
}
```

#### Updated Homestay Controller
- **File**: `backend/src/controllers/homestay.controller.js` ✅ Updated
- **Changes**:
  - Added support for `location_id`, `latitude`, `longitude`, and `address` fields
  - Updated `createHomestay` function to handle new geographic data
  - The `updateHomestay` function automatically supports new fields

**Database Fields Used:**
```
- location_id: INTEGER (Foreign Key to locations table)
- latitude: DECIMAL(10,8)
- longitude: DECIMAL(11,8)
- address: VARCHAR(200) (Auto-filled from Google Maps)
```

#### Updated App.js
- **File**: `backend/src/app.js` ✅ Updated
- Added import for location routes
- Registered location endpoint at `/api/locations`

---

### 2. **Frontend Components**

#### 📍 New Component: `GoogleMapsPicker.jsx`
- **Location**: `frontend/src/components/homestay/GoogleMapsPicker.jsx` ✅ Created
- **Features**:
  - Interactive Google Maps display
  - Search functionality for addresses
  - Click-to-place marker on map
  - Draggable marker for fine-tuning location
  - Reverse geocoding (address lookup from coordinates)
  - Real-time latitude/longitude display
  - Visual feedback with selected location info box

**Usage:**
```jsx
<GoogleMapsPicker
  initialLat={data.latitude}
  initialLng={data.longitude}
  onLocationSelect={(location) => {
    // location = { latitude, longitude, address }
  }}
/>
```

#### 🏘️ New Component: `LocationSelector.jsx`
- **Location**: `frontend/src/components/homestay/LocationSelector.jsx` ✅ Created
- **Features**:
  - Dropdown selector pulling from `locations` table
  - Automatic API calls to `/api/locations`
  - Error handling and loading states
  - Graceful fallback if API endpoint doesn't exist yet

**Usage:**
```jsx
<LocationSelector
  selectedLocationId={data.location_id}
  onLocationSelect={(location) => {
    // location = { location_id, location_name }
  }}
/>
```

#### Updated Form Step: `HomestayInfoStep.jsx`
- **Location**: `frontend/src/components/homestay/steps/HomestayInfoStep.jsx` ✅ Updated
- **Changes**:
  - Removed text input for "Location" field
  - Added `LocationSelector` component (dropdown)
  - Added `GoogleMapsPicker` component (interactive map)
  - Integrated both components into the form workflow
  - Address field is now auto-filled from Google Maps

**Form Flow:**
1. User selects a **location/city** from dropdown
2. User searches for address or clicks on map
3. System captures **latitude & longitude**
4. **Address** is automatically populated from reverse geocoding

#### Updated Wizard: `HomestayWizard.jsx`
- **Location**: `frontend/src/components/homestay/HomestayWizard.jsx` ✅ Updated
- **Changes**:
  - Added new fields to homestay form data:
    - `location_id` (from location dropdown)
    - `location_name` (display name)
    - `latitude` (from Google Maps)
    - `longitude` (from Google Maps)
    - `address` (auto-filled from maps)

---

### 3. **Environment Configuration**

#### Frontend .env Update
- **File**: `frontend/.env` ✅ Updated
- **New Variable**:
  ```
  VITE_GOOGLE_MAPS_API_KEY=AIzaSyDummy123_ADD_YOUR_REAL_KEY_HERE
  ```

---

## 🚀 Next Steps: Configuration & Testing

### Step 1: Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create an API key (browser-restricted)
5. Copy the key

### Step 2: Update Environment Variables
```bash
# In frontend/.env, replace the dummy key:
VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_KEY_HERE
```

### Step 3: Ensure Locations Exist in Database
Before testing, make sure the `locations` table has entries:
```sql
SELECT * FROM locations;
```

If empty, insert sample data:
```sql
INSERT INTO locations (location_id, location_name) VALUES
(1, 'New York'),
(2, 'Los Angeles'),
(3, 'Chicago'),
(4, 'Houston'),
(5, 'Phoenix');
```

### Step 4: Test the Implementation

#### Test Location API:
```bash
# Should return all locations (no auth required)
curl http://localhost:3001/api/locations

# Should return specific location
curl http://localhost:3001/api/locations/1
```

#### Test Create Homestay Form:
1. Navigate to "Create Homestay"
2. You should see:
   - **Location** dropdown (showing locations from DB)
   - **Property Location on Map** section with:
     - Search box for address
     - Interactive Google Map
     - Selected location info display
3. Select a location from dropdown
4. Search for an address OR click on map
5. Verify latitude/longitude are captured
6. Submit the form

---

## 📋 Form Field Mapping

| Frontend Field | Database Column | Source |
|---|---|---|
| `location_id` | `homestays.location_id` | LocationSelector dropdown |
| `location_name` | (Display only) | LocationSelector |
| `latitude` | `homestays.latitude` | GoogleMapsPicker |
| `longitude` | `homestays.longitude` | GoogleMapsPicker |
| `address` | `homestays.address` | GoogleMapsPicker (auto-filled) |

---

## 🔧 Troubleshooting

### Maps Component Not Showing
- **Check**: Verify `VITE_GOOGLE_MAPS_API_KEY` is set in `.env`
- **Error Message**: Component will display warning if key is missing
- **Fix**: Add real API key to `.env` and restart frontend dev server

### Location Dropdown Empty
- **Check**: Ensure `/api/locations` endpoint is working
- **Test**: `curl http://localhost:3001/api/locations`
- **Fix**: Check if `locations` table has data

### Address Search Not Working
- **Issue**: May be rate-limited by Google Maps API
- **Fix**: Check Google Cloud Console quotas and billing

### Map Not Interactive
- **Issue**: Google Maps API may not be loaded
- **Check**: Browser console for errors
- **Fix**: Verify API key has correct permissions

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   Homestay Creation Form                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. LocationSelector Component                              │
│     └─→ Fetches from /api/locations                        │
│     └─→ User selects location_id                           │
│                                                              │
│  2. GoogleMapsPicker Component                              │
│     ├─→ User searches address                               │
│     │   └─→ Google Geocoding API                           │
│     │   └─→ Returns lat/lng                                │
│     │                                                        │
│     └─→ User clicks on map                                 │
│         └─→ Captures lat/lng                               │
│         └─→ Reverse Geocode for address                    │
│                                                              │
│  3. Form Submission                                         │
│     └─→ POST /api/homestays                                │
│     └─→ Send: location_id, latitude, longitude, address    │
│                                                              │
│  4. Backend Processing                                      │
│     └─→ Validate location_id exists                        │
│     └─→ Store all geographic data                          │
│     └─→ Create homestay record                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Features Implemented

✅ Location dropdown from database
✅ Google Maps interactive picker
✅ Address search functionality
✅ Marker placement on map
✅ Draggable markers
✅ Reverse geocoding (coords to address)
✅ Latitude/longitude capture
✅ Auto-address population
✅ API endpoint for locations
✅ Error handling and loading states
✅ Responsive design
✅ Mobile-friendly map

---

## 🔐 Security Notes

- Location API (`/api/locations`) is **public access** (no auth required)
- Google Maps API key is **frontend-only** (browser-restricted)
- Coordinate validation happens at backend level
- All homestay data updates still require vendor authentication

---

## 📝 Files Modified/Created

### Created Files:
- ✅ `backend/src/controllers/location.controller.js`
- ✅ `backend/src/routes/location.routes.js`
- ✅ `frontend/src/components/homestay/GoogleMapsPicker.jsx`
- ✅ `frontend/src/components/homestay/LocationSelector.jsx`

### Modified Files:
- ✅ `backend/src/app.js` (added location routes)
- ✅ `backend/src/controllers/homestay.controller.js` (added coordinate fields)
- ✅ `frontend/.env` (added Google Maps API key)
- ✅ `frontend/src/components/homestay/HomestayWizard.jsx` (added form fields)
- ✅ `frontend/src/components/homestay/steps/HomestayInfoStep.jsx` (integrated new components)

---

## ⚡ Quick Start Checklist

- [ ] Get Google Maps API key from Google Cloud Console
- [ ] Update `frontend/.env` with real API key
- [ ] Verify `locations` table has entries
- [ ] Test `/api/locations` endpoint
- [ ] Restart frontend dev server (`npm run dev`)
- [ ] Navigate to "Create Homestay"
- [ ] Test location dropdown
- [ ] Test map search and clicking
- [ ] Submit form and verify coordinates are saved
- [ ] View homestay to confirm location data

---

## 💡 Future Enhancements

Possible improvements for later:
- Add multiple marker support for multi-property management
- Save location favorites for quick selection
- Show nearby amenities on map
- Display property availability on map
- Add geofencing for automatic check-in/out
- Integration with Google Places for predictions
- Heat map of bookings by location

---

**Implementation Date**: October 2024
**Status**: ✅ Complete and Ready for Testing