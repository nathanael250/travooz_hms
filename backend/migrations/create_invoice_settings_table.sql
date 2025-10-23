-- Invoice Settings Table for Custom Branding
-- Allows each homestay/hotel to customize their invoice appearance

CREATE TABLE IF NOT EXISTS `invoice_settings` (
  `setting_id` INT AUTO_INCREMENT PRIMARY KEY,
  `homestay_id` INT NOT NULL UNIQUE,

  -- Logo and Branding
  `logo_url` VARCHAR(500) DEFAULT NULL COMMENT 'URL or path to company logo',
  `company_name` VARCHAR(200) DEFAULT NULL COMMENT 'Override hotel name on invoice',
  `tagline` VARCHAR(255) DEFAULT NULL COMMENT 'Company tagline or slogan',

  -- Contact Information (can override hotel defaults)
  `invoice_email` VARCHAR(100) DEFAULT NULL,
  `invoice_phone` VARCHAR(50) DEFAULT NULL,
  `invoice_website` VARCHAR(200) DEFAULT NULL,
  `tax_id` VARCHAR(50) DEFAULT NULL COMMENT 'Tax ID or VAT number',
  `registration_number` VARCHAR(50) DEFAULT NULL COMMENT 'Business registration number',

  -- Invoice Appearance
  `primary_color` VARCHAR(7) DEFAULT '#2563EB' COMMENT 'Primary brand color (hex)',
  `secondary_color` VARCHAR(7) DEFAULT '#1E40AF' COMMENT 'Secondary brand color (hex)',
  `accent_color` VARCHAR(7) DEFAULT '#3B82F6' COMMENT 'Accent color for highlights (hex)',
  `font_family` VARCHAR(50) DEFAULT 'Inter' COMMENT 'Font family for invoice',

  -- Invoice Footer
  `footer_text` TEXT DEFAULT NULL COMMENT 'Custom footer text',
  `show_footer_logo` BOOLEAN DEFAULT TRUE COMMENT 'Show logo in footer',
  `show_payment_qr` BOOLEAN DEFAULT FALSE COMMENT 'Show QR code for payments',

  -- Payment Information
  `bank_name` VARCHAR(100) DEFAULT NULL,
  `bank_account_name` VARCHAR(200) DEFAULT NULL,
  `bank_account_number` VARCHAR(50) DEFAULT NULL,
  `bank_swift_code` VARCHAR(20) DEFAULT NULL,
  `mobile_money_number` VARCHAR(50) DEFAULT NULL,
  `mobile_money_provider` VARCHAR(50) DEFAULT NULL COMMENT 'e.g., MTN, Airtel',

  -- Terms and Conditions
  `payment_terms` VARCHAR(500) DEFAULT 'Payment due within 30 days' COMMENT 'Default payment terms',
  `terms_and_conditions` TEXT DEFAULT NULL COMMENT 'Invoice terms and conditions',
  `cancellation_policy` TEXT DEFAULT NULL,

  -- Template Settings
  `invoice_template` ENUM('modern', 'classic', 'minimal', 'corporate') DEFAULT 'modern',
  `show_line_numbers` BOOLEAN DEFAULT TRUE,
  `show_item_codes` BOOLEAN DEFAULT FALSE,
  `show_tax_breakdown` BOOLEAN DEFAULT TRUE,

  -- Localization
  `currency_symbol` VARCHAR(10) DEFAULT 'RWF',
  `currency_position` ENUM('before', 'after') DEFAULT 'before',
  `date_format` VARCHAR(20) DEFAULT 'YYYY-MM-DD',
  `language` VARCHAR(10) DEFAULT 'en',

  -- Auto-numbering
  `invoice_prefix` VARCHAR(10) DEFAULT 'INV',
  `invoice_number_padding` INT DEFAULT 4 COMMENT 'Number of digits in invoice number',
  `reset_numbering` ENUM('never', 'monthly', 'yearly') DEFAULT 'yearly',

  -- Notifications
  `send_email_on_generation` BOOLEAN DEFAULT TRUE,
  `cc_email` VARCHAR(255) DEFAULT NULL COMMENT 'CC email addresses (comma-separated)',
  `email_subject_template` VARCHAR(200) DEFAULT 'Invoice {invoice_number} from {company_name}',
  `email_body_template` TEXT DEFAULT NULL,

  -- Metadata
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (`homestay_id`) REFERENCES `homestays`(`homestay_id`) ON DELETE CASCADE,

  INDEX `idx_homestay` (`homestay_id`),
  INDEX `idx_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Custom invoice branding and settings for each hotel/homestay';
