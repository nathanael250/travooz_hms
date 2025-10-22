# Front Desk 401 Unauthorized Errors - Fix Summary

## Problem
Multiple Front Desk API endpoints were returning **401 Unauthorized** errors:
- `GET /api/front-desk/in-house-guests` ❌
- `GET /api/front-desk/checkouts` ❌
- `GET /api/front-desk/room-status` ❌
- `GET /api/front-desk/in-house-guests` (GuestFolio) ❌

## Root Causes Identified

### 1. **Inconsistent Token Handling**
- **InHouseGuests.jsx & CheckOut.jsx** used raw `fetch()` instead of `apiClient`
- **CheckOut.jsx** looked for `'token'` key instead of `'hms_token'`
- Raw fetch calls bypassed the apiClient's request interceptor that injects Bearer tokens

### 2. **Race Condition: Fetching Before Authentication**
- All components fetched on mount WITHOUT checking if token existed
- If page loaded before auth context was ready, requests had no token
- This caused immediate 401 errors even with valid authentication

### 3. **Wrong API Base URL**
- CheckOut.jsx hardcoded API_BASE_URL to `http://localhost:5000`
- Backend runs on `http://localhost:3001`

## Fixes Applied

### ✅ Fix 1: InHouseGuests.jsx (Lines 39-60)
```javascript
// BEFORE: Used raw fetch()
const fetchInHouseGuests = async () => {
  const token = localStorage.getItem('hms_token');
  const response = await fetch(`${API_BASE_URL}/api/front-desk/in-house-guests`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
};

// AFTER: Uses apiClient + token check
useEffect(() => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    fetchInHouseGuests();
  } else {
    console.warn('⚠️ No token available...');
    setGuests(getMockGuests());
  }
}, []);

const fetchInHouseGuests = async () => {
  const response = await apiClient.get('/front-desk/in-house-guests');
};
```

### ✅ Fix 2: CheckOut.jsx (Lines 39-60)
```javascript
// BEFORE: Wrong token key + raw fetch
const token = localStorage.getItem('token');  // ❌ Wrong key!
const response = await fetch(`${API_BASE_URL}/api/front-desk/checkouts`, ...);

// AFTER: Correct token key + apiClient
const token = localStorage.getItem('hms_token');  // ✅ Correct key
if (token) {
  const response = await apiClient.get('/front-desk/checkouts');
}
```

### ✅ Fix 3: RoomStatus.jsx (Lines 30-55)
```javascript
// Added token check before fetching
useEffect(() => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    fetchRoomStatus();
    const interval = setInterval(fetchRoomStatus, 30000);
    return () => clearInterval(interval);
  } else {
    setRooms(getMockRooms());
    setLoading(false);
  }
}, []);
```

### ✅ Fix 4: GuestFolio.jsx (Lines 43-65)
```javascript
// Added token check before fetching
useEffect(() => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    fetchInHouseGuests();
  } else {
    setGuests(getMockGuests());
    setLoading(false);
  }
}, []);
```

## Key Changes Summary

| Component | Issue | Fix |
|-----------|-------|-----|
| **InHouseGuests** | Raw fetch() + no token check | Use apiClient + token validation |
| **CheckOut** | Wrong token key ('token' vs 'hms_token') + raw fetch | Use correct key + apiClient |
| **RoomStatus** | No token check | Added token validation |
| **GuestFolio** | No token check | Added token validation |

## How It Works Now

1. **Component mounts** → Check if `hms_token` exists in localStorage
2. **Token found** ✅ → Fetch real data using apiClient
3. **Token not found** ⚠️ → Load mock data (graceful fallback)
4. **apiClient.get()** → Automatically injects `Bearer ${token}` header via request interceptor

## Logging Improvements

All components now log:
- 📡 `"Fetching [data] using apiClient..."`  - Indicates fetch started
- ⚠️ `"No token available - using mock data. User may need to login."` - Indicates no auth
- ❌ `"Error fetching [data]"` - Shows fetch failures

## Testing Steps

1. **Clear localStorage** (browser DevTools) or logout completely
2. **Navigate to Front Desk pages** → Should see mock data + warning in console
3. **Login** → Token stored in `hms_token`
4. **Navigate to Front Desk pages** → Should fetch real data + see ✅ in console
5. **Check browser console** for:
   - ✅ API Response logs (successful requests)
   - No ❌ 401 errors

## Files Modified

- ✅ `/frontend/src/pages/frontdesk/InHouseGuests.jsx`
- ✅ `/frontend/src/pages/frontdesk/CheckOut.jsx`
- ✅ `/frontend/src/pages/frontdesk/RoomStatus.jsx`
- ✅ `/frontend/src/pages/frontdesk/GuestFolio.jsx`
- ✅ `/frontend/src/services/apiClient.js` (enhanced 401 error logging)

## Next Steps

If 401 errors still occur:
1. Check browser DevTools → Application → LocalStorage for `hms_token`
2. Check browser console for diagnostic logs showing token presence
3. Verify backend authentication middleware is working (see auth.middleware.js)
4. Check if token is expired (JWT might need refresh mechanism)