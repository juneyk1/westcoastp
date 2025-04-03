import React, { useState } from 'react';

import { useNavigate } from "react-router-dom";
import Landing from './Landing';

const SubscriptionPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    address3: '',
    address4: '',
    cardNumber: '',
    expDate: '',
    securityCode: '',
    zipCode: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    navigate("/checkout-response");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Your Subscription</h1>
      <div style={styles.price}>$1000/mo</div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Name Section */}
        <div style={styles.nameContainer}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>
        </div>

        {/* Shipping Address */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Shipping To</h2>
          <div style={styles.inputGroup}>
            <input
              type="text"
              name="address1"
              value={formData.address1}
              onChange={handleChange}
              style={styles.input}
              placeholder="Street address"
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="text"
              name="address2"
              value={formData.address2}
              onChange={handleChange}
              style={styles.input}
              placeholder="Apt, suite, building (optional)"
            />
          </div>
        </div>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Billing To</h2>
          <div style={styles.inputGroup}>
            <input
              type="text"
              name="address1"
              value={formData.address3}
              onChange={handleChange}
              style={styles.input}
              placeholder="Street address"
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="text"
              name="address2"
              value={formData.address4}
              onChange={handleChange}
              style={styles.input}
              placeholder="Apt, suite, building (optional)"
            />
          </div>
        </div>

        {/* Payment Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Card Number</h2>
          <div style={styles.inputGroup}>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={handleChange}
              style={styles.input}
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>

          <div style={styles.cardDetails}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Exp Date</label>
              <input
                type="text"
                name="expDate"
                value={formData.expDate}
                onChange={handleChange}
                style={styles.smallInput}
                placeholder="MM/YY"
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Security Code</label>
              <input
                type="text"
                name="securityCode"
                value={formData.securityCode}
                onChange={handleChange}
                style={styles.smallInput}
                placeholder="CVC"
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Zip Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                style={styles.smallInput}
                required
              />
            </div>
          </div>
        </div>

        <button type="submit" style={styles.button}>Subscribe</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '40px auto',
    padding: '0 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
  },
  header: {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1a1a1a',
    textAlign: 'center'
  },
  price: {
    fontSize: '20px',
    color: '#666',
    textAlign: 'center',
    marginBottom: '40px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  nameContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '10px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    color: '#444',
    fontWeight: '500'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%',
    boxSizing: 'border-box'
  },
  smallInput: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    width: '100%',
    maxWidth: '140px'
  },
  cardDetails: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap'
  },
  button: {
    backgroundColor: '#000',
    color: 'white',
    padding: '14px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '20px'
  }
};

export default SubscriptionPage;