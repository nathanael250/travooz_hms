# 🔧 Maintenance Management Module - Implementation Guide

## Overview
This guide provides step-by-step instructions to implement the Maintenance Management module, which is the first priority in Phase 1 of the HMS implementation roadmap.

---

## 📋 Module Features

### 1. Maintenance Requests
- Create, view, update, and delete maintenance requests
- Assign requests to staff members
- Track request status (pending, in_progress, completed, cancelled)
- Set priority levels (low, medium, high, urgent)
- Record costs and completion details

### 2. Asset Management
- Track property assets and equipment
- Monitor warranty and maintenance schedules
- Record asset locations and status

---

## 🗄️ Database Schema

### Maintenance Requests Table
```sql
CREATE TABLE maintenance_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  homestay_id INT NOT NULL,
  room_id INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
  reported_by INT NOT NULL,
  assigned_to INT NULL,
  reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  scheduled_date DATETIME NULL,
  completed_date DATETIME NULL,
  cost DECIMAL(10, 2) DEFAULT 0.00,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (homestay_id) REFERENCES homestays(id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
  FOREIGN KEY (reported_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_homestay (homestay_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority),
  INDEX idx_assigned (assigned_to)
);
```

### Maintenance Assets Table
```sql
CREATE TABLE maintenance_assets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  homestay_id INT NOT NULL,
  asset_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(100),
  location VARCHAR(255),
  purchase_date DATE NULL,
  warranty_expiry DATE NULL,
  last_maintenance_date DATE NULL,
  next_maintenance_date DATE NULL,
  status ENUM('active', 'maintenance', 'retired') DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (homestay_id) REFERENCES homestays(id) ON DELETE CASCADE,
  INDEX idx_homestay (homestay_id),
  INDEX idx_status (status)
);
```

---

## 🔨 Backend Implementation

### Step 1: Create Maintenance Request Model

**File**: `backend/src/models/maintenanceRequest.model.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  homestay_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'homestays',
      key: 'id'
    }
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'rooms',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  reported_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigned_to: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reported_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'maintenance_requests',
  timestamps: true,
  underscored: true
});

module.exports = MaintenanceRequest;
```

### Step 2: Create Maintenance Asset Model

**File**: `backend/src/models/maintenanceAsset.model.js`

```javascript
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const MaintenanceAsset = sequelize.define('MaintenanceAsset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  homestay_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'homestays',
      key: 'id'
    }
  },
  asset_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  asset_type: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  warranty_expiry: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  last_maintenance_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  next_maintenance_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'maintenance', 'retired'),
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'maintenance_assets',
  timestamps: true,
  underscored: true
});

module.exports = MaintenanceAsset;
```

### Step 3: Create Maintenance Controller

**File**: `backend/src/controllers/maintenance.controller.js`

```javascript
const MaintenanceRequest = require('../models/maintenanceRequest.model');
const MaintenanceAsset = require('../models/maintenanceAsset.model');
const { successResponse, errorResponse } = require('../utils/response.utils');

// Maintenance Requests
exports.getAllRequests = async (req, res) => {
  try {
    const { homestay_id, status, priority } = req.query;
    const where = {};
    
    if (homestay_id) where.homestay_id = homestay_id;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const requests = await MaintenanceRequest.findAll({
      where,
      include: [
        { association: 'homestay', attributes: ['id', 'name'] },
        { association: 'room', attributes: ['id', 'room_number'] },
        { association: 'reporter', attributes: ['id', 'name', 'email'] },
        { association: 'assignee', attributes: ['id', 'name', 'email'] }
      ],
      order: [['reported_date', 'DESC']]
    });

    return successResponse(res, requests, 'Maintenance requests retrieved successfully');
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    return errorResponse(res, 'Failed to fetch maintenance requests', 500);
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await MaintenanceRequest.findByPk(id, {
      include: [
        { association: 'homestay', attributes: ['id', 'name'] },
        { association: 'room', attributes: ['id', 'room_number'] },
        { association: 'reporter', attributes: ['id', 'name', 'email'] },
        { association: 'assignee', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!request) {
      return errorResponse(res, 'Maintenance request not found', 404);
    }

    return successResponse(res, request, 'Maintenance request retrieved successfully');
  } catch (error) {
    console.error('Error fetching maintenance request:', error);
    return errorResponse(res, 'Failed to fetch maintenance request', 500);
  }
};

exports.createRequest = async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      reported_by: req.user.id
    };

    const request = await MaintenanceRequest.create(requestData);
    return successResponse(res, request, 'Maintenance request created successfully', 201);
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    return errorResponse(res, 'Failed to create maintenance request', 500);
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await MaintenanceRequest.findByPk(id);

    if (!request) {
      return errorResponse(res, 'Maintenance request not found', 404);
    }

    await request.update(req.body);
    return successResponse(res, request, 'Maintenance request updated successfully');
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    return errorResponse(res, 'Failed to update maintenance request', 500);
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await MaintenanceRequest.findByPk(id);

    if (!request) {
      return errorResponse(res, 'Maintenance request not found', 404);
    }

    await request.destroy();
    return successResponse(res, null, 'Maintenance request deleted successfully');
  } catch (error) {
    console.error('Error deleting maintenance request:', error);
    return errorResponse(res, 'Failed to delete maintenance request', 500);
  }
};

exports.assignRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigned_to, scheduled_date } = req.body;

    const request = await MaintenanceRequest.findByPk(id);
    if (!request) {
      return errorResponse(res, 'Maintenance request not found', 404);
    }

    await request.update({
      assigned_to,
      scheduled_date,
      status: 'in_progress'
    });

    return successResponse(res, request, 'Maintenance request assigned successfully');
  } catch (error) {
    console.error('Error assigning maintenance request:', error);
    return errorResponse(res, 'Failed to assign maintenance request', 500);
  }
};

exports.completeRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { cost, notes } = req.body;

    const request = await MaintenanceRequest.findByPk(id);
    if (!request) {
      return errorResponse(res, 'Maintenance request not found', 404);
    }

    await request.update({
      status: 'completed',
      completed_date: new Date(),
      cost,
      notes
    });

    return successResponse(res, request, 'Maintenance request completed successfully');
  } catch (error) {
    console.error('Error completing maintenance request:', error);
    return errorResponse(res, 'Failed to complete maintenance request', 500);
  }
};

// Maintenance Assets
exports.getAllAssets = async (req, res) => {
  try {
    const { homestay_id, status } = req.query;
    const where = {};
    
    if (homestay_id) where.homestay_id = homestay_id;
    if (status) where.status = status;

    const assets = await MaintenanceAsset.findAll({
      where,
      include: [
        { association: 'homestay', attributes: ['id', 'name'] }
      ],
      order: [['asset_name', 'ASC']]
    });

    return successResponse(res, assets, 'Maintenance assets retrieved successfully');
  } catch (error) {
    console.error('Error fetching maintenance assets:', error);
    return errorResponse(res, 'Failed to fetch maintenance assets', 500);
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await MaintenanceAsset.findByPk(id, {
      include: [
        { association: 'homestay', attributes: ['id', 'name'] }
      ]
    });

    if (!asset) {
      return errorResponse(res, 'Maintenance asset not found', 404);
    }

    return successResponse(res, asset, 'Maintenance asset retrieved successfully');
  } catch (error) {
    console.error('Error fetching maintenance asset:', error);
    return errorResponse(res, 'Failed to fetch maintenance asset', 500);
  }
};

exports.createAsset = async (req, res) => {
  try {
    const asset = await MaintenanceAsset.create(req.body);
    return successResponse(res, asset, 'Maintenance asset created successfully', 201);
  } catch (error) {
    console.error('Error creating maintenance asset:', error);
    return errorResponse(res, 'Failed to create maintenance asset', 500);
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await MaintenanceAsset.findByPk(id);

    if (!asset) {
      return errorResponse(res, 'Maintenance asset not found', 404);
    }

    await asset.update(req.body);
    return successResponse(res, asset, 'Maintenance asset updated successfully');
  } catch (error) {
    console.error('Error updating maintenance asset:', error);
    return errorResponse(res, 'Failed to update maintenance asset', 500);
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const asset = await MaintenanceAsset.findByPk(id);

    if (!asset) {
      return errorResponse(res, 'Maintenance asset not found', 404);
    }

    await asset.destroy();
    return successResponse(res, null, 'Maintenance asset deleted successfully');
  } catch (error) {
    console.error('Error deleting maintenance asset:', error);
    return errorResponse(res, 'Failed to delete maintenance asset', 500);
  }
};
```

### Step 4: Create Maintenance Routes

**File**: `backend/src/routes/maintenance.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenance.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/admin.middleware');

// Maintenance Requests
router.get('/requests', authenticate, maintenanceController.getAllRequests);
router.get('/requests/:id', authenticate, maintenanceController.getRequestById);
router.post('/requests', authenticate, maintenanceController.createRequest);
router.put('/requests/:id', authenticate, maintenanceController.updateRequest);
router.delete('/requests/:id', authenticate, authorize(['super_admin', 'admin']), maintenanceController.deleteRequest);
router.put('/requests/:id/assign', authenticate, authorize(['super_admin', 'admin', 'hotel_manager']), maintenanceController.assignRequest);
router.put('/requests/:id/complete', authenticate, maintenanceController.completeRequest);

// Maintenance Assets
router.get('/assets', authenticate, maintenanceController.getAllAssets);
router.get('/assets/:id', authenticate, maintenanceController.getAssetById);
router.post('/assets', authenticate, authorize(['super_admin', 'admin', 'hotel_manager']), maintenanceController.createAsset);
router.put('/assets/:id', authenticate, authorize(['super_admin', 'admin', 'hotel_manager']), maintenanceController.updateAsset);
router.delete('/assets/:id', authenticate, authorize(['super_admin', 'admin']), maintenanceController.deleteAsset);

module.exports = router;
```

### Step 5: Register Routes in app.js

**File**: `backend/src/app.js`

Add this line with other route imports:
```javascript
const maintenanceRoutes = require('./routes/maintenance.routes');
```

Add this line with other route registrations:
```javascript
app.use('/api/maintenance', maintenanceRoutes);
```

### Step 6: Update Model Associations

**File**: `backend/src/models/index.js`

Add associations:
```javascript
const MaintenanceRequest = require('./maintenanceRequest.model');
const MaintenanceAsset = require('./maintenanceAsset.model');

// Maintenance Request associations
MaintenanceRequest.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });
MaintenanceRequest.belongsTo(Room, { foreignKey: 'room_id', as: 'room' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'reported_by', as: 'reporter' });
MaintenanceRequest.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

// Maintenance Asset associations
MaintenanceAsset.belongsTo(Homestay, { foreignKey: 'homestay_id', as: 'homestay' });

module.exports = {
  // ... existing exports
  MaintenanceRequest,
  MaintenanceAsset
};
```

---

## 🎨 Frontend Implementation

### Step 1: Create Maintenance Requests Page

**File**: `frontend/src/pages/maintenance/MaintenanceRequests.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Input, Spinner } from '../../components/ui';
import { Plus, Edit, Trash2, CheckCircle, UserPlus } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const MaintenanceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    homestay_id: '',
    room_id: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/maintenance/requests');
      setRequests(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch maintenance requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRequest) {
        await apiClient.put(`/api/maintenance/requests/${selectedRequest.id}`, formData);
        toast.success('Request updated successfully');
      } else {
        await apiClient.post('/api/maintenance/requests', formData);
        toast.success('Request created successfully');
      }
      setShowModal(false);
      fetchRequests();
      resetForm();
    } catch (error) {
      toast.error('Failed to save request');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await apiClient.delete(`/api/maintenance/requests/${id}`);
        toast.success('Request deleted successfully');
        fetchRequests();
      } catch (error) {
        toast.error('Failed to delete request');
      }
    }
  };

  const handleComplete = async (id) => {
    const cost = prompt('Enter the cost of maintenance:');
    const notes = prompt('Enter completion notes:');
    
    if (cost !== null) {
      try {
        await apiClient.put(`/api/maintenance/requests/${id}/complete`, { cost, notes });
        toast.success('Request marked as completed');
        fetchRequests();
      } catch (error) {
        toast.error('Failed to complete request');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      homestay_id: '',
      room_id: ''
    });
    setSelectedRequest(null);
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Maintenance Requests</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Room</th>
              <th>Reported Date</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id}>
                <td>{request.title}</td>
                <td>{getPriorityBadge(request.priority)}</td>
                <td>{getStatusBadge(request.status)}</td>
                <td>{request.room?.room_number || 'N/A'}</td>
                <td>{new Date(request.reported_date).toLocaleDateString()}</td>
                <td>{request.assignee?.name || 'Unassigned'}</td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedRequest(request);
                        setFormData(request);
                        setShowModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {request.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleComplete(request.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(request.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={selectedRequest ? 'Edit Request' : 'New Maintenance Request'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded-lg p-2"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              className="w-full border rounded-lg p-2"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedRequest ? 'Update' : 'Create'} Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceRequests;
```

### Step 2: Create Maintenance Assets Page

**File**: `frontend/src/pages/maintenance/MaintenanceAssets.jsx`

```jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Modal, Input, Spinner } from '../../components/ui';
import { Plus, Edit, Trash2 } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { toast } from 'react-hot-toast';

const MaintenanceAssets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [formData, setFormData] = useState({
    asset_name: '',
    asset_type: '',
    location: '',
    homestay_id: '',
    status: 'active'
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/maintenance/assets');
      setAssets(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAsset) {
        await apiClient.put(`/api/maintenance/assets/${selectedAsset.id}`, formData);
        toast.success('Asset updated successfully');
      } else {
        await apiClient.post('/api/maintenance/assets', formData);
        toast.success('Asset created successfully');
      }
      setShowModal(false);
      fetchAssets();
      resetForm();
    } catch (error) {
      toast.error('Failed to save asset');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await apiClient.delete(`/api/maintenance/assets/${id}`);
        toast.success('Asset deleted successfully');
        fetchAssets();
      } catch (error) {
        toast.error('Failed to delete asset');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      asset_name: '',
      asset_type: '',
      location: '',
      homestay_id: '',
      status: 'active'
    });
    setSelectedAsset(null);
  };

  if (loading) return <Spinner />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Maintenance Assets</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Asset
        </Button>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Status</th>
              <th>Next Maintenance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>{asset.asset_name}</td>
                <td>{asset.asset_type}</td>
                <td>{asset.location}</td>
                <td>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asset.status === 'active' ? 'bg-green-100 text-green-800' :
                    asset.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {asset.status.toUpperCase()}
                  </span>
                </td>
                <td>{asset.next_maintenance_date ? new Date(asset.next_maintenance_date).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedAsset(asset);
                        setFormData(asset);
                        setShowModal(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(asset.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={selectedAsset ? 'Edit Asset' : 'New Asset'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Asset Name"
            value={formData.asset_name}
            onChange={(e) => setFormData({ ...formData, asset_name: e.target.value })}
            required
          />
          <Input
            label="Asset Type"
            value={formData.asset_type}
            onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border rounded-lg p-2"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="retired">Retired</option>
            </select>
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {selectedAsset ? 'Update' : 'Create'} Asset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceAssets;
```

### Step 3: Create Index File

**File**: `frontend/src/pages/maintenance/index.js`

```javascript
export { default as MaintenanceRequests } from './MaintenanceRequests';
export { default as MaintenanceAssets } from './MaintenanceAssets';
```

### Step 4: Update App Routes

**File**: `frontend/src/App.jsx`

Add these imports and routes:
```jsx
import { MaintenanceRequests, MaintenanceAssets } from './pages/maintenance';

// In your routes:
<Route path="/maintenance/requests" element={<MaintenanceRequests />} />
<Route path="/maintenance/assets" element={<MaintenanceAssets />} />
```

### Step 5: Update Sidebar

**File**: `frontend/src/components/Sidebar.jsx`

Add maintenance menu item:
```jsx
{
  label: 'Maintenance',
  icon: Wrench,
  subItems: [
    { label: 'Maintenance Requests', path: '/maintenance/requests' },
    { label: 'Asset Management', path: '/maintenance/assets' }
  ]
}
```

---

## ✅ Testing Checklist

### Backend Testing
- [ ] Create maintenance request via API
- [ ] List all maintenance requests
- [ ] Filter requests by status and priority
- [ ] Update request status
- [ ] Assign request to staff member
- [ ] Complete request with cost
- [ ] Delete request
- [ ] Create maintenance asset
- [ ] List all assets
- [ ] Update asset information
- [ ] Delete asset

### Frontend Testing
- [ ] View maintenance requests list
- [ ] Create new maintenance request
- [ ] Edit existing request
- [ ] Mark request as completed
- [ ] Delete request
- [ ] View maintenance assets
- [ ] Create new asset
- [ ] Edit asset details
- [ ] Delete asset
- [ ] Test responsive design
- [ ] Test error handling

---

## 📝 Next Steps

After completing the Maintenance module:
1. Test thoroughly with real data
2. Add validation and error handling
3. Implement notifications for urgent requests
4. Add file upload for maintenance photos
5. Create maintenance reports
6. Move to next priority module: **Billing & Payments**

---

**Estimated Implementation Time**: 2-3 days
**Priority**: HIGH
**Dependencies**: User authentication, Homestay management, Room management
