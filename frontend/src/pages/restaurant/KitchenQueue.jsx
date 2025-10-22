import React, { useState, useEffect } from 'react';
import { ChefHat, PlayCircle, CheckCircle } from 'lucide-react';
import * as restaurantService from '../../services/restaurantService';

const KitchenQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      const response = await restaurantService.getKitchenQueue();
      setQueue(response.data || []);
    } catch (error) {
      console.error('Error fetching kitchen queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (id) => {
    try {
      await restaurantService.startCooking(id);
      fetchQueue();
    } catch (error) {
      console.error('Error starting cooking:', error);
    }
  };

  const handleComplete = async (id) => {
    try {
      await restaurantService.completeCooking(id);
      fetchQueue();
    } catch (error) {
      console.error('Error completing item:', error);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'yellow',
      preparing: 'indigo',
      ready: 'green',
      served: 'gray'
    };
    const color = colors[status] || 'gray';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${color}-100 text-${color}-800`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        <ChefHat className="inline mr-2 mb-1" size={32} />
        Kitchen Queue
      </h1>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table/Room</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chef</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queue.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  Kitchen queue is empty
                </td>
              </tr>
            ) : (
              queue.map((item) => (
                <tr key={item.queue_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.order?.order_number}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{item.orderItem?.menuItem?.name}</div>
                    {item.orderItem?.special_instructions && (
                      <div className="text-xs text-gray-500">{item.orderItem.special_instructions}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.orderItem?.quantity}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.order?.table?.table_number || item.order?.room?.unit_number || '-'}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.chef?.name || '-'}</td>
                  <td className="px-6 py-4 text-right">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleStart(item.queue_id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-2"
                      >
                        <PlayCircle size={18} />
                      </button>
                    )}
                    {item.status === 'preparing' && (
                      <button
                        onClick={() => handleComplete(item.queue_id)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KitchenQueue;
