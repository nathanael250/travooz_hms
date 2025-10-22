import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, AlertCircle, ChevronDown, Loader } from 'lucide-react';

export const GoogleMapsPicker = ({ onLocationSelect, initialLat, initialLng }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    lat: initialLat || 0,
    lng: initialLng || 0,
    address: ''
  });
  const [hasUserSelected, setHasUserSelected] = useState(false);

  const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Fetch locations from API
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const response = await fetch('/api/locations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hms_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || data || []);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Load Google Maps API
  useEffect(() => {
    if (!API_KEY || API_KEY.includes('DUMMY')) {
      setError('⚠️ Google Maps API Key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
      return;
    }

    // Check if script already loaded
    if (window.google) {
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    script.onerror = () => {
      setError('Failed to load Google Maps. Check your API key.');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup - don't remove script as it might be used elsewhere
    };
  }, [API_KEY]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Use provided coordinates or default to Kigali, Rwanda as fallback
    const defaultLat = (initialLat && initialLat !== 0) ? initialLat : -1.9563;
    const defaultLng = (initialLng && initialLng !== 0) ? initialLng : 29.8739;

    const newMap = new window.google.maps.Map(mapRef.current, {
      zoom: (initialLat && initialLat !== 0 && initialLng && initialLng !== 0) ? 15 : 12,
      center: { lat: defaultLat, lng: defaultLng },
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true
    });

    // Add initial marker if coordinates exist
    if (initialLat && initialLat !== 0 && initialLng && initialLng !== 0) {
      addMarker(newMap, initialLat, initialLng);
    }

    // Handle map clicks
    newMap.addListener('click', (e) => {
      handleMapClick(newMap, e.latLng);
    });

    setMap(newMap);
  };

  const addMarker = (mapInstance, lat, lng) => {
    // Remove old marker
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    const newMarker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstance,
      draggable: true,
      title: 'Property Location'
    });

    // Handle marker drag
    newMarker.addListener('dragend', () => {
      const pos = newMarker.getPosition();
      handleLocationChange(pos.lat(), pos.lng());
    });

    markerRef.current = newMarker;
  };

  const handleMapClick = (mapInstance, latLng) => {
    const lat = latLng.lat();
    const lng = latLng.lng();
    addMarker(mapInstance, lat, lng);
    handleLocationChange(lat, lng);
  };

  const handleLocationChange = async (lat, lng) => {
    setSelectedLocation(prev => ({
      ...prev,
      lat,
      lng
    }));
    setHasUserSelected(true);

    // Get address from coordinates using Reverse Geocoding
    if (window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const address = results[0].formatted_address;
          setSelectedLocation(prev => ({
            ...prev,
            address
          }));
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            address: address
          });
        }
      });
    }
  };

  const handleSearch = async () => {
    if (!searchInput.trim() || !window.google) {
      setError('Please enter an address');
      return;
    }

    setError('');
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: searchInput }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        const address = results[0].formatted_address;

        // Center map and add marker
        if (map) {
          map.panTo(location);
          map.setZoom(15);
          addMarker(map, lat, lng);
        }

        setSelectedLocation({
          lat,
          lng,
          address
        });

        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: address
        });

        setSearchInput('');
      } else {
        setError('Address not found. Please try another search.');
      }
    });
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectLocation = (locationName) => {
    setSearchInput(locationName);
    setShowLocationDropdown(false);
    
    // Search for the location
    if (!window.google) {
      setError('Google Maps not loaded');
      return;
    }

    setError('');
    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ address: locationName }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        const lat = location.lat();
        const lng = location.lng();
        const address = results[0].formatted_address;

        // Center map and add marker
        if (map) {
          map.panTo(location);
          map.setZoom(15);
          addMarker(map, lat, lng);
        }

        setSelectedLocation({
          lat,
          lng,
          address
        });

        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: address
        });

        setSearchInput('');
      } else {
        setError(`Location "${locationName}" not found on map. Please try searching manually.`);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <MapPin className="inline h-4 w-4 mr-1" />
          Property Location on Map *
        </label>

        {/* Quick Location Selector */}
        {locations.length > 0 && (
          <div className="mb-4 relative">
            <button
              type="button"
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-600">📍 Quick Select Location</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showLocationDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {loadingLocations ? (
                  <div className="p-3 text-center text-gray-600 flex items-center justify-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    Loading...
                  </div>
                ) : (
                  locations.map((location) => (
                    <button
                      key={location.location_id}
                      type="button"
                      onClick={() => handleSelectLocation(location.location_name)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900">{location.location_name}</div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Search Box */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            placeholder="Search for an address..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        )}

        {/* Map Container */}
        <div
          ref={mapRef}
          className="w-full h-96 border-2 border-gray-300 rounded-lg overflow-hidden"
        />

        {/* Selected Location Info */}
        {hasUserSelected && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">✅ Location Selected:</p>
            <p className="text-sm text-blue-800 mb-2">{selectedLocation.address || 'No address found'}</p>
            <p className="text-xs text-blue-700">
              Latitude: {selectedLocation.lat.toFixed(6)} | Longitude: {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        )}

        {/* No Location Selected Info */}
        {!hasUserSelected && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-900">⚠️ No location selected yet</p>
            <p className="text-xs text-amber-700">Search for an address or click on the map to select your property location</p>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Search for an address or click directly on the map to set the location
        </p>
      </div>
    </div>
  );
};