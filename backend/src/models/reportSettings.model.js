const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const ReportSettings = sequelize.define('ReportSettings', {
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
      key: 'homestay_id'
    }
  },
  
  // Page Layout
  default_page_orientation: {
    type: DataTypes.ENUM('portrait', 'landscape'),
    defaultValue: 'portrait'
  },
  default_page_size: {
    type: DataTypes.ENUM('A4', 'A3', 'Letter', 'Legal', 'Tabloid'),
    defaultValue: 'A4'
  },
  page_margins: {
    type: DataTypes.ENUM('narrow', 'normal', 'wide', 'custom'),
    defaultValue: 'normal'
  },
  custom_margin_top: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  custom_margin_bottom: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  custom_margin_left: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },
  custom_margin_right: {
    type: DataTypes.INTEGER,
    defaultValue: 20
  },

  // Header Configuration
  show_header: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  header_height: {
    type: DataTypes.INTEGER,
    defaultValue: 80
  },
  header_logo_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  header_logo_position: {
    type: DataTypes.ENUM('left', 'center', 'right'),
    defaultValue: 'left'
  },
  header_logo_size: {
    type: DataTypes.ENUM('small', 'medium', 'large'),
    defaultValue: 'medium'
  },
  header_company_info: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  header_company_name: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  header_company_address: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  header_company_contact: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  // Footer Configuration
  show_footer: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  footer_height: {
    type: DataTypes.INTEGER,
    defaultValue: 60
  },
  footer_content: {
    type: DataTypes.ENUM('page_number', 'company_info', 'custom', 'none'),
    defaultValue: 'page_number'
  },
  footer_custom_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  footer_show_date: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  footer_show_time: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // Report Styling
  report_font_family: {
    type: DataTypes.STRING(50),
    defaultValue: 'Arial'
  },
  report_font_size: {
    type: DataTypes.INTEGER,
    defaultValue: 12
  },
  report_line_height: {
    type: DataTypes.DECIMAL(3, 1),
    defaultValue: 1.4
  },
  report_color_scheme: {
    type: DataTypes.ENUM('default', 'blue', 'green', 'red', 'custom'),
    defaultValue: 'default'
  },
  report_primary_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#2563EB'
  },
  report_secondary_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#1E40AF'
  },
  report_accent_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#3B82F6'
  },

  // Table Configuration
  table_border_style: {
    type: DataTypes.ENUM('solid', 'dashed', 'dotted', 'none'),
    defaultValue: 'solid'
  },
  table_border_width: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  table_border_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#000000'
  },
  table_header_background: {
    type: DataTypes.STRING(7),
    defaultValue: '#F5F5F5'
  },
  table_header_text_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#000000'
  },
  table_alternate_row_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#FAFAFA'
  },
  table_cell_padding: {
    type: DataTypes.INTEGER,
    defaultValue: 8
  },

  // Print Configuration
  print_background_colors: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  print_images: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  print_page_numbers: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  print_date_time: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  print_footer_url: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // Report Types Specific Settings
  purchase_order_template: {
    type: DataTypes.ENUM('standard', 'detailed', 'minimal'),
    defaultValue: 'standard'
  },
  stock_report_template: {
    type: DataTypes.ENUM('summary', 'detailed', 'comprehensive'),
    defaultValue: 'detailed'
  },
  financial_report_template: {
    type: DataTypes.ENUM('simple', 'professional', 'detailed'),
    defaultValue: 'professional'
  },
  maintenance_report_template: {
    type: DataTypes.ENUM('standard', 'detailed', 'checklist'),
    defaultValue: 'standard'
  },

  // Auto-generation
  auto_generate_page_numbers: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  auto_generate_report_date: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  auto_generate_report_time: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  include_generated_by: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  include_generation_timestamp: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'report_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = ReportSettings;
