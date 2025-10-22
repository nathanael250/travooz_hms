import React from 'react';
import { Truck } from 'lucide-react';

const OrderDelivery = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        <Truck className="inline mr-2 mb-1" size={32} />
        Order Delivery Info
      </h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Track order delivery status for room service and takeaway orders.</p>
        <p className="text-sm text-gray-500 mt-2">Manage delivery assignments and track delivery times.</p>
      </div>
    </div>
  );
};

export default OrderDelivery;
