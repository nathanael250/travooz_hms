# Invoice System - Quick Start Guide

## ✅ System Status: COMPLETE

Your invoice generation system is now fully functional!

## What Was Completed

### Backend (API)
✅ Invoice generation from bookings with automatic number generation
✅ PDF invoice generation with professional formatting
✅ Email sending functionality with HTML templates
✅ Payment recording and tracking
✅ Invoice status management
✅ Complete CRUD operations for invoices

### Frontend (UI)
✅ Invoice management page with filters and search
✅ Invoice detail modal with complete information
✅ PDF download functionality
✅ Email sending with custom messages
✅ Payment recording interface
✅ Invoice generation button on bookings page

## Quick Start in 3 Steps

### 1. Configure Email (Optional - for sending invoices)
Edit `/backend/.env` and add:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@travooz.com
```

### 2. Start the System
Backend is already running on port 3001 ✅

### 3. Use the Invoice System

**Generate Invoice:**
1. Go to: **Bookings → Room Bookings**
2. Find booking with status "Checked In", "Checked Out", or "Completed"
3. Click the 📄 invoice icon
4. Invoice is generated automatically

**Manage Invoices:**
1. Go to: **Financial → Invoices**
2. View, filter, search invoices
3. Download PDF with one click
4. Send via email
5. Record payments

## Key Features

### Invoice Generation
- Automatic invoice numbers (INV-202501-0001)
- Includes room charges, restaurant orders, additional charges
- Calculates tax (18% VAT) and discounts automatically
- Prevents duplicate invoices

### PDF Invoices
- Professional formatting
- Company and guest details
- Itemized charges
- Tax and total calculations
- Download with one click: `Download PDF` button

### Email Invoices
- HTML email template
- Custom message support
- Automatic status update to "Sent"
- Guest receives formatted invoice details

### Payment Tracking
- Record partial or full payments
- Multiple payment methods (Cash, Card, Mobile Money, etc.)
- Automatic balance calculation
- Status updates (Paid, Partially Paid)

## API Endpoints Available

```
POST   /api/invoices/generate/:booking_id    - Generate invoice
GET    /api/invoices                         - Get all invoices (with filters)
GET    /api/invoices/:invoice_id             - Get single invoice
GET    /api/invoices/:invoice_id/pdf         - Download PDF
POST   /api/invoices/:invoice_id/send-email  - Send via email
POST   /api/invoices/:invoice_id/payment     - Record payment
PATCH  /api/invoices/:invoice_id/status      - Update status
DELETE /api/invoices/:invoice_id             - Delete (draft only)
```

## Testing

### Test Invoice Generation
1. Open frontend: http://localhost:5173
2. Navigate to **Bookings → Room Bookings**
3. Click invoice icon on any checked-in booking
4. Confirm generation
5. View invoice in **Financial → Invoices**

### Test PDF Download
1. Go to **Financial → Invoices**
2. Click **Download** icon on any invoice
3. PDF opens in new tab

### Test Email (after configuring SMTP)
1. Open invoice detail view
2. Click **Send via Email**
3. Enter recipient email
4. Add optional message
5. Click **Send Email**

### Test Payment Recording
1. Open invoice with balance due
2. Click **Record Payment**
3. Enter amount and payment method
4. Submit

## Files Modified

### Backend Files
- `backend/src/routes/invoice.routes.js` - All invoice endpoints
- `backend/package.json` - Added pdfkit dependency

### Frontend Files
- `frontend/src/pages/financial/Invoices.jsx` - Invoice management UI
- `frontend/src/pages/bookings/RoomBookings.jsx` - Added invoice button

## Troubleshooting

**Backend not starting?**
```bash
cd backend
npm install
npm start
```

**PDF not downloading?**
- Check if pdfkit is installed: `cd backend && npm list pdfkit`
- Check backend logs for errors

**Email not sending?**
- Verify SMTP settings in `.env`
- For Gmail, use App Password (not regular password)
- Check backend logs for detailed errors

## Next Steps

1. ✅ System is ready to use
2. Configure SMTP for email (optional but recommended)
3. Test invoice generation on a real booking
4. Customize invoice template if needed
5. Set up payment terms and tax rates as per requirements

## Documentation

For detailed documentation, see:
- [INVOICE_SYSTEM_GUIDE.md](./INVOICE_SYSTEM_GUIDE.md) - Complete system documentation
- API examples and troubleshooting

---

**Need Help?**
- Check backend logs: `backend/logs/`
- Check browser console for frontend errors
- Review [INVOICE_SYSTEM_GUIDE.md](./INVOICE_SYSTEM_GUIDE.md) for detailed information
