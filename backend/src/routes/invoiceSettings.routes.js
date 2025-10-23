const express = require('express');
const router = express.Router();
const InvoiceSettings = require('../models/invoiceSettings.model');
const authMiddleware = require('../middlewares/auth.middleware');
const hotelAccessMiddleware = require('../middlewares/hotelAccess.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes require authentication and hotel access
router.use(authMiddleware);
router.use(hotelAccessMiddleware);

/**
 * GET /api/invoice-settings
 * Get invoice settings for the user's hotel
 */
router.get('/', async (req, res) => {
  try {
    const homestayId = req.user.assigned_hotel_id;

    if (!homestayId) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel'
      });
    }

    let settings = await InvoiceSettings.findOne({
      where: { homestay_id: homestayId }
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await InvoiceSettings.create({
        homestay_id: homestayId
      });
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error fetching invoice settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice settings',
      error: error.message
    });
  }
});

/**
 * PUT /api/invoice-settings
 * Update invoice settings for the user's hotel
 */
router.put('/', async (req, res) => {
  try {
    const homestayId = req.user.assigned_hotel_id;

    if (!homestayId) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel'
      });
    }

    const {
      logo_url,
      company_name,
      tagline,
      invoice_email,
      invoice_phone,
      invoice_website,
      tax_id,
      registration_number,
      primary_color,
      secondary_color,
      accent_color,
      font_family,
      footer_text,
      show_footer_logo,
      show_payment_qr,
      bank_name,
      bank_account_name,
      bank_account_number,
      bank_swift_code,
      mobile_money_number,
      mobile_money_provider,
      payment_terms,
      terms_and_conditions,
      cancellation_policy,
      invoice_template,
      show_line_numbers,
      show_item_codes,
      show_tax_breakdown,
      currency_symbol,
      currency_position,
      date_format,
      language,
      invoice_prefix,
      invoice_number_padding,
      reset_numbering,
      send_email_on_generation,
      cc_email,
      email_subject_template,
      email_body_template
    } = req.body;

    // Find or create settings
    let settings = await InvoiceSettings.findOne({
      where: { homestay_id: homestayId }
    });

    const settingsData = {
      logo_url,
      company_name,
      tagline,
      invoice_email,
      invoice_phone,
      invoice_website,
      tax_id,
      registration_number,
      primary_color,
      secondary_color,
      accent_color,
      font_family,
      footer_text,
      show_footer_logo,
      show_payment_qr,
      bank_name,
      bank_account_name,
      bank_account_number,
      bank_swift_code,
      mobile_money_number,
      mobile_money_provider,
      payment_terms,
      terms_and_conditions,
      cancellation_policy,
      invoice_template,
      show_line_numbers,
      show_item_codes,
      show_tax_breakdown,
      currency_symbol,
      currency_position,
      date_format,
      language,
      invoice_prefix,
      invoice_number_padding,
      reset_numbering,
      send_email_on_generation,
      cc_email,
      email_subject_template,
      email_body_template
    };

    if (settings) {
      // Update existing settings
      await settings.update(settingsData);
    } else {
      // Create new settings
      settings = await InvoiceSettings.create({
        homestay_id: homestayId,
        ...settingsData
      });
    }

    res.json({
      success: true,
      message: 'Invoice settings updated successfully',
      data: settings
    });

  } catch (error) {
    console.error('Error updating invoice settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice settings',
      error: error.message
    });
  }
});


/**
 * GET /api/invoice-settings/preview
 * Get a preview of how the invoice will look with current settings
 */
router.get('/preview', async (req, res) => {
  try {
    const homestayId = req.user.assigned_hotel_id;

    if (!homestayId) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel'
      });
    }

    const settings = await InvoiceSettings.findOne({
      where: { homestay_id: homestayId }
    });

    // Generate sample invoice data
    const previewData = {
      settings: settings || {},
      sample_invoice: {
        invoice_number: `${settings?.invoice_prefix || 'INV'}-202501-0001`,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guest_name: 'Sample Guest',
        room_number: '101',
        items: [
          { description: 'Room Charge - Deluxe Room (2 nights)', quantity: 2, unit_price: 150.00, total: 300.00 },
          { description: 'Breakfast', quantity: 2, unit_price: 25.00, total: 50.00 }
        ],
        subtotal: 350.00,
        tax: 63.00,
        total: 413.00
      }
    };

    res.json({
      success: true,
      data: previewData
    });

  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate preview',
      error: error.message
    });
  }
});

/**
 * POST /api/invoice-settings/upload-logo
 * Upload company logo for invoice branding
 */
router.post('/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    const homestayId = req.user.assigned_hotel_id;

    if (!homestayId) {
      return res.status(403).json({
        success: false,
        message: 'User is not associated with any hotel'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate URL for the uploaded file
    const logoUrl = `/uploads/logos/${req.file.filename}`;

    // Update or create invoice settings with logo URL
    let settings = await InvoiceSettings.findOne({
      where: { homestay_id: homestayId }
    });

    if (settings) {
      // Delete old logo if it exists
      if (settings.logo_url && settings.logo_url.startsWith('/uploads/logos/')) {
        const oldLogoPath = path.join(__dirname, '../../', settings.logo_url);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      
      await settings.update({ logo_url: logoUrl });
    } else {
      settings = await InvoiceSettings.create({
        homestay_id: homestayId,
        logo_url: logoUrl
      });
    }

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logo_url: logoUrl
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message
    });
  }
});

module.exports = router;
