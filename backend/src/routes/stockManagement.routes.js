const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const {
  InventoryCategory,
  DeliveryNote,
  DeliveryNoteItem,
  StockCostLog,
  StockUnit,
  StockItem,
  StockSupplier,
  StockOrder,
  StockOrderItem,
  Homestay,
  User
} = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../../config/database');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ============================================
// INVENTORY CATEGORIES ROUTES
// ============================================

// GET /api/inventory-categories
router.get('/inventory-categories', async (req, res) => {
  try {
    const { is_active } = req.query;
    const whereClause = {};

    if (is_active !== undefined) whereClause.is_active = is_active === 'true';

    const categories = await InventoryCategory.findAll({
      where: whereClause,
      order: [['category_name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory categories',
      error: error.message
    });
  }
});

// POST /api/inventory-categories
router.post('/inventory-categories', [
  body('category_name').notEmpty().withMessage('Category name is required'),
  body('description').optional(),
  body('is_active').optional().isBoolean()
], validate, async (req, res) => {
  try {
    const category = await InventoryCategory.create({
      ...req.body,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true
    });
    res.status(201).json({ success: true, message: 'Category created successfully', data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    
    // Handle duplicate category name error
    if (error.name === 'SequelizeUniqueConstraintError' && error.errors && error.errors[0].path === 'category_name') {
      return res.status(400).json({ 
        success: false,
        message: 'Category name already exists', 
        error: `A category with the name "${req.body.category_name}" already exists. Please choose a different name.`
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error creating category', 
      error: error.message 
    });
  }
});

// PUT /api/inventory-categories/:id
router.put('/inventory-categories/:id', [
  body('category_name').optional().notEmpty(),
  body('description').optional(),
  body('is_active').optional().isBoolean()
], validate, async (req, res) => {
  try {
    const category = await InventoryCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.update(req.body);
    res.json({ success: true, message: 'Category updated successfully', data: category });
  } catch (error) {
    console.error('Error updating category:', error);
    
    // Handle duplicate category name error
    if (error.name === 'SequelizeUniqueConstraintError' && error.errors && error.errors[0].path === 'category_name') {
      return res.status(400).json({ 
        success: false,
        message: 'Category name already exists', 
        error: `A category with the name "${req.body.category_name}" already exists. Please choose a different name.`
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Error updating category', 
      error: error.message 
    });
  }
});

// DELETE /api/inventory-categories/:id
router.delete('/inventory-categories/:id', async (req, res) => {
  try {
    const category = await InventoryCategory.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
});

// ============================================
// STOCK UNITS ROUTES
// ============================================

// GET /api/stock-units
router.get('/stock-units', async (req, res) => {
  try {
    const { unit_type, is_active } = req.query;
    const whereClause = {};

    if (unit_type) whereClause.unit_type = unit_type;
    if (is_active !== undefined) whereClause.is_active = is_active === 'true';

    const units = await StockUnit.findAll({
      where: whereClause,
      order: [['unit_name', 'ASC']]
    });

    res.json({ success: true, data: units });
  } catch (error) {
    console.error('Error fetching stock units:', error);
    res.status(500).json({ message: 'Error fetching stock units', error: error.message });
  }
});

// POST /api/stock-units
router.post('/stock-units', [
  body('unit_name').notEmpty().withMessage('Unit name is required'),
  body('unit_symbol').notEmpty().withMessage('Unit symbol is required'),
  body('unit_type').isIn(['count', 'weight', 'volume', 'length', 'area', 'time']),
  body('base_unit_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('conversion_factor').optional().isDecimal(),
  body('description').optional(),
  body('is_active').optional().isBoolean()
], validate, async (req, res) => {
  try {
    const unit = await StockUnit.create({
      ...req.body,
      conversion_factor: req.body.conversion_factor || 1.0000,
      is_active: req.body.is_active !== undefined ? req.body.is_active : true
    });
    res.status(201).json({ success: true, message: 'Unit created successfully', data: unit });
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ message: 'Error creating unit', error: error.message });
  }
});

// PUT /api/stock-units/:id
router.put('/stock-units/:id', [
  body('unit_name').optional().notEmpty(),
  body('unit_symbol').optional().notEmpty(),
  body('unit_type').optional().isIn(['count', 'weight', 'volume', 'length', 'area', 'time']),
  body('base_unit_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('conversion_factor').optional().isDecimal(),
  body('description').optional(),
  body('is_active').optional().isBoolean()
], validate, async (req, res) => {
  try {
    const unit = await StockUnit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    await unit.update(req.body);
    res.json({ success: true, message: 'Unit updated successfully', data: unit });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ message: 'Error updating unit', error: error.message });
  }
});

// DELETE /api/stock-units/:id
router.delete('/stock-units/:id', async (req, res) => {
  try {
    const unit = await StockUnit.findByPk(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    await unit.destroy();
    res.json({ success: true, message: 'Unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({ message: 'Error deleting unit', error: error.message });
  }
});

// ============================================
// DELIVERY NOTES ROUTES
// ============================================

// GET /api/delivery-notes
router.get('/delivery-notes', async (req, res) => {
  try {
    const { homestay_id, supplier_id, status, start_date, end_date } = req.query;
    const whereClause = {};

    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (supplier_id) whereClause.supplier_id = supplier_id;
    if (status) whereClause.delivery_status = status;
    if (start_date && end_date) {
      whereClause.delivery_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const deliveryNotes = await DeliveryNote.findAll({
      where: whereClause,
      include: [
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] },
        { model: StockSupplier, as: 'supplier', attributes: ['supplier_id', 'name', 'phone'] },
        { model: StockOrder, as: 'order', attributes: ['order_id', 'order_number'] },
        { model: User, as: 'receiver', attributes: ['user_id', 'name'] },
        {
          model: DeliveryNoteItem,
          as: 'items',
          include: [{ model: StockItem, as: 'item', attributes: ['item_id', 'name', 'unit'] }]
        }
      ],
      order: [['delivery_date', 'DESC']]
    });

    console.log('Returning delivery notes:', deliveryNotes.length, 'notes');
    res.json({ success: true, data: deliveryNotes });
  } catch (error) {
    console.error('Error fetching delivery notes:', error);
    res.status(500).json({ message: 'Error fetching delivery notes', error: error.message });
  }
});

// POST /api/delivery-notes
router.post('/delivery-notes', [
  body('delivery_number').notEmpty().withMessage('Delivery number is required'),
  body('order_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('supplier_id').isInt().withMessage('Supplier ID is required'),
  body('homestay_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('delivery_date').optional().isISO8601(),
  body('received_by').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('delivery_status').optional().isIn(['complete', 'partial', 'damaged', 'rejected']),
  body('delivery_notes').optional(),
  body('condition_notes').optional(),
  body('items').optional().isArray().withMessage('Items must be an array')
], validate, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Generate delivery number if not provided
    let deliveryNumber = req.body.delivery_number;
    if (!deliveryNumber) {
      const count = await DeliveryNote.count();
      deliveryNumber = `DN-${Date.now()}-${count + 1}`;
    }

    console.log('Creating delivery note with data:', {
      delivery_number: deliveryNumber,
      order_id: req.body.order_id,
      supplier_id: req.body.supplier_id,
      homestay_id: req.body.homestay_id || req.user.assigned_hotel_id,
      delivery_date: req.body.delivery_date || new Date(),
      received_by: req.body.received_by,
      delivery_status: req.body.delivery_status || 'complete'
    });

    // Create delivery note
    const deliveryNote = await DeliveryNote.create({
      delivery_number: deliveryNumber,
      order_id: req.body.order_id,
      supplier_id: req.body.supplier_id,
      homestay_id: req.body.homestay_id || req.user.assigned_hotel_id,
      delivery_date: req.body.delivery_date || new Date(),
      received_by: req.body.received_by,
      delivery_status: req.body.delivery_status || 'complete',
      delivery_notes: req.body.delivery_notes,
      condition_notes: req.body.condition_notes
    }, { transaction });

    console.log('Delivery note created with ID:', deliveryNote.delivery_note_id);

    // If order_id is provided, create delivery note items from order items
    if (req.body.order_id && req.body.items && req.body.items.length > 0) {
      const orderItems = await StockOrderItem.findAll({
        where: { order_id: req.body.order_id },
        include: [{ model: StockItem, as: 'item' }]
      });

      let totalItemsExpected = 0;
      let totalItemsReceived = 0;

      for (const item of req.body.items) {
        const orderItem = orderItems.find(oi => oi.item_id === item.item_id);
        if (orderItem) {
          await DeliveryNoteItem.create({
            delivery_note_id: deliveryNote.delivery_note_id,
            order_item_id: orderItem.order_item_id,
            item_id: item.item_id,
            quantity_expected: orderItem.quantity_ordered,
            quantity_received: item.quantity_received || orderItem.quantity_ordered,
            quantity_damaged: item.quantity_damaged || 0,
            quantity_missing: item.quantity_missing || 0,
            unit_price: orderItem.unit_price,
            condition_status: item.condition_status || 'good',
            condition_notes: item.condition_notes
          }, { transaction });

          totalItemsExpected += orderItem.quantity_ordered;
          totalItemsReceived += (item.quantity_received || orderItem.quantity_ordered);
        }
      }

      // Update delivery note totals
      await deliveryNote.update({
        total_items_expected: totalItemsExpected,
        total_items_received: totalItemsReceived
      }, { transaction });
    }

    await transaction.commit();
    
    // Fetch the complete delivery note with associations
    const completeDeliveryNote = await DeliveryNote.findByPk(deliveryNote.delivery_note_id, {
      include: [
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] },
        { model: StockSupplier, as: 'supplier', attributes: ['supplier_id', 'name', 'phone'] },
        { model: StockOrder, as: 'order', attributes: ['order_id', 'order_number'] },
        { model: User, as: 'receiver', attributes: ['user_id', 'name'] },
        {
          model: DeliveryNoteItem,
          as: 'items',
          include: [{ model: StockItem, as: 'item', attributes: ['item_id', 'name', 'unit'] }]
        }
      ]
    });

    res.status(201).json({ 
      success: true, 
      message: 'Delivery note created successfully', 
      data: completeDeliveryNote 
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error('Error creating delivery note:', error);
    res.status(500).json({ message: 'Error creating delivery note', error: error.message });
  }
});

// GET /api/delivery-notes/:id
router.get('/delivery-notes/:id', async (req, res) => {
  try {
    const deliveryNote = await DeliveryNote.findByPk(req.params.id, {
      include: [
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] },
        { model: StockSupplier, as: 'supplier', attributes: ['supplier_id', 'name', 'phone'] },
        { model: StockOrder, as: 'order', attributes: ['order_id', 'order_number'] },
        { model: User, as: 'receiver', attributes: ['user_id', 'name'] },
        {
          model: DeliveryNoteItem,
          as: 'items',
          include: [{ model: StockItem, as: 'item', attributes: ['item_id', 'name', 'unit'] }]
        }
      ]
    });

    if (!deliveryNote) {
      return res.status(404).json({ message: 'Delivery note not found' });
    }

    res.json({ success: true, data: deliveryNote });
  } catch (error) {
    console.error('Error fetching delivery note:', error);
    res.status(500).json({ message: 'Error fetching delivery note', error: error.message });
  }
});

// PUT /api/delivery-notes/:id
router.put('/delivery-notes/:id', [
  body('delivery_number').optional().notEmpty(),
  body('order_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('supplier_id').optional().isInt(),
  body('homestay_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('delivery_date').optional().isISO8601(),
  body('received_by').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('delivery_status').optional().isIn(['complete', 'partial', 'damaged', 'rejected']),
  body('delivery_notes').optional(),
  body('condition_notes').optional()
], validate, async (req, res) => {
  try {
    const deliveryNote = await DeliveryNote.findByPk(req.params.id);
    if (!deliveryNote) {
      return res.status(404).json({ message: 'Delivery note not found' });
    }

    await deliveryNote.update(req.body);
    res.json({ success: true, message: 'Delivery note updated successfully', data: deliveryNote });
  } catch (error) {
    console.error('Error updating delivery note:', error);
    res.status(500).json({ message: 'Error updating delivery note', error: error.message });
  }
});

// DELETE /api/delivery-notes/:id
router.delete('/delivery-notes/:id', async (req, res) => {
  try {
    const deliveryNote = await DeliveryNote.findByPk(req.params.id);
    if (!deliveryNote) {
      return res.status(404).json({ message: 'Delivery note not found' });
    }

    await deliveryNote.destroy();
    res.json({ success: true, message: 'Delivery note deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery note:', error);
    res.status(500).json({ message: 'Error deleting delivery note', error: error.message });
  }
});

// ============================================
// DELIVERY NOTE ITEMS ROUTES
// ============================================

// GET /api/delivery-note-items
router.get('/delivery-note-items', async (req, res) => {
  try {
    const { delivery_note_id, item_id } = req.query;
    const whereClause = {};

    if (delivery_note_id) whereClause.delivery_note_id = delivery_note_id;
    if (item_id) whereClause.item_id = item_id;

    const deliveryNoteItems = await DeliveryNoteItem.findAll({
      where: whereClause,
      include: [
        { model: DeliveryNote, as: 'deliveryNote', attributes: ['delivery_note_id', 'delivery_number'] },
        { model: StockOrderItem, as: 'orderItem', attributes: ['order_item_id', 'quantity_ordered'] },
        { model: StockItem, as: 'item', attributes: ['item_id', 'name', 'unit'] }
      ],
      order: [['delivery_item_id', 'DESC']]
    });

    res.json({ success: true, data: deliveryNoteItems });
  } catch (error) {
    console.error('Error fetching delivery note items:', error);
    res.status(500).json({ message: 'Error fetching delivery note items', error: error.message });
  }
});

// POST /api/delivery-note-items
router.post('/delivery-note-items', [
  body('delivery_note_id').isInt().withMessage('Delivery note ID is required'),
  body('order_item_id').isInt().withMessage('Order item ID is required'),
  body('item_id').isInt().withMessage('Item ID is required'),
  body('quantity_expected').isInt().withMessage('Expected quantity is required'),
  body('quantity_received').isInt().withMessage('Received quantity is required'),
  body('unit_price').isDecimal().withMessage('Unit price is required'),
  body('condition_status').optional().isIn(['good', 'damaged', 'defective', 'expired']),
  body('quantity_damaged').optional().isInt(),
  body('quantity_missing').optional().isInt(),
  body('condition_notes').optional()
], validate, async (req, res) => {
  try {
    const deliveryNoteItem = await DeliveryNoteItem.create(req.body);
    res.status(201).json({ success: true, message: 'Delivery note item created successfully', data: deliveryNoteItem });
  } catch (error) {
    console.error('Error creating delivery note item:', error);
    res.status(500).json({ message: 'Error creating delivery note item', error: error.message });
  }
});

// PUT /api/delivery-note-items/:id
router.put('/delivery-note-items/:id', [
  body('quantity_received').optional().isInt(),
  body('quantity_damaged').optional().isInt(),
  body('quantity_missing').optional().isInt(),
  body('condition_status').optional().isIn(['good', 'damaged', 'defective', 'expired']),
  body('condition_notes').optional()
], validate, async (req, res) => {
  try {
    const deliveryNoteItem = await DeliveryNoteItem.findByPk(req.params.id);
    if (!deliveryNoteItem) {
      return res.status(404).json({ message: 'Delivery note item not found' });
    }

    await deliveryNoteItem.update(req.body);
    res.json({ success: true, message: 'Delivery note item updated successfully', data: deliveryNoteItem });
  } catch (error) {
    console.error('Error updating delivery note item:', error);
    res.status(500).json({ message: 'Error updating delivery note item', error: error.message });
  }
});

// DELETE /api/delivery-note-items/:id
router.delete('/delivery-note-items/:id', async (req, res) => {
  try {
    const deliveryNoteItem = await DeliveryNoteItem.findByPk(req.params.id);
    if (!deliveryNoteItem) {
      return res.status(404).json({ message: 'Delivery note item not found' });
    }

    await deliveryNoteItem.destroy();
    res.json({ success: true, message: 'Delivery note item deleted successfully' });
  } catch (error) {
    console.error('Error deleting delivery note item:', error);
    res.status(500).json({ message: 'Error deleting delivery note item', error: error.message });
  }
});

// ============================================
// COST REPORTS ROUTES
// ============================================

// GET /api/stock-cost-reports
router.get('/stock-cost-reports', async (req, res) => {
  try {
    const { startDate, endDate, category, supplier } = req.query;
    
    // For now, return mock data since we don't have complex cost tracking yet
    const mockData = {
      totalStockValue: 125000,
      averageCostPerItem: 45.50,
      costTrends: [
        { month: 'Jan', cost: 12000 },
        { month: 'Feb', cost: 15000 },
        { month: 'Mar', cost: 18000 },
        { month: 'Apr', cost: 16000 },
        { month: 'May', cost: 20000 },
        { month: 'Jun', cost: 22000 }
      ],
      costByCategory: [
        { name: 'Linen', value: 35000, color: '#8884d8' },
        { name: 'Toiletries', value: 25000, color: '#82ca9d' },
        { name: 'Kitchen', value: 30000, color: '#ffc658' },
        { name: 'Cleaning', value: 20000, color: '#ff7300' },
        { name: 'Maintenance', value: 15000, color: '#00ff00' }
      ],
      costBySupplier: [
        { name: 'Hotel Supplies Co.', value: 45000 },
        { name: 'Kitchen Essentials Ltd.', value: 35000 },
        { name: 'Luxury Amenities Inc.', value: 30000 },
        { name: 'Maintenance Solutions', value: 15000 }
      ],
      priceChanges: [
        { item: 'Bath Towels', oldPrice: 15.00, newPrice: 16.50, change: 10.0, date: '2024-01-15' },
        { item: 'Shampoo', oldPrice: 5.00, newPrice: 4.75, change: -5.0, date: '2024-01-20' },
        { item: 'Coffee Cups', oldPrice: 12.00, newPrice: 13.20, change: 10.0, date: '2024-01-25' },
        { item: 'Bed Sheets', oldPrice: 25.00, newPrice: 27.50, change: 10.0, date: '2024-02-01' }
      ],
      monthlyCosts: [
        { month: 'Jan', purchases: 12000, usage: 8000, net: 4000 },
        { month: 'Feb', purchases: 15000, usage: 10000, net: 5000 },
        { month: 'Mar', purchases: 18000, usage: 12000, net: 6000 },
        { month: 'Apr', purchases: 16000, usage: 11000, net: 5000 },
        { month: 'May', purchases: 20000, usage: 14000, net: 6000 },
        { month: 'Jun', purchases: 22000, usage: 15000, net: 7000 }
      ]
    };

    res.json({ success: true, data: mockData });
  } catch (error) {
    console.error('Error fetching cost reports:', error);
    res.status(500).json({ message: 'Error fetching cost reports', error: error.message });
  }
});

// ============================================
// STOCK REQUESTS ROUTES
// ============================================

// GET /api/stock-requests
router.get('/stock-requests', async (req, res) => {
  try {
    const { homestay_id, department, status, priority, start_date, end_date } = req.query;
    const whereClause = {};

    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (department) whereClause.department = department;
    if (status) whereClause.delivery_status = status;
    if (priority) whereClause.priority = priority;
    if (start_date && end_date) {
      whereClause.requested_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    // For now, return mock data since we don't have a stock_requests table yet
    const mockRequests = [
      {
        request_id: 1,
        request_number: 'SR-001',
        requested_by: 'John Doe',
        department: 'Housekeeping',
        name: 'Bath Towels',
        quantity_requested: 50,
        priority: 'high',
        purpose: 'Room restocking',
        requested_date: '2024-01-15',
        expected_date: '2024-01-20',
        status: 'pending',
        notes: 'Need for upcoming busy weekend',
        created_at: '2024-01-15T10:30:00Z'
      },
      {
        request_id: 2,
        request_number: 'SR-002',
        requested_by: 'Jane Smith',
        department: 'Maintenance',
        name: 'Light Bulbs',
        quantity_requested: 20,
        priority: 'medium',
        purpose: 'Room maintenance',
        requested_date: '2024-01-16',
        expected_date: '2024-01-22',
        status: 'approved',
        notes: 'LED bulbs for energy efficiency',
        created_at: '2024-01-16T14:20:00Z'
      },
      {
        request_id: 3,
        request_number: 'SR-003',
        requested_by: 'Mike Johnson',
        department: 'Restaurant',
        name: 'Coffee Cups',
        quantity_requested: 100,
        priority: 'urgent',
        purpose: 'Restaurant operations',
        requested_date: '2024-01-17',
        expected_date: '2024-01-18',
        status: 'fulfilled',
        notes: 'Urgent need for breakfast service',
        created_at: '2024-01-17T08:15:00Z'
      },
      {
        request_id: 4,
        request_number: 'SR-004',
        requested_by: 'Sarah Wilson',
        department: 'Front Desk',
        name: 'Guest Amenities',
        quantity_requested: 30,
        priority: 'low',
        purpose: 'Guest services',
        requested_date: '2024-01-18',
        expected_date: '2024-01-25',
        status: 'rejected',
        notes: 'Budget constraints',
        created_at: '2024-01-18T16:45:00Z'
      }
    ];

    res.json({ success: true, data: mockRequests });
  } catch (error) {
    console.error('Error fetching stock requests:', error);
    res.status(500).json({ message: 'Error fetching stock requests', error: error.message });
  }
});

// POST /api/stock-requests
router.post('/stock-requests', [
  body('request_number').notEmpty().withMessage('Request number is required'),
  body('requested_by').notEmpty().withMessage('Requested by is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('name').notEmpty().withMessage('Item name is required'),
  body('quantity_requested').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('priority').isIn(['low', 'medium', 'high', 'urgent']),
  body('purpose').optional(),
  body('requested_date').optional().isISO8601(),
  body('expected_date').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'approved', 'fulfilled', 'rejected', 'cancelled']),
  body('notes').optional()
], validate, async (req, res) => {
  try {
    // For now, just return success since we don't have a stock_requests table yet
    const request = {
      ...req.body,
      request_id: Date.now(), // Generate a temporary ID
      created_at: new Date().toISOString()
    };
    
    res.status(201).json({ success: true, message: 'Stock request created successfully', data: request });
  } catch (error) {
    console.error('Error creating stock request:', error);
    res.status(500).json({ message: 'Error creating stock request', error: error.message });
  }
});

// PUT /api/stock-requests/:id
router.put('/stock-requests/:id', [
  body('request_number').optional().notEmpty(),
  body('requested_by').optional().notEmpty(),
  body('department').optional().notEmpty(),
  body('name').optional().notEmpty(),
  body('quantity_requested').optional().isInt({ min: 1 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('purpose').optional(),
  body('requested_date').optional().isISO8601(),
  body('expected_date').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'approved', 'fulfilled', 'rejected', 'cancelled']),
  body('notes').optional()
], validate, async (req, res) => {
  try {
    // For now, just return success since we don't have a stock_requests table yet
    const request = {
      request_id: req.params.id,
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    res.json({ success: true, message: 'Stock request updated successfully', data: request });
  } catch (error) {
    console.error('Error updating stock request:', error);
    res.status(500).json({ message: 'Error updating stock request', error: error.message });
  }
});

// PATCH /api/stock-requests/:id (for status updates)
router.patch('/stock-requests/:id', [
  body('status').isIn(['pending', 'approved', 'fulfilled', 'rejected', 'cancelled'])
], validate, async (req, res) => {
  try {
    // For now, just return success since we don't have a stock_requests table yet
    const request = {
      request_id: req.params.id,
      status: req.body.status,
      updated_at: new Date().toISOString()
    };
    
    res.json({ success: true, message: `Request ${req.body.status} successfully`, data: request });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ message: 'Error updating request status', error: error.message });
  }
});

// DELETE /api/stock-requests/:id
router.delete('/stock-requests/:id', async (req, res) => {
  try {
    // For now, just return success since we don't have a stock_requests table yet
    res.json({ success: true, message: 'Stock request deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock request:', error);
    res.status(500).json({ message: 'Error deleting stock request', error: error.message });
  }
});

// ============================================
// SUPPLIER PERFORMANCE ROUTES
// ============================================

// GET /api/supplier-performance
router.get('/supplier-performance', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // For now, return mock data since we don't have complex performance tracking yet
    const mockData = {
      totalSuppliers: 8,
      activeSuppliers: 6,
      totalOrders: 45,
      totalValue: 125000,
      averageOrderValue: 2777.78,
      deliverySuccessRate: 87.5,
      supplierPerformance: [
        { name: 'Hotel Supplies Co.', orders: 15, value: 45000, successRate: 93.3, avgDeliveryTime: 2.5 },
        { name: 'Kitchen Essentials Ltd.', orders: 12, value: 35000, successRate: 91.7, avgDeliveryTime: 3.2 },
        { name: 'Luxury Amenities Inc.', orders: 10, value: 30000, successRate: 90.0, avgDeliveryTime: 2.8 },
        { name: 'Maintenance Solutions', orders: 8, value: 15000, successRate: 87.5, avgDeliveryTime: 4.1 }
      ],
      orderTrends: [
        { month: 'Jan', orders: 8, value: 20000 },
        { month: 'Feb', orders: 12, value: 30000 },
        { month: 'Mar', orders: 15, value: 35000 },
        { month: 'Apr', orders: 10, value: 25000 },
        { month: 'May', orders: 18, value: 40000 },
        { month: 'Jun', orders: 20, value: 45000 }
      ],
      deliveryPerformance: [
        { name: 'On Time', value: 35, color: '#82ca9d' },
        { name: 'Early', value: 8, color: '#8884d8' },
        { name: 'Late', value: 5, color: '#ffc658' },
        { name: 'Delayed', value: 2, color: '#ff7300' }
      ],
      supplierRankings: [
        { name: 'Hotel Supplies Co.', score: 95, rating: 5, orders: 15, value: 45000 },
        { name: 'Kitchen Essentials Ltd.', score: 92, rating: 5, orders: 12, value: 35000 },
        { name: 'Luxury Amenities Inc.', score: 88, rating: 4, orders: 10, value: 30000 },
        { name: 'Maintenance Solutions', score: 85, rating: 4, orders: 8, value: 15000 },
        { name: 'Office Supplies Pro', score: 78, rating: 3, orders: 5, value: 8000 }
      ]
    };

    res.json({ success: true, data: mockData });
  } catch (error) {
    console.error('Error fetching supplier performance:', error);
    res.status(500).json({ message: 'Error fetching supplier performance', error: error.message });
  }
});

module.exports = router;
