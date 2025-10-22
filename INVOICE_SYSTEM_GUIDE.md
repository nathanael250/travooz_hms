# Invoice Generation System - Complete Guide

## Overview
The invoice generation system allows you to create, manage, send, and track invoices for bookings. It includes PDF generation, email sending, payment tracking, and comprehensive invoice management.

## Features Completed ✅

### 1. Invoice Generation
- **Automatic invoice number generation** (format: INV-YYYYMM-####)
- **Generate from bookings** - Create invoices for checked-in, checked-out, or completed bookings
- **Include all charges**:
  - Room charges (based on nights stayed)
  - Additional booking charges (minibar, laundry, etc.)
  - Restaurant orders associated with the booking
- **Tax and discount calculation** (18% VAT default, customizable)
- **Service charge support**
- **Prevents duplicate invoices** for the same booking

### 2. PDF Generation
- **Professional PDF invoices** with company branding
- **Detailed line items** with descriptions, quantities, and prices
- **Complete billing information**:
  - Homestay details
  - Guest information
  - Booking reference and dates
  - Room information
- **Summary section** with subtotal, tax, discounts, and total
- **Download directly** from the frontend

### 3. Email Functionality
- **Send invoices via email** to guests
- **Professional HTML email template**
- **Custom message support** - Add personalized notes
- **Automatic status update** to "sent" when emailed
- **Configurable SMTP settings**

### 4. Payment Management
- **Record payments** against invoices
- **Multiple payment methods**:
  - Cash
  - Credit/Debit Card
  - Mobile Money
  - Bank Transfer
  - Cheque
- **Automatic balance calculation**
- **Status updates**:
  - Draft
  - Sent
  - Paid
  - Partially Paid
  - Overdue
  - Cancelled

### 5. Invoice Management Interface
- **Filter invoices** by status, homestay, date range, search
- **View detailed invoice** with all line items
- **Track payment status** and balance due
- **Generate from bookings page** with single click
- **Download PDF** directly from table or detail view
- **Send via email** with custom message

## Backend Endpoints

### Generate Invoice
```
POST /api/invoices/generate/:booking_id
```
**Body:**
```json
{
  "tax_rate": 18,
  "service_charge_rate": 0,
  "discount_amount": 0,
  "payment_terms": "Due on receipt",
  "notes": "Thank you for your business",
  "generated_by": 1
}
```

### Get All Invoices
```
GET /api/invoices?status=paid&homestay_id=1&from_date=2024-01-01&to_date=2024-12-31&search=INV
```

### Get Single Invoice
```
GET /api/invoices/:invoice_id
```

### Download PDF
```
GET /api/invoices/:invoice_id/pdf
```
Returns PDF file for download

### Send Email
```
POST /api/invoices/:invoice_id/send-email
```
**Body:**
```json
{
  "recipient_email": "guest@email.com",
  "message": "Thank you for staying with us!"
}
```

### Update Status
```
PATCH /api/invoices/:invoice_id/status
```
**Body:**
```json
{
  "status": "sent"
}
```

### Record Payment
```
POST /api/invoices/:invoice_id/payment
```
**Body:**
```json
{
  "amount": 50000,
  "payment_method": "cash",
  "payment_reference": "TXN123456",
  "notes": "Full payment received"
}
```

### Delete Invoice
```
DELETE /api/invoices/:invoice_id
```
Note: Only draft invoices can be deleted

## Email Configuration

To enable email sending, add these environment variables to your `.env` file:

```env
# SMTP Configuration for sending invoices
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@travooz.com
FRONTEND_URL=http://localhost:5173
```

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App Passwords
   - Create a new app password for "Mail"
   - Use this password in SMTP_PASS

### Other Email Providers
- **Outlook/Office365**: `smtp.office365.com:587`
- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`

## Usage Guide

### From Bookings Page

1. Navigate to **Bookings → Room Bookings**
2. Find a booking with status "Checked In", "Checked Out", or "Completed"
3. Click the **invoice icon** (📄) in the Actions column
4. Confirm invoice generation
5. Invoice will be created and you'll be redirected to view it

### From Invoices Page

1. Navigate to **Financial → Invoices**
2. Use filters to find specific invoices:
   - Search by invoice number, booking reference, or guest name
   - Filter by status (Draft, Sent, Paid, etc.)
   - Filter by homestay
   - Filter by date range
3. Click **View** (👁️) to see invoice details
4. Click **Download** (⬇️) to get PDF
5. Click **Send** (✉️) to email invoice (draft invoices only)

### View Invoice Details

1. Click view icon on any invoice
2. See complete invoice with:
   - Company and guest information
   - Booking details
   - Itemized charges
   - Tax and totals
   - Payment history
3. Available actions:
   - **Download PDF** - Get printable invoice
   - **Send via Email** - Email to guest with custom message
   - **Record Payment** - Add payment received

### Record Payment

1. Open invoice detail view
2. Click **Record Payment** button
3. Enter:
   - Amount (cannot exceed balance due)
   - Payment method
   - Reference number (optional)
4. Submit to update invoice
5. Status will automatically update:
   - Fully paid → "Paid"
   - Partially paid → "Partially Paid"

### Send Invoice via Email

1. Open invoice detail view
2. Click **Send via Email** button
3. Verify/edit recipient email
4. Add custom message (optional)
5. Click **Send Email**
6. Invoice status will update to "Sent"
7. Guest receives professional HTML email with invoice details

## Database Tables

### invoices
```sql
- invoice_id (PK)
- booking_id (FK)
- invoice_number (UNIQUE)
- invoice_date
- due_date
- subtotal
- tax_amount
- service_charge
- discount_amount
- total_amount
- amount_paid
- balance_due
- status (draft/sent/paid/partially_paid/overdue/cancelled)
- payment_terms
- notes
- generated_by (staff user_id)
- sent_at
- paid_at
- created_at
- updated_at
```

### invoice_items
```sql
- item_id (PK)
- invoice_id (FK)
- description
- quantity
- unit_price
- total_price
- tax_amount
```

## Testing the System

### 1. Generate Test Invoice
```bash
# Find a booking with status 'checked_in' or 'completed'
# Use the booking page to generate invoice
# Or use API:
curl -X POST http://localhost:3001/api/invoices/generate/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"generated_by": 1}'
```

### 2. Test PDF Generation
```bash
# Get invoice PDF
curl -X GET http://localhost:3001/api/invoices/1/pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  --output invoice.pdf
```

### 3. Test Email Sending
```bash
# Configure SMTP first in .env
# Then send email
curl -X POST http://localhost:3001/api/invoices/1/send-email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_email": "test@email.com",
    "message": "Thank you for your stay!"
  }'
```

### 4. Test Payment Recording
```bash
curl -X POST http://localhost:3001/api/invoices/1/payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "payment_method": "cash",
    "payment_reference": "CASH001"
  }'
```

## Troubleshooting

### PDF Not Generating
- Check if `pdfkit` is installed: `npm list pdfkit`
- Check backend logs for errors
- Ensure invoice data exists in database

### Email Not Sending
- Verify SMTP credentials in `.env`
- Check if SMTP port is not blocked by firewall
- Test SMTP connection with a simple script
- Check backend logs for detailed error messages
- For Gmail: Ensure app password is used, not regular password

### Invoice Already Exists Error
- Each booking can only have one invoice
- System prevents duplicate invoice generation
- Use "View" to access existing invoice

### Can't Delete Invoice
- Only draft invoices can be deleted
- Sent or paid invoices cannot be deleted for audit purposes

## Future Enhancements (Optional)

- [ ] Add invoice templates customization
- [ ] Support for multiple currencies
- [ ] Recurring invoices for long-term stays
- [ ] Invoice analytics and reports
- [ ] Batch invoice generation
- [ ] Invoice reminders for overdue payments
- [ ] Integration with accounting software
- [ ] Multi-language invoice support

## Files Modified/Created

### Backend
- `/backend/src/routes/invoice.routes.js` - Complete invoice API endpoints
- `/backend/config/travooz_hms.sql` - Invoice tables (invoices, invoice_items)

### Frontend
- `/frontend/src/pages/financial/Invoices.jsx` - Invoice management UI
- `/frontend/src/pages/bookings/RoomBookings.jsx` - Added invoice generation button
- `/frontend/src/styles/Financial.css` - Invoice styling

### Dependencies Added
- `pdfkit` - PDF generation library

## Support

For issues or questions:
1. Check backend logs: `/backend/logs/`
2. Check browser console for frontend errors
3. Verify all environment variables are set
4. Ensure database tables exist and are properly configured
5. Test API endpoints with Postman

---

**System Status:** ✅ COMPLETE AND READY FOR USE

The invoice generation system is fully functional and includes all essential features for managing hotel invoices, from generation through payment tracking.
