import PDFDocument from "pdfkit";
import fs from "fs"; // only if you want to test locally with fs.createWriteStream

export function generatePurchaseOrderPDF({ orderId, createdAt, items, shippingAddress, billingAddress }) {
  const doc = new PDFDocument({ margin: 50 });
  
  doc
    .fontSize(20)
    .text("WCPA", 110, 57)
    // right-aligned PO info
    .fontSize(10)
    .text(`Purchase Order`, 0, 65, { align: "right" })
    .text(`PO #: ${orderId}`, 0, 80, { align: "right" })
    .text(`Date: ${new Date(createdAt).toLocaleDateString()}`, 0, 95, { align: "right" })
    .moveDown();

//   // — ADDRESSES —
   const addressTop = 150;
  // shipping
  doc
    .fontSize(10)
    .text("Ship To:", 50, addressTop)
    .text(`${shippingAddress.first_name} ${shippingAddress.last_name}`, 50, addressTop + 15)
    .text(shippingAddress.address_line1, 50, addressTop + 30)
    .text(shippingAddress.address_line2 || "", 50, addressTop + 45)
    .text(`${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}`, 50, addressTop + 60);

  // billing
  doc
    .text("Bill To:", 300, addressTop)
    .text(`${billingAddress.first_name} ${billingAddress.last_name}`, 300, addressTop + 15)
    .text(billingAddress.address_line1, 300, addressTop + 30)
    .text(billingAddress.address_line2 || "", 300, addressTop + 45)
    .text(`${billingAddress.city}, ${billingAddress.state} ${billingAddress.postal_code}`, 300, addressTop + 60);

  // separator
  doc
    .moveTo(50, addressTop + 90)
    .lineTo(550, addressTop + 90)
    .dash(5, { space: 5 })
    .stroke()
    .undash();

  // — ITEMS TABLE —
  const tableTop = addressTop + 110;
  const rowHeight = 20;

  // header
  doc
    .fontSize(10)
    .text("SKU", 50, tableTop)
    .text("Description", 150, tableTop)
    .text("Qty", 330, tableTop, { width: 50, align: "right" })
    .text("Unit Price", 380, tableTop, { width: 90, align: "right" })
    .text("Line Total", 470, tableTop, { width: 90, align: "right" })
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .stroke();

  // rows
  let y = tableTop + 25;
  items.forEach(item => {
    const lineTotal = item.price * item.quantity;
    doc
      .fontSize(10)
      .text(item.sku, 50, y)
      .text(item.name, 150, y)
      .text(item.quantity, 330, y, { width: 50, align: "right" })
      .text(`$${item.price.toFixed(2)}`, 380, y, { width: 90, align: "right" })
      .text(`$${lineTotal.toFixed(2)}`, 470, y, { width: 90, align: "right" });
    y += rowHeight;
  });

  // — TOTALS BOX —
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + tax;

  doc
    .moveTo(350, y + 10)
    .lineTo(550, y + 10)
    .stroke();

  doc
    .fontSize(10)
    .text("Subtotal", 380, y + 20, { width: 100, align: "right" })
    .text(`$${subtotal.toFixed(2)}`, 480, y + 20, { width: 90, align: "right" })
    .text("Tax (8%)", 380, y + 35, { width: 100, align: "right" })
    .text(`$${tax.toFixed(2)}`, 480, y + 35, { width: 90, align: "right" })
    .font("Helvetica-Bold")
    .text("Total", 380, y + 50, { width: 100, align: "right" })
    .text(`$${grandTotal.toFixed(2)}`, 480, y + 50, { width: 90, align: "right" })
    .font("Helvetica");

  // — FOOTER —
  doc
    .fontSize(10)
    .text("Thank you for your business!", 50, 750, {
      align: "center",
      width: 500
    });

  return doc;
}

// Example usage in your route:
// const stream = generatePurchaseOrderPDF({ orderId, createdAt, items, shippingAddress, billingAddress, logoPath: '/path/logo.png' });
// stream.pipe(res);    // or gather buffers and email them
