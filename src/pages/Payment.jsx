import React, { useState } from "react";
import Footer from "../components/Footer";
// import heroimage11 from "../assets/Payment1.png";
import ChatWidget from "../components/ChatWidget";
import "../pages/Payment.css";
// Import payment icons (you'll need to add these to your assets folder)
import visaIcon from "../assets/visa.svg";
import mastercardIcon from "../assets/mastercard.svg";
import upiIcon from "../assets/upiicon.svg";
import paypalIcon from "../assets/paypal.svg";

function Payment() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    amount: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle payment processing here
    console.log("Payment submitted:", formData);
  };

  return (
    <div>
      <div className="payment-container">
        {/* Payment Form Section - Left Side */}
        <div className="payment-form-container">
          <div className="payment-header">
            <h2>Make Payment Now</h2>
            <p className="payment-subheader">Quick, secure, and hassle-free</p>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            <div className="form-field">
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="full-input"
              />
            </div>

            <div className="form-field">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="full-input"
              />
            </div>
            <div className="form-field">
              <input
                type="tel"
                id="mobile"
                name="mobile"
                placeholder="Mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="full-input"
              />
            </div>
            <div className="form-field">
              <input
                type="number"
                id="amount"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleChange}
                className="full-input"
              />
            </div>

            <div className="secure-payment-note">
              <span className="lock-icon">🔒</span> Your payment information is
              secure
            </div>

            <button type="submit" className="pay-button">
              PAY NOW <span>→</span>
            </button>
          </form>

          {/* Payment icons moved below the button with a separator */}
          <div className="payment-icons">
            <img src={visaIcon} alt="Visa" />
            <img src={mastercardIcon} alt="Mastercard" />
            <img src={upiIcon} alt="UPI" />
            <img src={paypalIcon} alt="PayPal" />
          </div>
        </div>
      </div>
      <Footer />
      <ChatWidget />
    </div>
  );
}

export default Payment;
