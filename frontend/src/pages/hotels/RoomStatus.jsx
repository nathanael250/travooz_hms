import React from 'react';
import { Activity } from 'lucide-react';

export const RoomStatus = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary-600" />
            Room Status Log
          </h1>
          <p className="text-gray-600 mt-1">Track cleaning, maintenance, and occupancy status</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Room Status Log</h3>
        <p className="text-gray-600">This feature will allow you to track room status changes.sdfsdads</p>
      </div>
    </div>
  );
};