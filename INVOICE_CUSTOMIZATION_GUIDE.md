# 🎨 Invoice Customization Guide

## Overview
Your HMS now includes a comprehensive invoice customization system that allows vendors to create professional, branded invoices similar to the tax invoice format you requested.

## ✨ Features Implemented

### 🖼️ **Professional Invoice Layout**
- **Header with Company Branding**: Colored header with company name and logo
- **"ORIGINAL" Badge**: Professional badge indicating original invoice
- **"TAX INVOICE" Title**: Clear, prominent invoice title
- **Company & Client Info Boxes**: Side-by-side colored information sections
- **Professional Items Table**: Clean table with alternating row colors
- **Totals Section**: Clear breakdown of charges and taxes
- **Payment Information**: Bank and mobile money details
- **Terms & Conditions**: Customizable terms section
- **Professional Footer**: "END OF LEGAL RECEIPT" footer

### 🎨 **Customization Options**

#### **Branding Tab**
- **Logo Upload**: Drag & drop or click to upload company logo
- **Logo URL**: Alternative option to use external logo URL
- **Company Name**: Override hotel name on invoices
- **Tagline**: Add company slogan or tagline
- **Color Scheme**: 
  - Primary Color (header background)
  - Secondary Color (company info box)
  - Accent Color (client info box and badges)

#### **Contact Information**
- **Invoice Email**: Dedicated email for invoices
- **Invoice Phone**: Contact number for invoices
- **Website**: Company website URL
- **Tax ID**: Business tax identification number
- **Registration Number**: Business registration details

#### **Payment Details**
- **Bank Information**: Bank name, account name, account number, SWIFT code
- **Mobile Money**: Mobile money number and provider (MTN, Airtel, etc.)

#### **Terms & Conditions**
- **Payment Terms**: Default payment terms (e.g., "Payment due within 30 days")
- **Terms and Conditions**: Custom terms text
- **Cancellation Policy**: Cancellation terms

#### **Template Settings**
- **Invoice Template**: Choose from Modern, Classic, Minimal, Corporate
- **Show Line Numbers**: Toggle line numbers in items table
- **Show Item Codes**: Display item codes if available
- **Show Tax Breakdown**: Detailed tax information

#### **Localization**
- **Currency Symbol**: RWF, USD, EUR, etc.
- **Currency Position**: Before or after amount
- **Date Format**: YYYY-MM-DD, DD/MM/YYYY, etc.
- **Language**: English, French, etc.

## 🚀 How to Use

### **Step 1: Access Invoice Settings**
1. Navigate to **Settings** → **Invoice Settings**
2. You'll see tabs for different customization options

### **Step 2: Upload Your Logo**
1. Go to **Branding** tab
2. Click the upload area or drag & drop your logo
3. Supported formats: PNG, JPG, GIF (max 2MB)
4. Recommended size: 200x100px or similar aspect ratio
5. Preview will show how it looks on invoices

### **Step 3: Configure Company Information**
1. **Branding Tab**: Set company name, tagline, colors
2. **Contact Tab**: Add email, phone, website, tax ID
3. **Payment Tab**: Add bank and mobile money details
4. **Template Tab**: Choose layout and display options

### **Step 4: Customize Appearance**
- **Primary Color**: Used for header background
- **Secondary Color**: Used for company info box
- **Accent Color**: Used for client info box and badges
- **Font Family**: Choose from available fonts

### **Step 5: Set Terms & Conditions**
- Add payment terms
- Include cancellation policy
- Add any special terms

### **Step 6: Save and Test**
1. Click **Save Settings**
2. Click **Preview Invoice** to see how it looks
3. Generate a test invoice to verify everything works

## 📄 **Invoice Layout Structure**

```
┌─────────────────────────────────────────────────────────┐
│  [LOGO]  COMPANY NAME                    [ORIGINAL]     │ ← Header
│           Tagline                                        │
├─────────────────────────────────────────────────────────┤
│                    TAX INVOICE                          │ ← Title
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────┐  ┌─────────────────────────────────┐ │
│ │  COMPANY INFO   │  │         CLIENT INFO             │ │ ← Info Boxes
│ │  Name: ...      │  │  Name: Guest Name               │ │
│ │  Address: ...   │  │  TIN: ...                       │ │
│ │  TIN: ...       │  │  Phone: ...                     │ │
│ │  Date: ...      │  │  Booking: ...                   │ │
│ │  Time: ...      │  │  Room: ...                      │ │
│ └─────────────────┘  └─────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                        ITEMS                            │ ← Items Section
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Description │ Qty │ Price │ Tax │ Total            │ │
│ │ Room Charge │  2  │ 150   │  A  │ 300              │ │
│ │ Breakfast   │  2  │  25   │  A  │  50              │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│                        TOTALS                           │ ← Totals
│ Subtotal: 350.00                                       │
│ Tax: 63.00                                             │
│ TOTAL: 413.00                                          │
│ Total Items: 2                                         │
├─────────────────────────────────────────────────────────┤
│                PAYMENT INFORMATION                      │ ← Payment Info
│ Bank: ...                                              │
│ Account: ...                                           │
│ Mobile Money: ...                                      │
├─────────────────────────────────────────────────────────┤
│                TERMS & CONDITIONS                       │ ← Terms
│ Payment Terms: ...                                     │
│ ...                                                    │
├─────────────────────────────────────────────────────────┤
│              === END OF LEGAL RECEIPT ===               │ ← Footer
│         Computer-generated. No signature required.      │
└─────────────────────────────────────────────────────────┘
```

## 🎯 **Printing Invoices**

### **From Guest Folio**
1. Select a guest
2. Click **Print** button
3. System will generate PDF with your custom settings
4. PDF opens in new tab for printing

### **From Front Desk**
1. Go to checkout section
2. Click **Print Invoice** button
3. Professional PDF generated instantly

### **From Room Bookings**
1. Find the booking
2. Click **Print Invoice** icon
3. PDF opens for printing

## 🔧 **Technical Details**

### **File Storage**
- Logos stored in `/backend/uploads/logos/`
- Automatic cleanup of old logos when new ones uploaded
- Static file serving configured for logo access

### **PDF Generation**
- Uses PDFKit for professional PDF generation
- Supports embedded images (logos)
- Responsive layout with proper spacing
- Professional typography and colors

### **Database**
- Settings stored in `invoice_settings` table
- Linked to homestay/hotel for multi-vendor support
- All settings are optional with sensible defaults

## 🎨 **Color Recommendations**

### **Professional Blue Theme**
- Primary: `#2563EB` (Blue)
- Secondary: `#1E40AF` (Dark Blue)
- Accent: `#3B82F6` (Light Blue)

### **Corporate Green Theme**
- Primary: `#059669` (Green)
- Secondary: `#047857` (Dark Green)
- Accent: `#10B981` (Light Green)

### **Elegant Purple Theme**
- Primary: `#7C3AED` (Purple)
- Secondary: `#6D28D9` (Dark Purple)
- Accent: `#8B5CF6` (Light Purple)

## ✅ **Testing Checklist**

- [ ] Logo uploads correctly
- [ ] Logo appears on generated invoices
- [ ] Colors are applied correctly
- [ ] Company information displays properly
- [ ] Payment information shows up
- [ ] Terms and conditions are included
- [ ] PDF generation works from all locations
- [ ] Print functionality works correctly
- [ ] Invoice layout matches expectations

## 🆘 **Troubleshooting**

### **Logo Not Showing**
- Check file format (PNG, JPG, GIF only)
- Ensure file size is under 2MB
- Verify logo URL is correct
- Check browser console for errors

### **Colors Not Applied**
- Ensure color codes are valid hex values (e.g., #2563EB)
- Save settings after making changes
- Clear browser cache if needed

### **PDF Generation Issues**
- Check if invoice exists for the booking
- Verify user has proper permissions
- Check backend logs for errors

## 🎉 **Result**

You now have a professional invoice system that:
- ✅ Matches the tax invoice format you requested
- ✅ Includes company branding and logos
- ✅ Has customizable colors and layout
- ✅ Supports multiple payment methods
- ✅ Generates professional PDFs
- ✅ Works across all front desk operations
- ✅ Maintains brand consistency

Your invoices will now look professional and match your company branding, just like the tax invoice example you provided!
