# Invoice System Testing Guide

## Prerequisites
- Backend server running on http://localhost:3001
- Frontend server running on http://localhost:5173
- At least one booking in the database
- User logged in to the system

---

## Test 1: Access Invoice Page

### Steps:
1. Open browser and navigate to http://localhost:5173
2. Log in with your credentials
3. Click on "Financial Management" in the sidebar
4. Click on "Invoices" submenu

### Expected Result:
- Invoice list page loads successfully
- Filter options are visible (Search, Status, Homestay, Date Range)
- Empty state message if no invoices exist
- No console errors

---

## Test 2: Generate Invoice from Front Desk

### Steps:
1. Navigate to "Front Desk" from sidebar
2. Click on "Check-Out Today" tab
3. If no bookings appear, you may need to:
   - Create a test booking with today's checkout date
   - Or modify an existing booking's checkout date to today
4. Click "Check Out" button on a booking
5. In the modal, click "Generate Invoice"

### Expected Result:
- Success message: "Invoice generated successfully!"
- New tab opens showing the Invoices page
- Invoice appears in the list with status "draft"
- Invoice number format: INV-YYYYMM-XXXX

### Backend API Test (Alternative):
```bash
# Replace {booking_id} with an actual booking ID from your database
curl -X POST http://localhost:3001/api/invoices/generate/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tax_rate": 18,
    "payment_terms": "Due on receipt"
  }'
```

---

## Test 3: View Invoice Details

### Steps:
1. On the Invoices page, find an invoice
2. Click the eye icon (👁️) to view details

### Expected Result:
- Modal opens with complete invoice details
- Shows company/homestay information
- Shows bill-to (guest) information
- Shows booking details (reference, dates, room)
- Shows itemized charges table
- Shows financial summary (subtotal, tax, total, balance)
- Action buttons visible: Download PDF, Send via Email, Record Payment

---

## Test 4: Download Invoice PDF

### Steps:
1. Open an invoice in the modal (from Test 3)
2. Click "Download PDF" button

### Expected Result:
- New browser tab opens
- PDF file downloads or displays
- PDF contains:
  - Invoice header with company name
  - Invoice number and dates
  - Bill-to information
  - Itemized charges
  - Totals and balance
- Professional formatting

### Direct API Test:
```bash
# Open in browser or use curl
http://localhost:3001/api/invoices/{invoice_id}/pdf
```

---

## Test 5: Record Payment

### Steps:
1. Open an invoice with balance due > 0
2. Click "Record Payment" button
3. Enter payment amount (e.g., half of balance due)
4. Select payment method (e.g., "Cash")
5. Enter reference number (optional)
6. Click "Record Payment"

### Expected Result:
- Success message: "Payment recorded successfully!"
- Modal closes
- Invoice list refreshes
- Invoice status changes to "partially_paid"
- Amount paid and balance due updated

### Test Full Payment:
1. Repeat steps above
2. Enter remaining balance as payment amount
3. Submit

### Expected Result:
- Invoice status changes to "paid"
- Balance due shows 0
- "Record Payment" button no longer visible

---

## Test 6: Send Invoice via Email

### Prerequisites:
- SMTP credentials configured in backend/.env
- Valid guest email in booking

### Steps:
1. Open an invoice in the modal
2. Click "Send via Email" button
3. Verify/edit recipient email
4. Add custom message (optional)
5. Click "Send Email"

### Expected Result:
- Success message: "Invoice sent successfully via email!"
- Invoice status changes to "sent"
- Email received at recipient address
- Email contains:
  - Invoice summary
  - Link to view invoice
  - Professional formatting

### Note:
If email fails, check:
- SMTP credentials in .env file
- SMTP server allows connections
- No firewall blocking port 587
- For Gmail: using App Password

---

## Test 7: Filter Invoices

### Test 7a: Search Filter
1. Enter invoice number in search box
2. Press Enter or click "Apply Filters"
3. Verify only matching invoice appears

### Test 7b: Status Filter
1. Select "Paid" from Status dropdown
2. Click "Apply Filters"
3. Verify only paid invoices appear

### Test 7c: Homestay Filter
1. Select a homestay from dropdown
2. Click "Apply Filters"
3. Verify only invoices for that homestay appear

### Test 7d: Date Range Filter
1. Set "From Date" to a past date
2. Set "To Date" to today
3. Click "Apply Filters"
4. Verify only invoices within date range appear

### Test 7e: Clear Filters
1. Click "Clear" button
2. Verify all invoices appear again

---

## Test 8: Complete Checkout Workflow

### Steps:
1. Navigate to Front Desk
2. Find a booking scheduled for checkout today
3. Click "Check Out"
4. Click "Generate Invoice"
5. Verify invoice opens in new tab
6. Return to checkout modal
7. Click "Complete Check-Out"

### Expected Result:
- Success message: "Checkout completed successfully!"
- Booking status changes to "checked_out"
- Room status changes to "vacant_dirty"
- Booking removed from checkout list

---

## Test 9: Invoice with Multiple Charge Types

### Prerequisites:
Create a booking with:
- Room charges (standard)
- Booking charges (add minibar, laundry, etc.)
- Restaurant orders (create orders linked to booking)

### Steps:
1. Generate invoice for this booking
2. View invoice details

### Expected Result:
- Invoice contains line items for:
  - Room charges (nights × rate)
  - Each booking charge as separate line
  - Each restaurant menu item as separate line
- Subtotal correctly sums all items
- Tax calculated on subtotal
- Total amount is correct

---

## Test 10: Error Handling

### Test 10a: Duplicate Invoice
1. Generate invoice for a booking
2. Try to generate invoice again for same booking

### Expected Result:
- Error message: "Invoice already exists for this booking"
- No duplicate invoice created

### Test 10b: Delete Non-Draft Invoice
1. Create an invoice
2. Change status to "sent"
3. Try to delete the invoice

### Expected Result:
- Error message: "Only draft invoices can be deleted"
- Invoice not deleted

### Test 10c: Payment Exceeds Balance
1. Open invoice with balance due
2. Try to record payment > balance due

### Expected Result:
- Error message: "Payment amount cannot exceed balance due"
- Payment not recorded

---

## Database Verification

### Check Invoice Created:
```sql
SELECT * FROM invoices ORDER BY created_at DESC LIMIT 5;
```

### Check Invoice Items:
```sql
SELECT ii.*, i.invoice_number 
FROM invoice_items ii
JOIN invoices i ON ii.invoice_id = i.invoice_id
ORDER BY ii.created_at DESC LIMIT 10;
```

### Check Invoice with All Details:
```sql
SELECT i.*, b.booking_reference, 
       CONCAT(g.first_name, ' ', g.last_name) as guest_name,
       h.name as homestay_name
FROM invoices i
JOIN bookings b ON i.booking_id = b.booking_id
LEFT JOIN guest_profiles g ON b.guest_id = g.guest_id
LEFT JOIN homestays h ON b.homestay_id = h.homestay_id
WHERE i.invoice_id = {invoice_id};
```

---

## Performance Testing

### Test Large Invoice:
1. Create booking with many charges:
   - Multiple booking charges (10+)
   - Multiple restaurant orders (20+ items)
2. Generate invoice
3. Measure time to generate
4. View PDF

### Expected Result:
- Invoice generates in < 2 seconds
- PDF generates in < 3 seconds
- All items displayed correctly
- No pagination issues

---

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari

Verify:
- Invoice list displays correctly
- Modal opens and closes properly
- PDF downloads work
- Forms submit correctly
- Responsive design works on mobile

---

## Common Issues and Solutions

### Issue: "Failed to fetch invoices"
**Solution:** 
- Check backend server is running
- Verify authentication token is valid
- Check browser console for CORS errors

### Issue: "Failed to generate PDF"
**Solution:**
- Check PDFKit is installed: `npm list pdfkit`
- Verify invoice data is complete
- Check backend logs for errors

### Issue: "Failed to send invoice email"
**Solution:**
- Verify SMTP credentials in .env
- Check SMTP server is accessible
- For Gmail: use App Password
- Check backend logs for detailed error

### Issue: Invoice items not showing
**Solution:**
- Verify booking has charges in database
- Check booking_charges table
- Check restaurant_orders table
- Verify foreign keys are correct

### Issue: Invoice total incorrect
**Solution:**
- Check tax rate (default 18%)
- Verify all line items have correct prices
- Check discount_amount is not negative
- Verify service_charge calculation

---

## Success Criteria

✅ All tests pass without errors
✅ Invoices generate correctly with all charge types
✅ PDF downloads and displays properly
✅ Email sends successfully
✅ Payment recording works (partial and full)
✅ Filters work correctly
✅ Front Desk checkout workflow completes
✅ No console errors
✅ Responsive design works on mobile
✅ Database records are correct

---

## Next Steps After Testing

1. **Configure Production SMTP:**
   - Set up dedicated email service
   - Update .env with production credentials

2. **Customize Invoice Template:**
   - Add company logo
   - Adjust colors and branding
   - Modify PDF layout if needed

3. **Set Up Automated Tasks:**
   - Cron job to mark overdue invoices
   - Automated email reminders
   - Daily invoice reports

4. **Train Staff:**
   - Front desk checkout procedure
   - Invoice generation process
   - Payment recording
   - Email sending

5. **Monitor and Optimize:**
   - Track invoice generation times
   - Monitor email delivery rates
   - Review error logs
   - Gather user feedback

---

## Support

For issues or questions:
1. Check backend logs: `backend/logs/`
2. Check browser console for frontend errors
3. Review database for data integrity
4. Consult INVOICE_SYSTEM_IMPLEMENTATION.md for details