// src/components/BlogSubscription.jsx
import React, { useState } from "react";
import "./BlogSubscription.css";
import subscriptionIllustration from "../assets/blogs1.png";
import ChatWidget from "./ChatWidget";

const BlogSubscription = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [prefix, setPrefix] = useState("");
  const [whatsappUpdates, setWhatsappUpdates] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Subscription data:", {
      prefix,
      fullName,
      email,
      whatsappUpdates,
    });
    // Here you would typically send this data to your backend
    alert("Subscription successful!");
    setEmail("");
    setFullName("");
    setPrefix("");
  };

  return (
    <section className="blog-subscription" id="blog-subscription">
      <div className="subscription-container">
        <div className="subscription-illustration">
          <img
            src={subscriptionIllustration}
            alt="Blog subscription illustration"
          />
        </div>

        <div className="subscription-form">
          <div className="form-container">
            <h2>Subscribe our Blogs to get Latest Updates!</h2>

            <form onSubmit={handleSubmit}>
              <div className="name-row">
                <div className="form-group prefix-group">
                  <input
                    type="text"
                    placeholder="Prefix"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                  />
                </div>

                <div className="form-group fullname-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <input
                  type="email"
                  placeholder="Email ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="toggle-group">
                <div
                  className={`toggle-switch ${whatsappUpdates ? "active" : ""}`}
                  onClick={() => setWhatsappUpdates(!whatsappUpdates)}
                >
                  <div className="toggle-button"></div>
                </div>
                <label>Get updates through Whatsapp</label>
              </div>

              <button type="submit" className="subscribe-button">
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </div>
      <ChatWidget />
    </section>
  );
};

export default BlogSubscription;
