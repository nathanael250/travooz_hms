const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/database');

const InvoiceSettings = sequelize.define('InvoiceSettings', {
  setting_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  homestay_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'homestays',
      key: 'homestay_id'
    }
  },

  // Logo and Branding
  logo_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  company_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  tagline: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  // Contact Information
  invoice_email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  invoice_phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  invoice_website: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  tax_id: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  registration_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },

  // Invoice Appearance
  primary_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#2563EB'
  },
  secondary_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#1E40AF'
  },
  accent_color: {
    type: DataTypes.STRING(7),
    defaultValue: '#3B82F6'
  },
  font_family: {
    type: DataTypes.STRING(50),
    defaultValue: 'Inter'
  },

  // Invoice Footer
  footer_text: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  show_footer_logo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  show_payment_qr: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  // Payment Information
  bank_name: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  bank_account_name: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  bank_account_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  bank_swift_code: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  mobile_money_number: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  mobile_money_provider: {
    type: DataTypes.STRING(50),
    allowNull: true
  },

  // Terms and Conditions
  payment_terms: {
    type: DataTypes.STRING(500),
    defaultValue: 'Payment due within 30 days'
  },
  terms_and_conditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancellation_policy: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Template Settings
  invoice_template: {
    type: DataTypes.ENUM('modern', 'classic', 'minimal', 'corporate'),
    defaultValue: 'modern'
  },
  show_line_numbers: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  show_item_codes: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  show_tax_breakdown: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },

  // Localization
  currency_symbol: {
    type: DataTypes.STRING(10),
    defaultValue: 'RWF'
  },
  currency_position: {
    type: DataTypes.ENUM('before', 'after'),
    defaultValue: 'before'
  },
  date_format: {
    type: DataTypes.STRING(20),
    defaultValue: 'YYYY-MM-DD'
  },
  language: {
    type: DataTypes.STRING(10),
    defaultValue: 'en'
  },

  // Auto-numbering
  invoice_prefix: {
    type: DataTypes.STRING(10),
    defaultValue: 'INV'
  },
  invoice_number_padding: {
    type: DataTypes.INTEGER,
    defaultValue: 4
  },
  reset_numbering: {
    type: DataTypes.ENUM('never', 'monthly', 'yearly'),
    defaultValue: 'yearly'
  },

  // Notifications
  send_email_on_generation: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  cc_email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  email_subject_template: {
    type: DataTypes.STRING(200),
    defaultValue: 'Invoice {invoice_number} from {company_name}'
  },
  email_body_template: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  // Metadata
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'invoice_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = InvoiceSettings;
