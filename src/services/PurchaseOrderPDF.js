import React from "react";
import { Page, Text, View, Document, StyleSheet, Font } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#f6f9fc",
    color: "#333",
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    color: "#2d3748",
  },
  subheader: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "right",
  },
  addressBlock: {
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addressColumn: {
    width: "45%",
  },
  table: {
    display: "table",
    width: "auto",
    marginTop: 20,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCol: {
    borderBottom: "1pt solid #ccc",
    padding: 6,
  },
  totals: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    textAlign: "center",
    width: "100%",
    fontSize: 10,
    color: "#4a5568",
  },
});

const PurchaseOrderPDF = ({ orderId, createdAt, items, shippingAddress, billingAddress }) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * 0.08;
  const grandTotal = subtotal + tax;
  console.log("createdAt value:", createdAt);

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : "N/A";


  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { style: styles.page },
      React.createElement(Text, { style: styles.header }, "WCPA Purchase Order"),
      React.createElement(
        View,
        { style: styles.subheader },
        React.createElement(Text, null, `PO #: ${orderId}`),
        React.createElement(Text, null, `Date: ${formattedDate}`)
      ),
      

      React.createElement(
        View,
        { style: styles.addressBlock },
        React.createElement(
          View,
          { style: styles.addressColumn },
          React.createElement(Text, null, "Ship To:"),
          React.createElement(Text, null, `${shippingAddress.first_name} ${shippingAddress.last_name}`),
          React.createElement(Text, null, shippingAddress.address_line1),
          shippingAddress.address_line2 && React.createElement(Text, null, shippingAddress.address_line2),
          React.createElement(Text, null, `${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postal_code}`)
        ),
        React.createElement(
          View,
          { style: styles.addressColumn },
          React.createElement(Text, null, "Bill To:"),
          React.createElement(Text, null, `${billingAddress.first_name} ${billingAddress.last_name}`),
          React.createElement(Text, null, billingAddress.address_line1),
          billingAddress.address_line2 && React.createElement(Text, null, billingAddress.address_line2),
          React.createElement(Text, null, `${billingAddress.city}, ${billingAddress.state} ${billingAddress.postal_code}`)
        )
      ),

      React.createElement(
        View,
        { style: styles.table },
        React.createElement(
          View,
          { style: styles.tableRow },
          ["SKU", "Description", "Qty", "Unit Price", "Line Total"].map((col, idx) =>
            React.createElement(View, { key: idx, style: { ...styles.tableCol, width: `${100 / 5}%` } },
              React.createElement(Text, null, col)
            )
          )
        ),
        items.map((item, i) =>
          React.createElement(
            View,
            { key: i, style: styles.tableRow },
            [item.sku, item.name, item.quantity, `$${item.price.toFixed(2)}`, `$${(item.price * item.quantity).toFixed(2)}`].map((text, idx) =>
              React.createElement(View, { key: idx, style: { ...styles.tableCol, width: `${100 / 5}%` } },
                React.createElement(Text, null, text)
              )
            )
          )
        )
      ),

      React.createElement(
        View,
        { style: styles.totals },
        React.createElement(Text, null, `Subtotal: $${subtotal.toFixed(2)}`),
        React.createElement(Text, null, `Tax (8%): $${tax.toFixed(2)}`),
        React.createElement(Text, { style: { fontWeight: "bold" } }, `Total: $${grandTotal.toFixed(2)}`)
      ),

      React.createElement(Text, { style: styles.footer }, "Thank you for your business!")
    )
  );
};

export default PurchaseOrderPDF;
