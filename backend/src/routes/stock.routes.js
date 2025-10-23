const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const {
  StockItem,
  StockMovement,
  StockSupplier,
  StockUsageLog,
  StockOrder,
  StockOrderItem,
  Homestay,
  User,
  FinancialAccount
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
// STOCK ITEMS ROUTES
// ============================================

// GET /api/stock/items
router.get('/items', async (req, res) => {
  try {
    const { homestay_id, category, low_stock } = req.query;
    const whereClause = {};

    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (category) whereClause.category = category;
    if (low_stock === 'true') {
      whereClause[Op.or] = [
        { quantity: { [Op.lte]: sequelize.col('reorder_level') } }
      ];
    }

    const items = await StockItem.findAll({
      where: whereClause,
      include: [
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] },
        { model: StockSupplier, as: 'supplier', attributes: ['supplier_id', 'name', 'phone'] },
        { model: FinancialAccount, as: 'account', attributes: ['account_id', 'account_name'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json(items);
  } catch (error) {
    console.error('Error fetching stock items:', error);
    res.status(500).json({ message: 'Error fetching stock items', error: error.message });
  }
});

// GET /api/stock/items/:id
router.get('/items/:id', async (req, res) => {
  try {
    const item = await StockItem.findByPk(req.params.id, {
      include: [
        { model: Homestay, as: 'homestay' },
        { model: StockSupplier, as: 'supplier' },
        { model: FinancialAccount, as: 'account' },
        {
          model: StockMovement,
          as: 'movements',
          limit: 10,
          order: [['movement_date', 'DESC']]
        }
      ]
    });

    if (!item) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    res.json(item);
  } catch (error) {
    console.error('Error fetching stock item:', error);
    res.status(500).json({ message: 'Error fetching stock item', error: error.message });
  }
});

// POST /api/stock/items
router.post('/items', [
  body('name').notEmpty().withMessage('Item name is required'),
  body('homestay_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('category').optional(),
  body('unit').optional(),
  body('reorder_level').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('quantity').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('default_supplier_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('account_id').optional({ nullable: true, checkFalsy: true }).isInt()
], validate, async (req, res) => {
  try {
    const item = await StockItem.create(req.body);
    res.status(201).json({ message: 'Stock item created successfully', item });
  } catch (error) {
    console.error('Error creating stock item:', error);
    res.status(500).json({ message: 'Error creating stock item', error: error.message });
  }
});

// PUT /api/stock/items/:id
router.put('/items/:id', async (req, res) => {
  try {
    const item = await StockItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    await item.update(req.body);
    res.json({ message: 'Stock item updated successfully', item });
  } catch (error) {
    console.error('Error updating stock item:', error);
    res.status(500).json({ message: 'Error updating stock item', error: error.message });
  }
});

// DELETE /api/stock/items/:id
router.delete('/items/:id', async (req, res) => {
  try {
    const item = await StockItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    await item.destroy();
    res.json({ message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock item:', error);
    res.status(500).json({ message: 'Error deleting stock item', error: error.message });
  }
});

// ============================================
// STOCK MOVEMENTS ROUTES
// ============================================

// GET /api/stock/movements
router.get('/movements', async (req, res) => {
  try {
    const { homestay_id, item_id, movement_type, start_date, end_date } = req.query;
    const whereClause = {};

    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (item_id) whereClause.item_id = item_id;
    if (movement_type) whereClause.movement_type = movement_type;

    if (start_date || end_date) {
      whereClause.movement_date = {};
      if (start_date) whereClause.movement_date[Op.gte] = start_date;
      if (end_date) whereClause.movement_date[Op.lte] = end_date;
    }

    const movements = await StockMovement.findAll({
      where: whereClause,
      include: [
        { model: StockItem, as: 'item', attributes: ['item_id', 'name', 'unit'] },
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] },
        { model: User, as: 'staff', attributes: ['user_id', 'name'] },
        { model: StockSupplier, as: 'supplier', attributes: ['supplier_id', 'name'] },
        { model: FinancialAccount, as: 'account', attributes: ['account_id', 'account_name'] }
      ],
      order: [['movement_date', 'DESC']],
      limit: 100
    });

    res.json(movements);
  } catch (error) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ message: 'Error fetching movements', error: error.message });
  }
});

// POST /api/stock/movements
router.post('/movements', [
  body('item_id').isInt().withMessage('Item ID is required'),
  body('movement_type').isIn(['purchase', 'usage', 'adjustment', 'transfer', 'return']),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], validate, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { item_id, quantity, movement_type } = req.body;

    // Create movement record
    const movement = await StockMovement.create({
      ...req.body,
      staff_id: req.user ? req.user.user_id : null,
      movement_date: new Date()
    }, { transaction });

    // Update stock item quantity
    const item = await StockItem.findByPk(item_id, { transaction });
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Stock item not found' });
    }

    let newQuantity = item.quantity;
    if (movement_type === 'purchase' || movement_type === 'return') {
      newQuantity += quantity;
    } else if (movement_type === 'usage') {
      newQuantity -= quantity;
    } else if (movement_type === 'adjustment') {
      newQuantity = quantity; // For adjustments, set to exact quantity
    }

    if (newQuantity < 0) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Insufficient stock quantity' });
    }

    await item.update({ quantity: newQuantity }, { transaction });

    await transaction.commit();
    res.status(201).json({ message: 'Movement recorded successfully', movement, newQuantity });
  } catch (error) {
    await transaction.rollback();
    console.error('Error recording movement:', error);
    res.status(500).json({ message: 'Error recording movement', error: error.message });
  }
});

// ============================================
// SUPPLIERS ROUTES
// ============================================

// GET /api/stock/suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const { homestay_id } = req.query;
    const whereClause = homestay_id ? { homestay_id } : {};

    const suppliers = await StockSupplier.findAll({
      where: whereClause,
      include: [
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
  }
});

// POST /api/stock/suppliers
router.post('/suppliers', [
  body('name').notEmpty().withMessage('Supplier name is required')
], validate, async (req, res) => {
  try {
    const supplier = await StockSupplier.create(req.body);
    res.status(201).json({ message: 'Supplier created successfully', supplier });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Error creating supplier', error: error.message });
  }
});

// PUT /api/stock/suppliers/:id
router.put('/suppliers/:id', async (req, res) => {
  try {
    const supplier = await StockSupplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await supplier.update(req.body);
    res.json({ message: 'Supplier updated successfully', supplier });
  } catch (error) {
    console.error('Error updating supplier:', error);
    res.status(500).json({ message: 'Error updating supplier', error: error.message });
  }
});

// DELETE /api/stock/suppliers/:id
router.delete('/suppliers/:id', async (req, res) => {
  try {
    const supplier = await StockSupplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await supplier.destroy();
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Error deleting supplier', error: error.message });
  }
});

// ============================================
// USAGE LOGS ROUTES
// ============================================

// GET /api/stock/usage-logs
router.get('/usage-logs', async (req, res) => {
  try {
    const { homestay_id, item_id, used_for, start_date, end_date } = req.query;
    const whereClause = {};

    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (item_id) whereClause.item_id = item_id;
    if (used_for) whereClause.used_for = used_for;

    if (start_date || end_date) {
      whereClause.usage_date = {};
      if (start_date) whereClause.usage_date[Op.gte] = start_date;
      if (end_date) whereClause.usage_date[Op.lte] = end_date;
    }

    const logs = await StockUsageLog.findAll({
      where: whereClause,
      include: [
        { model: StockItem, as: 'item', attributes: ['item_id', 'name', 'unit'] },
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] },
        { model: User, as: 'user', attributes: ['user_id', 'name'] }
      ],
      order: [['usage_date', 'DESC']],
      limit: 100
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching usage logs:', error);
    res.status(500).json({ message: 'Error fetching usage logs', error: error.message });
  }
});

// POST /api/stock/usage-logs
router.post('/usage-logs', [
  body('item_id').isInt(),
  body('used_for').isIn(['room', 'restaurant', 'maintenance', 'housekeeping', 'laundry', 'general']),
  body('quantity').isInt({ min: 1 })
], validate, async (req, res) => {
  try {
    const log = await StockUsageLog.create({
      ...req.body,
      used_by: req.user ? req.user.user_id : null,
      usage_date: new Date()
    });

    res.status(201).json({ message: 'Usage logged successfully', log });
  } catch (error) {
    console.error('Error logging usage:', error);
    res.status(500).json({ message: 'Error logging usage', error: error.message });
  }
});

// ============================================
// STOCK ORDERS ROUTES
// ============================================

// GET /api/stock/orders
router.get('/orders', async (req, res) => {
  try {
    const { homestay_id, supplier_id, status } = req.query;
    const whereClause = {};

    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (supplier_id) whereClause.supplier_id = supplier_id;
    if (status) whereClause.status = status;

    const orders = await StockOrder.findAll({
      where: whereClause,
      include: [
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] },
        { model: StockSupplier, as: 'supplier', attributes: ['supplier_id', 'name', 'phone'] },
        { model: User, as: 'creator', attributes: ['user_id', 'name'] },
        { model: FinancialAccount, as: 'account', attributes: ['account_id', 'account_name'] },
        {
          model: StockOrderItem,
          as: 'items',
          include: [{ model: StockItem, as: 'item', attributes: ['item_id', 'name', 'unit'] }]
        }
      ],
      order: [['order_date', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// POST /api/stock/orders
router.post('/orders', [
  body('homestay_id').isInt(),
  body('supplier_id').isInt(),
  body('items').isArray({ min: 1 })
], validate, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { homestay_id, supplier_id, items, expected_delivery_date, notes } = req.body;

    // Generate order number
    const orderCount = await StockOrder.count({ where: { homestay_id } });
    const orderNumber = `PO-${homestay_id}-${Date.now()}-${orderCount + 1}`;

    // Calculate total
    let totalAmount = 0;
    for (const item of items) {
      const quantity = item.quantity_ordered || item.quantity;
      totalAmount += quantity * item.unit_price;
    }

    // Create order
    const order = await StockOrder.create({
      homestay_id,
      supplier_id,
      order_number: orderNumber,
      expected_delivery_date,
      notes,
      total_amount: totalAmount,
      created_by: req.user ? req.user.user_id : null,
      status: 'pending'
    }, { transaction });

    // Create order items
    for (const item of items) {
      const quantity = item.quantity_ordered || item.quantity;
      await StockOrderItem.create({
        order_id: order.order_id,
        item_id: item.item_id,
        quantity_ordered: quantity,
        unit_price: item.unit_price,
        total_price: quantity * item.unit_price,
        notes: item.notes
      }, { transaction });
    }

    await transaction.commit();

    const createdOrder = await StockOrder.findByPk(order.order_id, {
      include: [
        { model: StockSupplier, as: 'supplier' },
        { model: StockOrderItem, as: 'items', include: [{ model: StockItem, as: 'item' }] }
      ]
    });

    res.status(201).json({ message: 'Order created successfully', order: createdOrder });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// PATCH /api/stock/orders/:id/receive
router.patch('/orders/:id/receive', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await StockOrder.findByPk(req.params.id, {
      include: [{ model: StockOrderItem, as: 'items' }],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    await order.update({
      status: 'delivered',
      actual_delivery_date: new Date(),
      received_by: req.user ? req.user.user_id : null
    }, { transaction });

    // Create stock movements and update quantities
    for (const orderItem of order.items) {
      // Create movement
      await StockMovement.create({
        item_id: orderItem.item_id,
        homestay_id: order.homestay_id,
        movement_type: 'purchase',
        quantity: orderItem.quantity_ordered,
        unit_cost: orderItem.unit_price,
        total_cost: orderItem.total_price,
        supplier_id: order.supplier_id,
        reference: order.order_number,
        staff_id: req.user ? req.user.user_id : null,
        account_id: order.account_id
      }, { transaction });

      // Update stock quantity
      const item = await StockItem.findByPk(orderItem.item_id, { transaction });
      if (item) {
        await item.update({
          quantity: item.quantity + orderItem.quantity_ordered
        }, { transaction });
      }
    }

    await transaction.commit();
    res.json({ message: 'Order received successfully', order });
  } catch (error) {
    await transaction.rollback();
    console.error('Error receiving order:', error);
    res.status(500).json({ message: 'Error receiving order', error: error.message });
  }
});

// ============================================
// INVENTORY ALERTS
// ============================================

// GET /api/stock/alerts
router.get('/alerts', async (req, res) => {
  try {
    const { homestay_id } = req.query;
    const whereClause = {
      [Op.or]: [
        { quantity: 0 },
        { quantity: { [Op.lte]: sequelize.col('reorder_level') } }
      ]
    };

    if (homestay_id) whereClause.homestay_id = homestay_id;

    const alerts = await StockItem.findAll({
      where: whereClause,
      include: [
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] },
        { model: StockSupplier, as: 'supplier', attributes: ['supplier_id', 'name', 'phone'] }
      ],
      order: [['quantity', 'ASC']]
    });

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Error fetching alerts', error: error.message });
  }
});

// ============================================
// DASHBOARD & ALERTS ROUTES
// ============================================

// GET /api/stock/alerts - Low stock alerts
router.get('/alerts', async (req, res) => {
  try {
    const { homestay_id } = req.query;
    
    // Use the inventory_alerts view
    const alerts = await sequelize.query(`
      SELECT 
        ia.*,
        si.unit_cost,
        si.default_supplier_id,
        ss.name as supplier_name
      FROM inventory_alerts ia
      LEFT JOIN stock_items si ON ia.item_id = si.item_id
      LEFT JOIN stock_suppliers ss ON si.default_supplier_id = ss.supplier_id
      WHERE ia.homestay_id = COALESCE(?, ia.homestay_id)
      ORDER BY 
        CASE ia.alert_status
          WHEN 'out_of_stock' THEN 1
          WHEN 'low_stock' THEN 2
          WHEN 'warning' THEN 3
          ELSE 4
        END,
        ia.current_quantity ASC
    `, {
      replacements: [homestay_id],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching stock alerts', 
      error: error.message 
    });
  }
});

// GET /api/stock/usage-logs - Usage logs with filtering
router.get('/usage-logs', async (req, res) => {
  try {
    const { 
      homestay_id, 
      days = 30, 
      used_for, 
      item_id,
      limit = 50 
    } = req.query;

    let whereClause = '1=1';
    const replacements = [];

    if (homestay_id) {
      whereClause += ' AND sul.homestay_id = ?';
      replacements.push(homestay_id);
    }

    if (days) {
      whereClause += ' AND sul.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
      replacements.push(parseInt(days));
    }

    if (used_for) {
      whereClause += ' AND sul.used_for = ?';
      replacements.push(used_for);
    }

    if (item_id) {
      whereClause += ' AND sul.item_id = ?';
      replacements.push(item_id);
    }

    const usageLogs = await sequelize.query(`
      SELECT 
        sul.*,
        si.name as item_name,
        si.category,
        si.unit,
        h.name as homestay_name
      FROM stock_usage_logs sul
      LEFT JOIN stock_items si ON sul.item_id = si.item_id
      LEFT JOIN homestays h ON sul.homestay_id = h.homestay_id
      WHERE ${whereClause}
      ORDER BY sul.created_at DESC
      LIMIT ?
    `, {
      replacements: [...replacements, parseInt(limit)],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: usageLogs
    });
  } catch (error) {
    console.error('Error fetching usage logs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching usage logs', 
      error: error.message 
    });
  }
});

// POST /api/stock/usage-logs - Create usage log
router.post('/usage-logs', [
  body('item_id').isInt().withMessage('Item ID is required'),
  body('used_for').isIn(['room', 'restaurant', 'maintenance', 'housekeeping', 'laundry', 'general']),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('reference_id').optional().isInt(),
  body('notes').optional()
], validate, async (req, res) => {
  try {
    const usageLog = await StockUsageLog.create({
      ...req.body,
      homestay_id: req.user?.assigned_hotel_id || req.body.homestay_id,
      used_by: req.user?.hms_user_id || req.user?.user_id
    });

    // Update stock item quantity
    const item = await StockItem.findByPk(req.body.item_id);
    if (item) {
      const newQuantity = item.quantity - req.body.quantity;
      if (newQuantity < 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Insufficient stock quantity' 
        });
      }
      await item.update({ quantity: newQuantity });
    }

    res.status(201).json({
      success: true,
      message: 'Usage logged successfully',
      data: usageLog
    });
  } catch (error) {
    console.error('Error creating usage log:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating usage log', 
      error: error.message 
    });
  }
});

// GET /api/stock/dashboard - Dashboard summary data
router.get('/dashboard', async (req, res) => {
  try {
    const { homestay_id } = req.query;
    const userHomestayId = req.user?.assigned_hotel_id || homestay_id;

    // Get total items count
    const totalItems = await StockItem.count({
      where: userHomestayId ? { homestay_id: userHomestayId } : {}
    });

    // Get low stock count
    const lowStockCount = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM inventory_alerts
      WHERE homestay_id = COALESCE(?, homestay_id)
        AND alert_status IN ('low_stock', 'out_of_stock')
    `, {
      replacements: [userHomestayId],
      type: sequelize.QueryTypes.SELECT
    });

    // Get total inventory value
    const totalValue = await sequelize.query(`
      SELECT SUM(si.quantity * COALESCE(si.unit_cost, 0)) as total_value
      FROM stock_items si
      WHERE si.homestay_id = COALESCE(?, si.homestay_id)
    `, {
      replacements: [userHomestayId],
      type: sequelize.QueryTypes.SELECT
    });

    // Get monthly usage
    const monthlyUsage = await sequelize.query(`
      SELECT SUM(quantity) as total_usage
      FROM stock_usage_logs
      WHERE homestay_id = COALESCE(?, homestay_id)
        AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `, {
      replacements: [userHomestayId],
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      data: {
        totalItems,
        lowStockCount: lowStockCount[0]?.count || 0,
        totalValue: totalValue[0]?.total_value || 0,
        monthlyUsage: monthlyUsage[0]?.total_usage || 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard data', 
      error: error.message 
    });
  }
});

module.exports = router;
