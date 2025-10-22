import React from 'react';
import { Image } from 'lucide-react';

export const RoomImages = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Image className="h-7 w-7 text-primary-600" />
            Room Images Management
          </h1>
          <p className="text-gray-600 mt-1">Upload and manage room photos</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Room Images</h3>
        <p className="text-gray-600">This feature will allow you to upload and manage room images.</p>
      </div>
    </div>
  );
};