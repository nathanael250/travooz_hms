const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const { FinancialAccount, Homestay } = require('../models');
const { Op } = require('sequelize');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// GET /api/financial-accounts - List all financial accounts with filtering
router.get('/', [
  query('homestay_id').optional().isInt(),
  query('account_type').optional().isIn(['bank', 'cash', 'mobile_money']),
  query('status').optional().isIn(['active', 'inactive']),
  query('search').optional().isString()
], validate, async (req, res) => {
  try {
    const { homestay_id, account_type, status, search } = req.query;

    const whereClause = {};

    if (homestay_id) {
      whereClause.homestay_id = homestay_id;
    }

    if (account_type) {
      whereClause.account_type = account_type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause[Op.or] = [
        { account_name: { [Op.like]: `%${search}%` } },
        { bank_name: { [Op.like]: `%${search}%` } },
        { account_number: { [Op.like]: `%${search}%` } }
      ];
    }

    const accounts = await FinancialAccount.findAll({
      where: whereClause,
      include: [{
        model: Homestay,
        as: 'homestay',
        attributes: ['homestay_id', 'name', 'location_id']
      }],
      order: [['created_at', 'DESC']]
    });

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching financial accounts:', error);
    res.status(500).json({ message: 'Error fetching financial accounts', error: error.message });
  }
});

// GET /api/financial-accounts/active - Get only active accounts (for dropdowns)
router.get('/active', [
  query('homestay_id').optional().isInt()
], validate, async (req, res) => {
  try {
    const { homestay_id } = req.query;

    const whereClause = { status: 'active' };

    if (homestay_id) {
      whereClause.homestay_id = homestay_id;
    }

    const accounts = await FinancialAccount.findAll({
      where: whereClause,
      attributes: ['account_id', 'account_name', 'account_type', 'currency', 'homestay_id'],
      include: [{
        model: Homestay,
        as: 'homestay',
        attributes: ['homestay_id', 'name']
      }],
      order: [['account_name', 'ASC']]
    });

    res.json(accounts);
  } catch (error) {
    console.error('Error fetching active accounts:', error);
    res.status(500).json({ message: 'Error fetching active accounts', error: error.message });
  }
});

// GET /api/financial-accounts/:account_id - Get specific account
router.get('/:account_id', [
  param('account_id').isInt()
], validate, async (req, res) => {
  try {
    const { account_id } = req.params;

    const account = await FinancialAccount.findByPk(account_id, {
      include: [{
        model: Homestay,
        as: 'homestay',
        attributes: ['homestay_id', 'name', 'location_id', 'contact_phone']
      }]
    });

    if (!account) {
      return res.status(404).json({ message: 'Financial account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Error fetching financial account:', error);
    res.status(500).json({ message: 'Error fetching financial account', error: error.message });
  }
});

// POST /api/financial-accounts - Create new financial account
router.post('/', [
  body('homestay_id').isInt().withMessage('Homestay ID is required'),
  body('account_name').notEmpty().withMessage('Account name is required'),
  body('account_type').isIn(['bank', 'cash', 'mobile_money']).withMessage('Valid account type is required'),
  body('bank_name').optional().isString(),
  body('account_number').optional().isString(),
  body('currency').optional().isString().isLength({ max: 10 }),
  body('status').optional().isIn(['active', 'inactive'])
], validate, async (req, res) => {
  try {
    const {
      homestay_id,
      account_name,
      account_type,
      bank_name,
      account_number,
      currency,
      status
    } = req.body;

    // Verify homestay exists
    const homestay = await Homestay.findByPk(homestay_id);
    if (!homestay) {
      return res.status(404).json({ message: 'Homestay not found' });
    }

    // Check for duplicate account name within the same homestay
    const existingAccount = await FinancialAccount.findOne({
      where: {
        homestay_id,
        account_name
      }
    });

    if (existingAccount) {
      return res.status(400).json({
        message: 'An account with this name already exists for this homestay'
      });
    }

    const account = await FinancialAccount.create({
      homestay_id,
      account_name,
      account_type,
      bank_name: bank_name || null,
      account_number: account_number || null,
      currency: currency || 'RWF',
      status: status || 'active'
    });

    // Fetch the created account with homestay details
    const createdAccount = await FinancialAccount.findByPk(account.account_id, {
      include: [{
        model: Homestay,
        as: 'homestay',
        attributes: ['homestay_id', 'name', 'location_id']
      }]
    });

    res.status(201).json({
      message: 'Financial account created successfully',
      account: createdAccount
    });
  } catch (error) {
    console.error('Error creating financial account:', error);
    res.status(500).json({ message: 'Error creating financial account', error: error.message });
  }
});

// PUT /api/financial-accounts/:account_id - Update financial account
router.put('/:account_id', [
  param('account_id').isInt(),
  body('account_name').optional().notEmpty(),
  body('account_type').optional().isIn(['bank', 'cash', 'mobile_money']),
  body('bank_name').optional(),
  body('account_number').optional(),
  body('currency').optional().isString().isLength({ max: 10 }),
  body('status').optional().isIn(['active', 'inactive'])
], validate, async (req, res) => {
  try {
    const { account_id } = req.params;
    const updateData = req.body;

    const account = await FinancialAccount.findByPk(account_id);

    if (!account) {
      return res.status(404).json({ message: 'Financial account not found' });
    }

    // If updating account name, check for duplicates
    if (updateData.account_name && updateData.account_name !== account.account_name) {
      const existingAccount = await FinancialAccount.findOne({
        where: {
          homestay_id: account.homestay_id,
          account_name: updateData.account_name,
          account_id: { [Op.ne]: account_id }
        }
      });

      if (existingAccount) {
        return res.status(400).json({
          message: 'An account with this name already exists for this homestay'
        });
      }
    }

    await account.update(updateData);

    // Fetch updated account with homestay details
    const updatedAccount = await FinancialAccount.findByPk(account_id, {
      include: [{
        model: Homestay,
        as: 'homestay',
        attributes: ['homestay_id', 'name', 'location_id']
      }]
    });

    res.json({
      message: 'Financial account updated successfully',
      account: updatedAccount
    });
  } catch (error) {
    console.error('Error updating financial account:', error);
    res.status(500).json({ message: 'Error updating financial account', error: error.message });
  }
});

// DELETE /api/financial-accounts/:account_id - Delete financial account
router.delete('/:account_id', [
  param('account_id').isInt()
], validate, async (req, res) => {
  try {
    const { account_id } = req.params;

    const account = await FinancialAccount.findByPk(account_id);

    if (!account) {
      return res.status(404).json({ message: 'Financial account not found' });
    }

    // TODO: Check if account has linked transactions before deleting
    // For now, we'll just delete it
    // In production, you might want to soft-delete by setting status to 'inactive'

    await account.destroy();

    res.json({
      message: 'Financial account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting financial account:', error);

    // Check if error is due to foreign key constraint
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        message: 'Cannot delete account with existing transactions. Consider setting it to inactive instead.'
      });
    }

    res.status(500).json({ message: 'Error deleting financial account', error: error.message });
  }
});

// PATCH /api/financial-accounts/:account_id/status - Toggle account status
router.patch('/:account_id/status', [
  param('account_id').isInt(),
  body('status').isIn(['active', 'inactive'])
], validate, async (req, res) => {
  try {
    const { account_id } = req.params;
    const { status } = req.body;

    const account = await FinancialAccount.findByPk(account_id);

    if (!account) {
      return res.status(404).json({ message: 'Financial account not found' });
    }

    await account.update({ status });

    res.json({
      message: `Account ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      account
    });
  } catch (error) {
    console.error('Error updating account status:', error);
    res.status(500).json({ message: 'Error updating account status', error: error.message });
  }
});

// GET /api/financial-accounts/summary/statistics - Get account statistics
router.get('/summary/statistics', [
  query('homestay_id').optional().isInt()
], validate, async (req, res) => {
  try {
    const { homestay_id } = req.query;

    const whereClause = {};
    if (homestay_id) {
      whereClause.homestay_id = homestay_id;
    }

    const totalAccounts = await FinancialAccount.count({ where: whereClause });

    const activeAccounts = await FinancialAccount.count({
      where: { ...whereClause, status: 'active' }
    });

    const accountsByType = await FinancialAccount.findAll({
      where: whereClause,
      attributes: [
        'account_type',
        [require('sequelize').fn('COUNT', require('sequelize').col('account_id')), 'count']
      ],
      group: ['account_type']
    });

    res.json({
      totalAccounts,
      activeAccounts,
      inactiveAccounts: totalAccounts - activeAccounts,
      accountsByType: accountsByType.reduce((acc, item) => {
        acc[item.account_type] = parseInt(item.dataValues.count);
        return acc;
      }, {})
    });
  } catch (error) {
    console.error('Error fetching account statistics:', error);
    res.status(500).json({ message: 'Error fetching account statistics', error: error.message });
  }
});

module.exports = router;
