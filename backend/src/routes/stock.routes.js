const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const {
  StockItem,
  StockMovement,
  StockSupplier,
  StockUsageLog,
  StockOrder,
  StockOrderItem,
  InventoryCategory,
  DeliveryNote,
  DeliveryNoteItem,
  StockCostLog,
  StockUnit,
  Homestay,
  User,
  FinancialAccount
} = require('../models');
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
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching stock items:', error);
    res.status(500).json({ message: 'Error fetching stock items', error: error.message });
  }
});

// POST /api/stock/items
router.post('/items', [
  body('name').notEmpty().withMessage('Item name is required'),
  body('homestay_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('description').optional(),
  body('category').optional(),
  body('unit').optional(),
  body('current_quantity').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('reorder_level').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('unit_price').optional({ nullable: true, checkFalsy: true }).isDecimal(),
  body('status').optional().isIn(['active', 'inactive', 'discontinued'])
], validate, async (req, res) => {
  try {
    const item = await StockItem.create(req.body);
    res.status(201).json({ success: true, message: 'Stock item created successfully', data: item });
  } catch (error) {
    console.error('Error creating stock item:', error);
    res.status(500).json({ message: 'Error creating stock item', error: error.message });
  }
});

// PUT /api/stock/items/:id
router.put('/items/:id', [
  body('name').optional().notEmpty(),
  body('homestay_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('category').optional(),
  body('unit').optional(),
  body('reorder_level').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('current_quantity').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('unit_price').optional({ nullable: true, checkFalsy: true }).isFloat(),
  body('description').optional(),
  body('status').optional().isIn(['active', 'inactive', 'discontinued'])
], validate, async (req, res) => {
  try {
    const item = await StockItem.findByPk(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Stock item not found' });
    }

    await item.update(req.body);
    res.json({ success: true, message: 'Stock item updated successfully', data: item });
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
    res.json({ success: true, message: 'Stock item deleted successfully' });
  } catch (error) {
    console.error('Error deleting stock item:', error);
    res.status(500).json({ message: 'Error deleting stock item', error: error.message });
  }
});

// ============================================
// SUPPLIERS ROUTES
// ============================================

// GET /api/stock/suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const { homestay_id, status } = req.query;
    const whereClause = {};

    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (status) whereClause.status = status;

    const suppliers = await StockSupplier.findAll({
      where: whereClause,
      include: [
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] }
      ],
      order: [['name', 'ASC']]
    });

    res.json({ success: true, data: suppliers });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Error fetching suppliers', error: error.message });
  }
});

// POST /api/stock/suppliers
router.post('/suppliers', [
  body('name').notEmpty().withMessage('Supplier name is required'),
  body('homestay_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('email').optional().isEmail(),
  body('phone').optional(),
  body('tin').optional(),
  body('contact_person').optional(),
  body('address').optional(),
  body('notes').optional(),
  body('status').optional().isIn(['active', 'inactive', 'blacklisted'])
], validate, async (req, res) => {
  try {
    const supplier = await StockSupplier.create(req.body);
    res.status(201).json({ success: true, message: 'Supplier created successfully', data: supplier });
  } catch (error) {
    console.error('Error creating supplier:', error);
    res.status(500).json({ message: 'Error creating supplier', error: error.message });
  }
});

// PUT /api/stock/suppliers/:id
router.put('/suppliers/:id', [
  body('name').optional().notEmpty(),
  body('homestay_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('email').optional().isEmail(),
  body('phone').optional(),
  body('tin').optional(),
  body('contact_person').optional(),
  body('address').optional(),
  body('notes').optional(),
  body('status').optional().isIn(['active', 'inactive', 'blacklisted'])
], validate, async (req, res) => {
  try {
    const supplier = await StockSupplier.findByPk(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await supplier.update(req.body);
    res.json({ success: true, message: 'Supplier updated successfully', data: supplier });
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
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    res.status(500).json({ message: 'Error deleting supplier', error: error.message });
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

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// GET /api/stock/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await StockOrder.findByPk(req.params.id, {
      include: [
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] },
        { model: StockSupplier, as: 'supplier', attributes: ['supplier_id', 'name', 'phone', 'email'] },
        { model: User, as: 'creator', attributes: ['user_id', 'name'] },
        { model: User, as: 'approver', attributes: ['user_id', 'name'] },
        { model: User, as: 'receiver', attributes: ['user_id', 'name'] },
        { model: FinancialAccount, as: 'account', attributes: ['account_id', 'account_name'] },
        {
          model: StockOrderItem,
          as: 'items',
          include: [{ 
            model: StockItem, 
            as: 'item', 
            attributes: ['item_id', 'name', 'unit', 'category'] 
          }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

// POST /api/stock/orders
router.post('/orders', [
  body('supplier_id').isInt().withMessage('Supplier ID is required'),
  body('homestay_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('order_date').optional().isISO8601(),
  body('expected_delivery_date').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'verified', 'approved', 'sent', 'received', 'cancelled']),
  body('total_amount').optional().isDecimal(),
  body('notes').optional(),
  body('items').optional().isArray()
], validate, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Generate order number if not provided
    const orderNumber = req.body.order_number || `PO-${Date.now()}`;
    
    // Create the order
    const order = await StockOrder.create({
      ...req.body,
      order_number: orderNumber,
      order_date: req.body.order_date || new Date(),
      created_by: req.user ? req.user.user_id : null
    }, { transaction });

    // Create order items if provided
    if (req.body.items && req.body.items.length > 0) {
      for (const item of req.body.items) {
        await StockOrderItem.create({
          order_id: order.order_id,
          item_id: item.item_id,
          quantity_ordered: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          notes: item.notes
        }, { transaction });
      }
    }

    await transaction.commit();
    
    // Fetch the complete order with items
    const completeOrder = await StockOrder.findByPk(order.order_id, {
      include: [
        { model: StockSupplier, as: 'supplier', attributes: ['supplier_id', 'name', 'phone'] },
        { model: StockOrderItem, as: 'items', include: [{ model: StockItem, as: 'item', attributes: ['item_id', 'name', 'unit'] }] }
      ]
    });
    
    res.status(201).json({ success: true, message: 'Order created successfully', data: completeOrder });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// PUT /api/stock/orders/:id
router.put('/orders/:id', [
  body('supplier_id').optional().isInt(),
  body('homestay_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('order_date').optional().isISO8601(),
  body('expected_delivery_date').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'verified', 'approved', 'sent', 'received', 'cancelled']),
  body('total_amount').optional().isDecimal(),
  body('notes').optional()
], validate, async (req, res) => {
  try {
    const order = await StockOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.update(req.body);
    res.json({ success: true, message: 'Order updated successfully', data: order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// PATCH /api/stock/orders/:id (for partial updates)
router.patch('/orders/:id', [
  body('supplier_id').optional().isInt(),
  body('homestay_id').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('order_date').optional().isISO8601(),
  body('expected_delivery_date').optional().isISO8601(),
  body('status').optional().isIn(['pending', 'verified', 'approved', 'sent', 'received', 'cancelled']),
  body('total_amount').optional().isDecimal(),
  body('notes').optional()
], validate, async (req, res) => {
  try {
    console.log(`PATCH /stock/orders/${req.params.id} - Updating order with:`, req.body);
    
    const order = await StockOrder.findByPk(req.params.id);
    if (!order) {
      console.log(`Order ${req.params.id} not found`);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log(`Current order status: ${order.status}`);
    await order.update(req.body);
    console.log(`Updated order status: ${order.status}`);
    
    res.json({ success: true, message: 'Order updated successfully', data: order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// DELETE /api/stock/orders/:id
router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await StockOrder.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await order.destroy();
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order', error: error.message });
  }
});

// ============================================
// STOCK MOVEMENTS ROUTES
// ============================================

// GET /api/stock/movements
router.get('/movements', async (req, res) => {
  try {
    const { item_id, movement_type, start_date, end_date } = req.query;
    const whereClause = {};

    if (item_id) whereClause.item_id = item_id;
    if (movement_type) whereClause.movement_type = movement_type;
    if (start_date && end_date) {
      whereClause.movement_date = {
        [Op.between]: [new Date(start_date), new Date(end_date)]
      };
    }

    const movements = await StockMovement.findAll({
      where: whereClause,
      include: [
        { model: StockItem, as: 'item', attributes: ['item_id', 'name', 'unit'] },
        { model: User, as: 'staff', attributes: ['user_id', 'name'] }
      ],
      order: [['movement_date', 'DESC']]
    });

    res.json({ success: true, data: movements });
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
    res.status(201).json({ success: true, message: 'Movement recorded successfully', data: { movement, newQuantity } });
  } catch (error) {
    await transaction.rollback();
    console.error('Error recording movement:', error);
    res.status(500).json({ message: 'Error recording movement', error: error.message });
  }
});

// POST /api/stock/orders/:id/send-email
router.post('/orders/:id/send-email', async (req, res) => {
  try {
    const order = await StockOrder.findByPk(req.params.id, {
      include: [
        { model: StockSupplier, as: 'supplier', attributes: ['supplier_id', 'name', 'email', 'phone'] },
        { model: StockOrderItem, as: 'items', include: [{ model: StockItem, as: 'item', attributes: ['item_id', 'name', 'unit'] }] }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (!order.supplier?.email) {
      return res.status(400).json({ message: 'Supplier email not found' });
    }

    // TODO: Implement email sending logic here
    // For now, just update the status to 'sent'
    await order.update({ status: 'sent' });

    res.json({ 
      success: true, 
      message: 'Purchase order sent to supplier successfully',
      data: { order_id: order.order_id, supplier_email: order.supplier.email }
    });
  } catch (error) {
    console.error('Error sending purchase order email:', error);
    res.status(500).json({ message: 'Error sending purchase order email', error: error.message });
  }
});

// PATCH /api/stock/orders/:id/receive
router.patch('/orders/:id/receive', [
  body('received_quantities').isObject().withMessage('Received quantities must be an object')
], validate, async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await StockOrder.findByPk(req.params.id, {
      include: [
        { model: StockOrderItem, as: 'items', include: [{ model: StockItem, as: 'item' }] }
      ],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'sent') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Order must be in sent status to mark as received' });
    }

    const receivedQuantities = req.body.received_quantities;
    let totalReceivedValue = 0;

    // Update each order item with received quantities
    for (const orderItem of order.items) {
      const receivedQty = receivedQuantities[orderItem.order_item_id] || 0;
      
      if (receivedQty > 0) {
        // Update the order item
        await orderItem.update({
          quantity_received: receivedQty
        }, { transaction });

        // Update stock quantity
        const stockItem = await StockItem.findByPk(orderItem.item_id, { transaction });
        if (stockItem) {
          const newQuantity = (stockItem.current_quantity || 0) + receivedQty;
          await stockItem.update({
            current_quantity: newQuantity
          }, { transaction });

          // Log stock movement
      await StockMovement.create({
        item_id: orderItem.item_id,
        homestay_id: order.homestay_id,
        movement_type: 'purchase',
            quantity: receivedQty,
        unit_cost: orderItem.unit_price,
            total_cost: receivedQty * orderItem.unit_price,
        supplier_id: order.supplier_id,
            reference: `PO-${order.order_number}`,
            notes: `Received from Purchase Order ${order.order_number}`,
            staff_id: req.user ? req.user.user_id : null
      }, { transaction });

          totalReceivedValue += receivedQty * orderItem.unit_price;
        }
      }
    }

    // Update order status to received
    await order.update({
      status: 'received',
      actual_delivery_date: new Date(),
      received_by: req.user ? req.user.user_id : null
    }, { transaction });

    await transaction.commit();

    // Fetch updated order with items
    const updatedOrder = await StockOrder.findByPk(order.order_id, {
      include: [
        { model: StockSupplier, as: 'supplier', attributes: ['supplier_id', 'name', 'phone'] },
        { model: StockOrderItem, as: 'items', include: [{ model: StockItem, as: 'item', attributes: ['item_id', 'name', 'unit'] }] }
      ]
    });

    res.json({ 
      success: true, 
      message: 'Items marked as received and stock updated successfully',
      order: updatedOrder,
      totalReceivedValue: totalReceivedValue
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error marking items as received:', error);
    res.status(500).json({ message: 'Error marking items as received', error: error.message });
  }
});

// GET /api/stock/balance
router.get('/balance', async (req, res) => {
  try {
    console.log('Stock balance request:', req.query);
    const { from_date, to_date, homestay_id } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (from_date) {
      console.log('From date:', from_date, 'Parsed:', new Date(from_date));
      dateFilter.movement_date = { [Op.gte]: new Date(from_date) };
    }
    if (to_date) {
      console.log('To date:', to_date, 'Parsed:', new Date(to_date));
      // Add end of day time to include all movements on that date
      const endOfDay = new Date(to_date);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.movement_date = {
        ...dateFilter.movement_date,
        [Op.lte]: endOfDay
      };
    }

    console.log('Date filter:', dateFilter);

    // Get stock items
    console.log('Fetching stock items...');
    const stockItems = await StockItem.findAll({
      where: homestay_id ? { homestay_id } : {}
    });
    console.log('Found stock items:', stockItems.length);

    // Get stock movements for the period
    console.log('Fetching stock movements...');
    let stockMovements = [];
    
    if (Object.keys(dateFilter).length > 0) {
      stockMovements = await StockMovement.findAll({
        where: {
          ...dateFilter,
          ...(homestay_id ? { homestay_id } : {})
        }
      });
    } else {
      // If no date filter, get all movements
      stockMovements = await StockMovement.findAll({
        where: homestay_id ? { homestay_id } : {}
      });
    }
    console.log('Found stock movements:', stockMovements.length);

    // Calculate movements for each item
    const balanceData = stockItems.map(item => {
      const itemMovements = stockMovements.filter(movement => movement.item_id === item.item_id);
      
      let stock_in = 0;
      let stock_out = 0;
      
      itemMovements.forEach(movement => {
        if (movement.movement_type === 'purchase') {
          stock_in += movement.quantity;
        } else if (movement.movement_type === 'usage') {
          stock_out += movement.quantity;
        }
        // Add other movement types as needed
      });

      const opening_balance = parseFloat(item.current_quantity || 0) - stock_in + stock_out;
      const closing_balance = parseFloat(item.current_quantity || 0);
      const total_value = closing_balance * parseFloat(item.unit_price || 0);

      return {
        item_id: item.item_id,
        item_name: item.name,
        category: item.category,
        unit: item.unit,
        opening_balance: opening_balance,
        stock_in: stock_in,
        stock_out: stock_out,
        closing_balance: closing_balance,
        unit_price: parseFloat(item.unit_price || 0),
        total_value: total_value,
        reorder_level: parseFloat(item.reorder_level || 0),
        current_quantity: parseFloat(item.current_quantity || 0)
      };
    });

    // Calculate totals
    const totalIn = balanceData.reduce((sum, item) => sum + item.stock_in, 0);
    const totalOut = balanceData.reduce((sum, item) => sum + item.stock_out, 0);
    const totalValue = balanceData.reduce((sum, item) => sum + item.total_value, 0);

    res.json({
      success: true,
      data: {
        items: balanceData,
        summary: {
          total_in: totalIn,
          total_out: totalOut,
          total_value: totalValue
        }
      }
    });
  } catch (error) {
    console.error('Error fetching stock balance:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error fetching stock balance', error: error.message });
  }
});

module.exports = router;