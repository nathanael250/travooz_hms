import React, { useState, useEffect } from 'react';
import { AlertTriangle, PackageX, Package, RefreshCw } from 'lucide-react';
import * as stockService from '../../services/stockService';

const InventoryAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await stockService.getInventoryAlerts();
      setAlerts(response.data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertLevel = (item) => {
    if (item.quantity === 0) {
      return {
        level: 'critical',
        label: 'Out of Stock',
        color: 'bg-red-50 border-red-200',
        textColor: 'text-red-800',
        icon: PackageX,
        iconColor: 'text-red-600'
      };
    } else if (item.quantity <= item.reorder_level) {
      return {
        level: 'warning',
        label: 'Low Stock',
        color: 'bg-yellow-50 border-yellow-200',
        textColor: 'text-yellow-800',
        icon: AlertTriangle,
        iconColor: 'text-yellow-600'
      };
    }
    return {
      level: 'normal',
      label: 'Normal',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      icon: Package,
      iconColor: 'text-green-600'
    };
  };

  const criticalAlerts = alerts.filter(a => a.quantity === 0);
  const warningAlerts = alerts.filter(a => a.quantity > 0 && a.quantity <= a.reorder_level);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          <AlertTriangle className="inline mr-2 mb-1" size={32} />
          Inventory Alerts
        </h1>
        <button
          onClick={fetchAlerts}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <AlertTriangle className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">{criticalAlerts.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <PackageX className="text-red-600" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">{warningAlerts.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertTriangle className="text-yellow-600" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="mx-auto text-green-500 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">All Good!</h3>
          <p className="text-gray-600">No inventory alerts at the moment. All items are adequately stocked.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {criticalAlerts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                <PackageX size={20} />
                Critical - Out of Stock ({criticalAlerts.length})
              </h2>
              <div className="space-y-2">
                {criticalAlerts.map((item) => {
                  const alert = getAlertLevel(item);
                  const AlertIcon = alert.icon;
                  return (
                    <div
                      key={item.item_id}
                      className={`border rounded-lg p-4 ${alert.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertIcon className={alert.iconColor} size={24} />
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">
                              Category: {item.category || 'N/A'} | Reorder Level: {item.reorder_level} {item.unit}
                            </p>
                            {item.supplier?.name && (
                              <p className="text-sm text-gray-600">
                                Supplier: {item.supplier.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${alert.textColor}`}>
                            {item.quantity} {item.unit}
                          </span>
                          <p className={`text-sm font-semibold ${alert.textColor}`}>
                            {alert.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {warningAlerts.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2 mt-6">
                <AlertTriangle size={20} />
                Warning - Low Stock ({warningAlerts.length})
              </h2>
              <div className="space-y-2">
                {warningAlerts.map((item) => {
                  const alert = getAlertLevel(item);
                  const AlertIcon = alert.icon;
                  return (
                    <div
                      key={item.item_id}
                      className={`border rounded-lg p-4 ${alert.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertIcon className={alert.iconColor} size={24} />
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">
                              Category: {item.category || 'N/A'} | Reorder Level: {item.reorder_level} {item.unit}
                            </p>
                            {item.supplier?.name && (
                              <p className="text-sm text-gray-600">
                                Supplier: {item.supplier.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${alert.textColor}`}>
                            {item.quantity} {item.unit}
                          </span>
                          <p className={`text-sm font-semibold ${alert.textColor}`}>
                            {alert.label}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryAlerts;
