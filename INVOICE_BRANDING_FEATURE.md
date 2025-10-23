# Invoice Branding & Customization Feature

## Overview
This feature allows each hotel/vendor to fully customize their invoice appearance with logos, colors, payment information, and branding elements.

---

## Features

### 🎨 **Visual Branding**
- Custom company logo
- Brand colors (primary, secondary, accent)
- Font family selection
- Invoice template styles (modern, classic, minimal, corporate)

### 📋 **Company Information**
- Override company name
- Custom tagline/slogan
- Tax ID / VAT number
- Business registration number

### 💳 **Payment Information**
- Bank account details (name, number, SWIFT code)
- Mobile money (MTN, Airtel, etc.)
- Payment QR codes
- Custom payment terms

### 📄 **Invoice Customization**
- Custom footer text
- Terms and conditions
- Cancellation policy
- Line item display options
- Tax breakdown visibility

### 🔢 **Auto-numbering**
- Custom invoice prefix
- Number padding
- Reset frequency (never, monthly, yearly)

### 🌍 **Localization**
- Currency symbol and position
- Date format
- Language support

### 📧 **Email Notifications**
- Auto-send on generation
- CC recipients
- Custom email templates

---

## Database Schema

### Table: `invoice_settings`

```sql
CREATE TABLE invoice_settings (
  setting_id INT PRIMARY KEY AUTO_INCREMENT,
  homestay_id INT UNIQUE NOT NULL,

  -- Branding
  logo_url VARCHAR(500),
  company_name VARCHAR(200),
  tagline VARCHAR(255),
  primary_color VARCHAR(7) DEFAULT '#2563EB',
  secondary_color VARCHAR(7) DEFAULT '#1E40AF',
  accent_color VARCHAR(7) DEFAULT '#3B82F6',
  font_family VARCHAR(50) DEFAULT 'Inter',

  -- Contact
  invoice_email VARCHAR(100),
  invoice_phone VARCHAR(50),
  invoice_website VARCHAR(200),
  tax_id VARCHAR(50),
  registration_number VARCHAR(50),

  -- Payment
  bank_name VARCHAR(100),
  bank_account_number VARCHAR(50),
  mobile_money_number VARCHAR(50),

  -- Template
  invoice_template ENUM('modern', 'classic', 'minimal', 'corporate'),
  payment_terms VARCHAR(500),

  -- Localization
  currency_symbol VARCHAR(10) DEFAULT 'RWF',
  date_format VARCHAR(20) DEFAULT 'YYYY-MM-DD',

  FOREIGN KEY (homestay_id) REFERENCES homestays(homestay_id)
);
```

---

## API Endpoints

### **GET** `/api/invoice-settings`
Get invoice settings for the authenticated user's hotel.

**Response:**
```json
{
  "success": true,
  "data": {
    "setting_id": 1,
    "homestay_id": 1,
    "logo_url": "https://example.com/logo.png",
    "company_name": "Grand Hotel Rwanda",
    "tagline": "Luxury & Comfort",
    "primary_color": "#2563EB",
    "invoice_template": "modern",
    "currency_symbol": "RWF",
    ...
  }
}
```

---

### **PUT** `/api/invoice-settings`
Update invoice settings.

**Request Body:**
```json
{
  "logo_url": "https://example.com/logo.png",
  "company_name": "Grand Hotel Rwanda",
  "primary_color": "#2563EB",
  "secondary_color": "#1E40AF",
  "bank_account_number": "1234567890",
  "payment_terms": "Payment due within 30 days"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice settings updated successfully",
  "data": { ... }
}
```

---

### **POST** `/api/invoice-settings/upload-logo`
Upload or set invoice logo URL.

**Request Body:**
```json
{
  "logo_url": "https://example.com/new-logo.png"
}
```

---

### **GET** `/api/invoice-settings/preview`
Get a preview of how invoices will look with current settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "settings": { ... },
    "sample_invoice": {
      "invoice_number": "INV-202501-0001",
      "items": [...],
      "total": 413.00
    }
  }
}
```

---

## How Invoices Use Branding

When an invoice is generated via `/api/receptionist/invoices/generate/:booking_id`, the response now includes:

```json
{
  "success": true,
  "data": {
    "invoice_id": 1,
    "invoice_number": "INV-202501-0001",
    "items": [...],
    "branding": {
      "logo_url": "https://example.com/logo.png",
      "company_name": "Grand Hotel Rwanda",
      "primary_color": "#2563EB",
      "payment_terms": "Payment due within 30 days",
      ...
    }
  }
}
```

The frontend can use this branding data to:
- Display the logo
- Apply brand colors
- Show payment information
- Format according to template style

---

## Frontend Integration

### Example: Using Branding in Invoice Display

```javascript
const InvoiceDisplay = ({ invoice }) => {
  const branding = invoice.branding || {};

  return (
    <div style={{ color: branding.primary_color }}>
      {/* Logo */}
      {branding.logo_url && (
        <img src={branding.logo_url} alt="Company Logo" />
      )}

      {/* Company Name */}
      <h1>{branding.company_name || invoice.homestay_name}</h1>

      {/* Tagline */}
      {branding.tagline && <p>{branding.tagline}</p>}

      {/* Invoice Details */}
      <div>Invoice: {invoice.invoice_number}</div>

      {/* Payment Terms */}
      <div>{branding.payment_terms}</div>

      {/* Bank Details */}
      {branding.bank_account_number && (
        <div>
          <h3>Payment Information</h3>
          <p>Bank: {branding.bank_name}</p>
          <p>Account: {branding.bank_account_number}</p>
        </div>
      )}
    </div>
  );
};
```

---

## Migration

To add this feature to an existing system:

1. **Run the migration:**
```bash
mysql -u admin -padmin -D travooz_hms < backend/migrations/create_invoice_settings_table.sql
```

2. **Restart the backend server** to load the new routes

3. **Default settings** are created automatically when first accessed

---

## Template Styles

### **Modern** (Default)
- Clean, minimalist design
- Bold typography
- Accent colors for highlights
- Professional footer

### **Classic**
- Traditional invoice layout
- Serif fonts
- Conservative colors
- Formal appearance

### **Minimal**
- Ultra-simple design
- Monochrome palette
- Maximum whitespace
- Essential information only

### **Corporate**
- Professional business style
- Multiple color sections
- Detailed breakdown
- Corporate branding emphasis

---

## Best Practices

### Logo
- **Format:** PNG with transparent background recommended
- **Size:** 300x100px optimal
- **URL:** Use CDN or cloud storage for better performance

### Colors
- Use hex codes (e.g., `#2563EB`)
- Ensure good contrast for readability
- Stick to brand guidelines

### Payment Terms
- Be clear and specific
- Include grace periods
- Mention accepted payment methods

### Email Templates
- Use placeholders: `{invoice_number}`, `{company_name}`, `{guest_name}`
- Keep subject line professional
- Include payment instructions

---

## Security Considerations

- ✅ Multi-vendor isolation enforced via `hotelAccessMiddleware`
- ✅ Each hotel can only access/modify their own settings
- ✅ File upload URLs should be validated
- ✅ XSS protection for custom text fields

---

## Future Enhancements

- [ ] Multiple invoice templates with live preview
- [ ] Logo file upload (currently URL-based)
- [ ] QR code generation for payments
- [ ] Multi-language invoice support
- [ ] PDF generation with custom branding
- [ ] Invoice email automation
- [ ] Color picker UI component
- [ ] Font preview selector

---

## Testing

### Test Invoice Settings CRUD

```bash
# Get settings (creates default if none exist)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/invoice-settings

# Update settings
curl -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "My Hotel",
    "primary_color": "#FF5733",
    "logo_url": "https://example.com/logo.png"
  }' \
  http://localhost:3001/api/invoice-settings

# Get preview
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/invoice-settings/preview
```

---

## Summary

This invoice branding feature provides complete customization control to vendors, allowing them to:
- **Maintain brand identity** across all customer touchpoints
- **Professionalize** their invoicing with logos and custom styling
- **Streamline payments** with included bank/mobile money details
- **Localize** invoices for their market
- **Automate** invoice generation with their preferred settings

All settings are automatically included when invoices are generated, requiring no additional frontend configuration!
