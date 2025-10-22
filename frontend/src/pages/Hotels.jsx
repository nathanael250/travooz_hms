import React from 'react';
import { Building, Plus } from 'lucide-react';

export const Hotels = () => {
  const hotels = [
    { id: 1, name: 'Grand Hotel Downtown', location: 'New York, NY', rooms: 150, status: 'Active' },
    { id: 2, name: 'Seaside Resort', location: 'Miami, FL', rooms: 80, status: 'Active' },
    { id: 3, name: 'Mountain View Lodge', location: 'Denver, CO', rooms: 45, status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Hotels</h1>
          <p className="text-gray-600">Manage your hotel properties</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Hotel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="card">
            <div className="card-content">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Building className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-gray-900">{hotel.name}</h3>
                    <p className="text-sm text-gray-600">{hotel.location}</p>
                  </div>
                </div>
                <span className="status-available">{hotel.status}</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{hotel.rooms}</span> rooms
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};