import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';
import * as maintenanceService from '../../services/maintenanceService';

const MaintenanceAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await maintenanceService.getMaintenanceAssets();
      setAssets(response.data.assets || []);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          <Package className="inline mr-2 mb-1" size={32} />
          Maintenance Assets
        </h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus size={20} />
          New Asset
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Asset management interface will be implemented here.</p>
        <p className="text-sm text-gray-500 mt-2">Track equipment, warranties, and maintenance schedules.</p>
      </div>
    </div>
  );
};

export default MaintenanceAssets;
