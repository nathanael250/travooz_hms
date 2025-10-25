const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ReportSettings = require('../models/reportSettings.model');
const authMiddleware = require('../middlewares/auth.middleware');
const hotelAccessMiddleware = require('../middlewares/hotelAccess.middleware');

// Configure multer for logo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check if file is an image
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
 * GET /api/report-settings
 * Get report settings for the user's hotel
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

    let settings = await ReportSettings.findOne({
      where: { homestay_id: homestayId }
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await ReportSettings.create({
        homestay_id: homestayId
      });
    }

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error fetching report settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report settings',
      error: error.message
    });
  }
});

/**
 * PUT /api/report-settings
 * Update report settings for the user's hotel
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
      // Page Layout
      default_page_orientation,
      default_page_size,
      page_margins,
      custom_margin_top,
      custom_margin_bottom,
      custom_margin_left,
      custom_margin_right,

      // Header Configuration
      show_header,
      header_height,
      header_logo_position,
      header_logo_size,
      header_company_info,
      header_company_name,
      header_company_address,
      header_company_contact,

      // Footer Configuration
      show_footer,
      footer_height,
      footer_content,
      footer_custom_text,
      footer_show_date,
      footer_show_time,

      // Report Styling
      report_font_family,
      report_font_size,
      report_line_height,
      report_color_scheme,
      report_primary_color,
      report_secondary_color,
      report_accent_color,

      // Table Configuration
      table_border_style,
      table_border_width,
      table_border_color,
      table_header_background,
      table_header_text_color,
      table_alternate_row_color,
      table_cell_padding,

      // Print Configuration
      print_background_colors,
      print_images,
      print_page_numbers,
      print_date_time,
      print_footer_url,

      // Report Types Specific Settings
      purchase_order_template,
      stock_report_template,
      financial_report_template,
      maintenance_report_template,

      // Auto-generation
      auto_generate_page_numbers,
      auto_generate_report_date,
      auto_generate_report_time,
      include_generated_by,
      include_generation_timestamp
    } = req.body;

    // Find or create settings
    let settings = await ReportSettings.findOne({
      where: { homestay_id: homestayId }
    });

    const settingsData = {
      // Page Layout
      default_page_orientation,
      default_page_size,
      page_margins,
      custom_margin_top,
      custom_margin_bottom,
      custom_margin_left,
      custom_margin_right,

      // Header Configuration
      show_header,
      header_height,
      header_logo_position,
      header_logo_size,
      header_company_info,
      header_company_name,
      header_company_address,
      header_company_contact,

      // Footer Configuration
      show_footer,
      footer_height,
      footer_content,
      footer_custom_text,
      footer_show_date,
      footer_show_time,

      // Report Styling
      report_font_family,
      report_font_size,
      report_line_height,
      report_color_scheme,
      report_primary_color,
      report_secondary_color,
      report_accent_color,

      // Table Configuration
      table_border_style,
      table_border_width,
      table_border_color,
      table_header_background,
      table_header_text_color,
      table_alternate_row_color,
      table_cell_padding,

      // Print Configuration
      print_background_colors,
      print_images,
      print_page_numbers,
      print_date_time,
      print_footer_url,

      // Report Types Specific Settings
      purchase_order_template,
      stock_report_template,
      financial_report_template,
      maintenance_report_template,

      // Auto-generation
      auto_generate_page_numbers,
      auto_generate_report_date,
      auto_generate_report_time,
      include_generated_by,
      include_generation_timestamp
    };

    // Remove undefined values
    Object.keys(settingsData).forEach(key => {
      if (settingsData[key] === undefined) {
        delete settingsData[key];
      }
    });

    if (settings) {
      // Update existing settings
      await settings.update(settingsData);
    } else {
      // Create new settings
      settings = await ReportSettings.create({
        homestay_id: homestayId,
        ...settingsData
      });
    }

    res.json({
      success: true,
      message: 'Report settings updated successfully',
      data: settings
    });

  } catch (error) {
    console.error('Error updating report settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update report settings',
      error: error.message
    });
  }
});

/**
 * POST /api/report-settings/upload-logo
 * Upload a logo for the hotel's reports
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
        message: 'No logo file provided'
      });
    }

    // Generate the URL path for the uploaded logo
    const logoUrl = `/uploads/logos/${req.file.filename}`;

    // Find or create settings
    let settings = await ReportSettings.findOne({
      where: { homestay_id: homestayId }
    });

    if (settings) {
      // If there's an existing logo, delete the old file
      if (settings.header_logo_url) {
        const oldLogoPath = path.join(__dirname, '../../uploads/logos', path.basename(settings.header_logo_url));
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }
      
      // Update the logo URL
      await settings.update({ header_logo_url: logoUrl });
    } else {
      // Create new settings with logo
      settings = await ReportSettings.create({
        homestay_id: homestayId,
        header_logo_url: logoUrl
      });
    }

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logo_url: logoUrl,
      data: settings
    });

  } catch (error) {
    console.error('Error uploading logo:', error);
    
    // If there was a file upload error, clean up the uploaded file
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload logo',
      error: error.message
    });
  }
});

/**
 * GET /api/report-settings/preview
 * Get a preview of how reports will look with current settings
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

    let settings = await ReportSettings.findOne({
      where: { homestay_id: homestayId }
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await ReportSettings.create({
        homestay_id: homestayId
      });
    }

    // Generate sample preview data
    const previewData = {
      settings: settings,
      sample_report: {
        title: 'Sample Purchase Order',
        report_number: 'PO-2025-001',
        date: new Date().toISOString().split('T')[0],
        items: [
          {
            name: 'Sample Item 1',
            quantity: 100,
            unit_price: 1000,
            total: 100000
          },
          {
            name: 'Sample Item 2',
            quantity: 50,
            unit_price: 2000,
            total: 100000
          }
        ],
        total: 200000
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

module.exports = router;
