const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const {
  HotelRestaurant,
  RestaurantTable,
  MenuCategory,
  MenuItem,
  MenuItemIngredient,
  RestaurantOrder,
  OrderItem,
  KitchenQueue,
  OrderDeliveryInfo,
  Homestay,
  User,
  Room,
  Booking,
  StockItem,
  StockMovement
} = require('../models');
const { Op, Sequelize } = require('sequelize');
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
// RESTAURANT TABLES ROUTES
// ============================================

// GET /api/restaurant/tables
router.get('/tables', async (req, res) => {
  try {
    const { homestay_id, status } = req.query;
    const whereClause = {};
    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (status) whereClause.status = status;

    const tables = await RestaurantTable.findAll({
      where: whereClause,
      include: [{ model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] }],
      order: [['table_number', 'ASC']]
    });

    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tables', error: error.message });
  }
});

// POST /api/restaurant/tables
router.post('/tables', [
  body('homestay_id').isInt(),
  body('table_number').notEmpty(),
  body('capacity').isInt({ min: 1 })
], validate, async (req, res) => {
  try {
    const table = await RestaurantTable.create(req.body);
    res.status(201).json({ message: 'Table created successfully', table });
  } catch (error) {
    res.status(500).json({ message: 'Error creating table', error: error.message });
  }
});

// PUT /api/restaurant/tables/:id
router.put('/tables/:id', async (req, res) => {
  try {
    const table = await RestaurantTable.findByPk(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    
    await table.update(req.body);
    res.json({ message: 'Table updated successfully', table });
  } catch (error) {
    res.status(500).json({ message: 'Error updating table', error: error.message });
  }
});

// DELETE /api/restaurant/tables/:id
router.delete('/tables/:id', async (req, res) => {
  try {
    const table = await RestaurantTable.findByPk(req.params.id);
    if (!table) return res.status(404).json({ message: 'Table not found' });
    
    await table.destroy();
    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting table', error: error.message });
  }
});

// ============================================
// MENU MANAGEMENT ROUTES
// ============================================

// GET /api/restaurant/menu-categories
router.get('/menu-categories', async (req, res) => {
  try {
    const { restaurant_id } = req.query;

    // Since menu_categories table doesn't exist, return menu items grouped by restaurant
    const whereClause = restaurant_id ? { restaurant_id } : {};

    const items = await MenuItem.findAll({
      where: whereClause,
      attributes: ['restaurant_id', [sequelize.fn('COUNT', sequelize.col('menu_id')), 'item_count']],
      group: ['restaurant_id'],
      raw: true
    });

    // Return a simple structure for now
    // TODO: Create proper menu_categories table or use a different approach
    res.json([]);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// POST /api/restaurant/menu-categories
router.post('/menu-categories', [
  body('homestay_id').isInt(),
  body('name').notEmpty()
], validate, async (req, res) => {
  try {
    const category = await MenuCategory.create(req.body);
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

// GET /api/restaurant/menu-items
router.get('/menu-items', async (req, res) => {
  try {
    const { restaurant_id, available } = req.query;
    const whereClause = {};
    if (restaurant_id) whereClause.restaurant_id = restaurant_id;
    if (available !== undefined) whereClause.available = available === 'true';

    const items = await MenuItem.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });

    // Transform data to include item_id and is_available for frontend compatibility
    const transformedItems = items.map(item => ({
      ...item.toJSON(),
      item_id: item.menu_id,
      is_available: item.available
    }));

    res.json(transformedItems);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Error fetching menu items', error: error.message });
  }
});

// POST /api/restaurant/menu-items
router.post('/menu-items', [
  body('restaurant_id').isInt(),
  body('name').notEmpty(),
  body('price').isDecimal()
], validate, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ message: 'Menu item created successfully', item });
  } catch (error) {
    res.status(500).json({ message: 'Error creating menu item', error: error.message });
  }
});

// PUT /api/restaurant/menu-items/:id
router.put('/menu-items/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    
    await item.update(req.body);
    res.json({ message: 'Menu item updated successfully', item });
  } catch (error) {
    res.status(500).json({ message: 'Error updating menu item', error: error.message });
  }
});

// DELETE /api/restaurant/menu-items/:id
router.delete('/menu-items/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });
    
    await item.destroy();
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting menu item', error: error.message });
  }
});

// ============================================
// RESTAURANT ORDERS ROUTES
// ============================================

// GET /api/restaurant/orders
router.get('/orders', async (req, res) => {
  try {
    const { homestay_id, status, order_type } = req.query;
    const whereClause = {};
    if (homestay_id) whereClause.homestay_id = homestay_id;
    if (status) whereClause.status = status;
    if (order_type) whereClause.order_type = order_type;

    const orders = await RestaurantOrder.findAll({
      where: whereClause,
      include: [
        { model: Homestay, as: 'homestay', attributes: ['homestay_id', 'name'] },
        { model: RestaurantTable, as: 'table', attributes: ['table_id', 'table_number', 'location'] },
        { model: Room, as: 'room', attributes: ['inventory_id', 'unit_number'] },
        { model: User, as: 'creator', attributes: ['user_id', 'name'] },
        { model: OrderItem, as: 'items', include: [
          { model: MenuItem, as: 'menuItem', attributes: ['item_id', 'name', 'price'] }
        ]}
      ],
      order: [['order_date', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// POST /api/restaurant/orders
router.post('/orders', [
  body('homestay_id').isInt(),
  body('order_type').isIn(['dine_in', 'room_service', 'takeaway']),
  body('items').isArray({ min: 1 })
], validate, async (req, res) => {
  try {
    const { homestay_id, items, ...orderData } = req.body;
    
    // Generate order number
    const orderCount = await RestaurantOrder.count({ where: { homestay_id } });
    const orderNumber = `ORD-${homestay_id}-${Date.now()}-${orderCount + 1}`;
    
    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menu_item_id);
      subtotal += parseFloat(menuItem.price) * item.quantity;
    }
    
    const total_amount = subtotal;
    
    // Create order
    const order = await RestaurantOrder.create({
      ...orderData,
      homestay_id,
      order_number: orderNumber,
      subtotal,
      total_amount,
      created_by: req.user ? req.user.user_id : null
    });
    
    // Create order items
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menu_item_id);
      const total_price = parseFloat(menuItem.price) * item.quantity;
      
      const orderItem = await OrderItem.create({
        order_id: order.order_id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        unit_price: menuItem.price,
        total_price,
        special_instructions: item.special_instructions
      });
      
      // Add to kitchen queue
      await KitchenQueue.create({
        order_id: order.order_id,
        order_item_id: orderItem.order_item_id,
        estimated_time: menuItem.preparation_time || 15
      });
    }
    
    // Create delivery info
    await OrderDeliveryInfo.create({
      order_id: order.order_id,
      order_type: orderData.order_type,
      room_number: orderData.room_id,
      table_number: orderData.table_id
    });
    
    const createdOrder = await RestaurantOrder.findByPk(order.order_id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: MenuItem, as: 'menuItem' }] }
      ]
    });
    
    res.status(201).json({ message: 'Order created successfully', order: createdOrder });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// PUT /api/restaurant/orders/:id
router.put('/orders/:id', async (req, res) => {
  try {
    const order = await RestaurantOrder.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    await order.update(req.body);
    res.json({ message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

// ============================================
// ORDER ITEMS ROUTES
// ============================================

// GET /api/restaurant/order-items/:orderId
router.get('/order-items/:orderId', async (req, res) => {
  try {
    const items = await OrderItem.findAll({
      where: { order_id: req.params.orderId },
      include: [
        { model: MenuItem, as: 'menuItem', attributes: ['item_id', 'name', 'price', 'description'] },
        { model: RestaurantOrder, as: 'order', attributes: ['order_id', 'order_number', 'status'] }
      ]
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order items', error: error.message });
  }
});

// ============================================
// KITCHEN QUEUE ROUTES
// ============================================

// GET /api/restaurant/kitchen-queue
router.get('/kitchen-queue', async (req, res) => {
  try {
    const { status, assigned_chef } = req.query;
    const whereClause = {};
    if (status) whereClause.status = status;
    if (assigned_chef) whereClause.assigned_chef = assigned_chef;

    const queue = await KitchenQueue.findAll({
      where: whereClause,
      include: [
        {
          model: RestaurantOrder,
          as: 'order',
          attributes: ['order_id', 'order_number', 'order_type'],
          include: [
            { model: RestaurantTable, as: 'table', attributes: ['table_number'] },
            { model: Room, as: 'room', attributes: ['unit_number'] }
          ]
        },
        {
          model: OrderItem,
          as: 'orderItem',
          attributes: ['order_item_id', 'quantity', 'special_instructions'],
          include: [{ model: MenuItem, as: 'menuItem', attributes: ['name', 'description'] }]
        },
        { model: User, as: 'chef', attributes: ['user_id', 'name'] }
      ],
      order: [['priority', 'DESC'], ['created_at', 'ASC']]
    });

    res.json(queue);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching kitchen queue', error: error.message });
  }
});

// PATCH /api/restaurant/kitchen-queue/:id/start
router.patch('/kitchen-queue/:id/start', async (req, res) => {
  try {
    const item = await KitchenQueue.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Queue item not found' });
    
    await item.update({
      status: 'preparing',
      start_time: new Date(),
      assigned_chef: req.user ? req.user.user_id : item.assigned_chef
    });
    
    res.json({ message: 'Cooking started', item });
  } catch (error) {
    res.status(500).json({ message: 'Error starting cooking', error: error.message });
  }
});

// PATCH /api/restaurant/kitchen-queue/:id/complete
router.patch('/kitchen-queue/:id/complete', async (req, res) => {
  try {
    const item = await KitchenQueue.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Queue item not found' });
    
    await item.update({
      status: 'ready',
      completion_time: new Date()
    });
    
    // Update order item status
    await OrderItem.update(
      { status: 'ready' },
      { where: { order_item_id: item.order_item_id } }
    );
    
    res.json({ message: 'Item ready for serving', item });
  } catch (error) {
    res.status(500).json({ message: 'Error completing item', error: error.message });
  }
});

// ============================================
// ORDER DELIVERY INFO ROUTES
// ============================================

// GET /api/restaurant/delivery-info/:orderId
router.get('/delivery-info/:orderId', async (req, res) => {
  try {
    const info = await OrderDeliveryInfo.findOne({
      where: { order_id: req.params.orderId },
      include: [
        { model: RestaurantOrder, as: 'order', attributes: ['order_id', 'order_number', 'order_type'] },
        { model: User, as: 'deliveryPerson', attributes: ['user_id', 'name', 'phone'] }
      ]
    });

    if (!info) return res.status(404).json({ message: 'Delivery info not found' });
    res.json(info);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching delivery info', error: error.message });
  }
});

// PATCH /api/restaurant/delivery-info/:id/deliver
router.patch('/delivery-info/:id/deliver', async (req, res) => {
  try {
    const info = await OrderDeliveryInfo.findByPk(req.params.id);
    if (!info) return res.status(404).json({ message: 'Delivery info not found' });
    
    await info.update({
      delivery_status: 'delivered',
      delivered_by: req.user ? req.user.user_id : null,
      delivered_at: new Date(),
      delivery_notes: req.body.delivery_notes
    });
    
    // Update order status
    await RestaurantOrder.update(
      { status: 'served' },
      { where: { order_id: info.order_id } }
    );
    
    res.json({ message: 'Order delivered successfully', info });
  } catch (error) {
    res.status(500).json({ message: 'Error marking as delivered', error: error.message });
  }
});

// ============================================
// MENU ITEM INGREDIENTS (RECIPE) ROUTES
// ============================================

// GET /api/restaurant/menu-items/:menuId/ingredients
router.get('/menu-items/:menuId/ingredients', async (req, res) => {
  try {
    const ingredients = await MenuItemIngredient.findAll({
      where: { menu_id: req.params.menuId },
      include: [
        { model: StockItem, as: 'stockItem', attributes: ['item_id', 'name', 'unit', 'quantity'] }
      ]
    });

    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ingredients', error: error.message });
  }
});

// POST /api/restaurant/menu-items/:menuId/ingredients
router.post('/menu-items/:menuId/ingredients', [
  body('stock_item_id').isInt(),
  body('quantity_required').isFloat({ min: 0.01 })
], validate, async (req, res) => {
  try {
    const ingredient = await MenuItemIngredient.create({
      menu_id: req.params.menuId,
      ...req.body
    });

    const createdIngredient = await MenuItemIngredient.findByPk(ingredient.ingredient_id, {
      include: [{ model: StockItem, as: 'stockItem' }]
    });

    res.status(201).json({ message: 'Ingredient added successfully', ingredient: createdIngredient });
  } catch (error) {
    res.status(500).json({ message: 'Error adding ingredient', error: error.message });
  }
});

// PUT /api/restaurant/ingredients/:id
router.put('/ingredients/:id', async (req, res) => {
  try {
    const ingredient = await MenuItemIngredient.findByPk(req.params.id);
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });

    await ingredient.update(req.body);
    res.json({ message: 'Ingredient updated successfully', ingredient });
  } catch (error) {
    res.status(500).json({ message: 'Error updating ingredient', error: error.message });
  }
});

// DELETE /api/restaurant/ingredients/:id
router.delete('/ingredients/:id', async (req, res) => {
  try {
    const ingredient = await MenuItemIngredient.findByPk(req.params.id);
    if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });

    await ingredient.destroy();
    res.json({ message: 'Ingredient removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error removing ingredient', error: error.message });
  }
});

// ============================================
// ORDER COMPLETION WITH STOCK DEDUCTION
// ============================================

// PATCH /api/restaurant/orders/:id/complete
router.patch('/orders/:id/complete', async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const order = await RestaurantOrder.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: MenuItem,
              as: 'menuItem',
              include: [
                {
                  model: MenuItemIngredient,
                  as: 'ingredients',
                  include: [{ model: StockItem, as: 'stockItem' }]
                }
              ]
            }
          ]
        }
      ],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Process each order item and deduct stock
    for (const orderItem of order.items) {
      const menuItem = orderItem.menuItem;

      if (menuItem && menuItem.ingredients && menuItem.ingredients.length > 0) {
        // For each ingredient in the menu item
        for (const ingredient of menuItem.ingredients) {
          const stockItem = ingredient.stockItem;
          const quantityNeeded = parseFloat(ingredient.quantity_required) * orderItem.quantity;

          // Check if sufficient stock
          if (stockItem.quantity < quantityNeeded) {
            await transaction.rollback();
            return res.status(400).json({
              message: `Insufficient stock for ${stockItem.name}. Required: ${quantityNeeded}, Available: ${stockItem.quantity}`
            });
          }

          // Deduct stock
          await stockItem.update({
            quantity: stockItem.quantity - quantityNeeded
          }, { transaction });

          // Record stock movement
          await StockMovement.create({
            item_id: stockItem.item_id,
            homestay_id: order.homestay_id,
            movement_type: 'usage',
            quantity: quantityNeeded,
            unit_cost: 0, // Cost tracking can be added later
            total_cost: 0,
            reference: `Restaurant Order: ${order.order_number}`,
            staff_id: req.user ? req.user.user_id : null,
            movement_date: new Date(),
            notes: `Used for ${menuItem.name} - Order ${order.order_number}`
          }, { transaction });
        }
      }
    }

    // Update order status to completed
    await order.update({
      status: 'completed'
    }, { transaction });

    // Update all order items to served
    await OrderItem.update(
      { status: 'served' },
      { where: { order_id: order.order_id }, transaction }
    );

    // Update kitchen queue items to served
    await KitchenQueue.update(
      { status: 'served' },
      { where: { order_id: order.order_id }, transaction }
    );

    await transaction.commit();

    const completedOrder = await RestaurantOrder.findByPk(order.order_id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: MenuItem, as: 'menuItem' }] }
      ]
    });

    res.json({
      message: 'Order completed and stock deducted successfully',
      order: completedOrder
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error completing order:', error);
    res.status(500).json({ message: 'Error completing order', error: error.message });
  }
});

module.exports = router;
