import React, { useState, useRef, useEffect } from "react";
import "./ChatWidget.css";
import chatIcon from "../assets/smalllogo.png";
import userAvatar from "../assets/user-avatar.png"; // Add this image to your assets
import botAvatar from "../assets/bot-avatar.png"; // Add this image to your assets
import {
  FaQuestionCircle,
  FaNewspaper,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState("chat"); // "chat", "faq", or "news"
  const [messages, setMessages] = useState([
    {
      text: "Welcome! How can we assist you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const faqItems = [
    {
      question: "How do I reset my password?",
      answer:
        "Go to settings and click on 'Reset Password'. You'll receive an email with instructions to set a new password.",
      icon: "🔑",
    },
    {
      question: "What are your support hours?",
      answer:
        "Our support team is available 24/7 to assist you with any questions or concerns you may have.",
      icon: "🕒",
    },
    {
      question: "How do I upgrade my plan?",
      answer:
        "Visit the billing section in your account to upgrade. You'll see various options that suit your needs.",
      icon: "⭐",
    },
    {
      question: "Can I cancel my subscription?",
      answer:
        "Yes, you can cancel your subscription anytime from your account settings without any cancellation fee.",
      icon: "📝",
    },
    {
      question: "How do I contact customer support?",
      answer:
        "You can reach our customer support team via this chat, email at support@example.com, or call us at 1-800-123-4567.",
      icon: "📞",
    },
  ];

  const newsItems = [
    {
      title: "New Feature Released",
      summary:
        "We just launched a new feature for better experience. Try out our new dashboard analytics tools!",
      date: "March 22, 2025",
      image: "feature-update",
    },
    {
      title: "System Maintenance",
      summary:
        "Scheduled maintenance on March 30 from 1 AM - 3 AM UTC. Services may be intermittently unavailable.",
      date: "March 20, 2025",
      image: "maintenance",
    },
    {
      title: "Mobile App Update",
      summary:
        "Version 2.5 of our mobile app is now available with improved performance and new features.",
      date: "March 15, 2025",
      image: "mobile-update",
    },
    {
      title: "Holiday Support Hours",
      summary:
        "Our support team will be operating with limited capacity during the upcoming holiday weekend.",
      date: "March 10, 2025",
      image: "support-hours",
    },
  ];

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessages = [
      ...messages,
      {
        text: message,
        sender: "user",
        timestamp: new Date(),
      },
    ];

    setMessages(newMessages);
    setMessage("");
    setIsTyping(true);

    // Simulated bot response
    setTimeout(() => {
      setIsTyping(false);
      setMessages([
        ...newMessages,
        {
          text: "Thanks for reaching out! We'll assist you shortly.",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    }, 1500);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const renderChatView = () => (
    <>
      <div className="chat-body">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message-container ${msg.sender}`}>
            <div className="avatar-container">
              <img
                src={msg.sender === "bot" ? botAvatar : userAvatar}
                alt={`${msg.sender} avatar`}
                className="avatar"
              />
            </div>
            <div className="message-content">
              <div className={`chat-message ${msg.sender}`}>
                <p>{msg.text}</p>
              </div>
              <div className="message-timestamp">
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message-container bot">
            <div className="avatar-container">
              <img src={botAvatar} alt="bot avatar" className="avatar" />
            </div>
            <div className="message-content">
              <div className="chat-message bot typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button className="send-btn" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </>
  );

  const renderFaqView = () => (
    <div className="faq-view">
      <h3>Frequently Asked Questions</h3>
      <div className="faq-list">
        {faqItems.map((item, index) => (
          <div key={index} className="faq-item">
            <div className="faq-question">
              <span className="faq-icon">{item.icon}</span>
              <h4>{item.question}</h4>
            </div>
            <p className="faq-answer">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewsView = () => (
    <div className="news-view">
      <h3>Latest Updates</h3>
      <div className="news-list">
        {newsItems.map((news, index) => (
          <div key={index} className="news-item">
            <div className="news-image" data-image={news.image}></div>
            <div className="news-content">
              <h4>{news.title}</h4>
              <div className="news-date">{news.date}</div>
              <p>{news.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderHeaderTitle = () => {
    switch (activeView) {
      case "faq":
        return "Frequently Asked Questions";
      case "news":
        return "Latest News";
      default:
        return "Chat Support";
    }
  };

  return (
    <div className="chat-widget">
      <button className="chat-btn" onClick={() => setIsOpen(!isOpen)}>
        <img src={chatIcon} alt="Chat" className="chat-icon" />
        <span>Chat with Us!</span>
      </button>

      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            {activeView !== "chat" && (
              <button
                onClick={() => setActiveView("chat")}
                className="back-btn"
              >
                <FaArrowLeft />
              </button>
            )}
            <h3>{renderHeaderTitle()}</h3>
            <button onClick={() => setIsOpen(false)} className="close-btn">
              <FaTimes />
            </button>
          </div>

          {activeView === "chat" && renderChatView()}
          {activeView === "faq" && renderFaqView()}
          {activeView === "news" && renderNewsView()}

          {activeView === "chat" && (
            <div className="chat-navigation">
              <button
                className="nav-btn faq-btn"
                onClick={() => setActiveView("faq")}
              >
                <FaQuestionCircle /> FAQs
              </button>
              <button
                className="nav-btn news-btn"
                onClick={() => setActiveView("news")}
              >
                <FaNewspaper /> News
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
