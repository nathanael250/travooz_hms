import React, { useState, useEffect } from 'react';
import { MapPin, Loader } from 'lucide-react';

export const LocationSelector = ({ onLocationSelect, selectedLocationId }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/locations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('hms_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || data || []);
      } else if (response.status === 404) {
        // API endpoint doesn't exist yet, show message
        setError('Location API not available yet. You can still use the map picker below.');
      } else {
        setError('Failed to load locations');
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Error loading locations. You can still use the map picker below.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const locationId = parseInt(e.target.value);
    const selectedLoc = locations.find(loc => loc.location_id === locationId);
    
    if (selectedLoc) {
      onLocationSelect({
        location_id: locationId,
        location_name: selectedLoc.location_name
      });
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <MapPin className="inline h-4 w-4 mr-1" />
        Select Location/City *
      </label>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-600 py-2">
          <Loader className="h-4 w-4 animate-spin" />
          Loading locations...
        </div>
      ) : error ? (
        <div className="text-sm text-yellow-700 bg-yellow-50 p-2 rounded mb-2">
          {error}
        </div>
      ) : null}

      <select
        value={selectedLocationId || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        required
      >
        <option value="">-- Select a location --</option>
        {locations.map(location => (
          <option key={location.location_id} value={location.location_id}>
            {location.location_name}
          </option>
        ))}
      </select>

      {locations.length === 0 && !loading && !error && (
        <p className="text-sm text-gray-500 mt-2">
          No locations available. Contact admin to add locations.
        </p>
      )}
    </div>
  );
};