import React from 'react';
import { List as ListIcon } from 'lucide-react';

const OrderItems = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        <ListIcon className="inline mr-2 mb-1" size={32} />
        Order Items
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">View detailed order item breakdown.</p>
        <p className="text-sm text-gray-500 mt-2">Select an order from Restaurant Orders to view its items.</p>
      </div>
    </div>
  );
};

export default OrderItems;
