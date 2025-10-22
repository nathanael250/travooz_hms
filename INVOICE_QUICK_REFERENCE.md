# Invoice System - Quick Reference Card

## 🚀 Quick Start

### Generate Invoice (Front Desk)
1. Front Desk → Check-Out Today
2. Click "Check Out" on booking
3. Click "Generate Invoice"
4. Click "Complete Check-Out"

### View Invoices
1. Financial Management → Invoices
2. Use filters to find invoices
3. Click eye icon to view details

### Record Payment
1. Open invoice in modal
2. Click "Record Payment"
3. Enter amount and method
4. Submit

---

## 📋 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/invoices/generate/:booking_id` | Generate invoice |
| GET | `/api/invoices` | List all invoices |
| GET | `/api/invoices/:invoice_id` | Get invoice details |
| PATCH | `/api/invoices/:invoice_id/status` | Update status |
| POST | `/api/invoices/:invoice_id/payment` | Record payment |
| DELETE | `/api/invoices/:invoice_id` | Delete draft invoice |
| GET | `/api/invoices/:invoice_id/pdf` | Download PDF |
| POST | `/api/invoices/:invoice_id/send-email` | Send via email |

---

## 🎨 Invoice Statuses

| Status | Description | Color |
|--------|-------------|-------|
| `draft` | Invoice created, not sent | Gray |
| `sent` | Invoice sent to guest | Blue |
| `paid` | Fully paid | Green |
| `partially_paid` | Partially paid | Yellow |
| `overdue` | Past due date, unpaid | Red |
| `cancelled` | Cancelled invoice | Dark |

---

## 💰 Charge Types Included

1. **Room Charges**
   - Calculated: nights × room rate
   - Format: "Room Charges - [Room Number] ([Room Type])"

2. **Booking Charges**
   - Minibar, Laundry, Phone, Parking, etc.
   - Format: "[Charge Type] - [Description]"

3. **Restaurant Orders**
   - All menu items ordered during stay
   - Format: "[Menu Item Name] x [Quantity]"

---

## 🔢 Invoice Number Format

```
INV-YYYYMM-XXXX

Example: INV-202401-0001
         INV-202401-0002
         INV-202402-0001
```

- Sequential within each month
- Year-Month prefix for organization

---

## 📧 Email Configuration

Add to `/backend/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@travooz.com
FRONTEND_URL=http://localhost:5173
```

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in SMTP_PASS

---

## 🔍 Filter Options

| Filter | Options |
|--------|---------|
| Search | Invoice #, Booking #, Guest name |
| Status | All, Draft, Sent, Paid, Partially Paid, Overdue, Cancelled |
| Homestay | All homestays in system |
| Date Range | From Date, To Date |

---

## 💳 Payment Methods

- Cash
- Credit/Debit Card
- Mobile Money
- Bank Transfer
- Cheque

---

## 📊 Invoice Calculations

```
Subtotal = Sum of all line items
Tax = Subtotal × Tax Rate (default 18%)
Service Charge = Configurable
Discount = Configurable
Total Amount = Subtotal + Tax + Service Charge - Discount
Balance Due = Total Amount - Amount Paid
```

---

## 🛠️ Common Tasks

### Generate Invoice via API
```bash
curl -X POST http://localhost:3001/api/invoices/generate/1 \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"tax_rate": 18, "payment_terms": "Due on receipt"}'
```

### List Invoices with Filters
```bash
curl "http://localhost:3001/api/invoices?status=paid&homestay_id=1" \
  -H "Authorization: Bearer TOKEN"
```

### Record Payment
```bash
curl -X POST http://localhost:3001/api/invoices/1/payment \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 50000, "payment_method": "cash"}'
```

### Download PDF
```
http://localhost:3001/api/invoices/1/pdf
```

### Send Email
```bash
curl -X POST http://localhost:3001/api/invoices/1/send-email \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recipient_email": "guest@email.com", "message": "Thank you"}'
```

---

## 🗄️ Database Queries

### Find Recent Invoices
```sql
SELECT * FROM invoices 
ORDER BY created_at DESC 
LIMIT 10;
```

### Find Unpaid Invoices
```sql
SELECT * FROM invoices 
WHERE balance_due > 0 
  AND status != 'cancelled'
ORDER BY due_date;
```

### Find Overdue Invoices
```sql
SELECT * FROM invoices 
WHERE due_date < CURDATE() 
  AND balance_due > 0
  AND status != 'cancelled';
```

### Invoice with Items
```sql
SELECT i.invoice_number, ii.description, ii.quantity, ii.total_price
FROM invoices i
JOIN invoice_items ii ON i.invoice_id = ii.invoice_id
WHERE i.invoice_id = 1;
```

### Revenue by Month
```sql
SELECT 
  DATE_FORMAT(invoice_date, '%Y-%m') as month,
  COUNT(*) as invoice_count,
  SUM(total_amount) as total_revenue,
  SUM(amount_paid) as total_paid
FROM invoices
WHERE status != 'cancelled'
GROUP BY DATE_FORMAT(invoice_date, '%Y-%m')
ORDER BY month DESC;
```

---

## ⚠️ Important Notes

1. **Only draft invoices can be deleted**
2. **Invoice numbers are unique and sequential**
3. **Payment amount cannot exceed balance due**
4. **Status automatically updates based on payment**
5. **Email requires SMTP configuration**
6. **PDF generation requires PDFKit**
7. **All operations use database transactions**

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Invoice not generating | Check booking exists and has valid data |
| PDF not downloading | Check PDFKit installed, verify route |
| Email not sending | Verify SMTP credentials, check logs |
| Duplicate invoice error | Invoice already exists for booking |
| Payment exceeds balance | Enter amount ≤ balance due |
| Can't delete invoice | Only drafts can be deleted |

---

## 📱 Frontend Routes

| Route | Page |
|-------|------|
| `/financial/invoices` | Invoice list and management |
| `/front-desk` | Front desk operations |

---

## 🎯 User Roles

| Role | Permissions |
|------|------------|
| Front Desk | Generate invoices, record payments |
| Finance | Full invoice management |
| Manager | View all invoices, reports |
| Admin | Full access |

---

## 📈 Key Metrics

Track these metrics:
- Total invoices generated
- Total revenue (sum of total_amount)
- Total collected (sum of amount_paid)
- Outstanding balance (sum of balance_due)
- Average payment time
- Overdue invoice count
- Collection rate (paid / total)

---

## 🔐 Security

- All endpoints require authentication
- JWT token in Authorization header
- Parameterized queries prevent SQL injection
- Transaction-based operations
- Input validation on all endpoints

---

## 📞 Support Contacts

- Technical Issues: Check logs and console
- Database Issues: Review database integrity
- Email Issues: Verify SMTP configuration
- PDF Issues: Check PDFKit installation

---

## 📚 Related Documentation

- `INVOICE_SYSTEM_IMPLEMENTATION.md` - Complete implementation details
- `TEST_INVOICE_SYSTEM.md` - Testing guide
- Backend API docs - Endpoint specifications
- Database schema - Table structures

---

## ✅ Pre-Launch Checklist

- [ ] SMTP credentials configured
- [ ] Test invoice generation
- [ ] Test PDF download
- [ ] Test email sending
- [ ] Test payment recording
- [ ] Verify calculations correct
- [ ] Test all filters
- [ ] Check responsive design
- [ ] Train staff on workflow
- [ ] Set up monitoring

---

**Version:** 1.0  
**Last Updated:** 2024  
**System:** Travooz HMS Invoice Module