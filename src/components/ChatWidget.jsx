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
  FaComments,
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

  // TODO: Load FAQ items from backend/CMS
  const faqItems = [];

  // TODO: Load news items from backend/CMS
  const newsItems = [];

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
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

    // TODO: Implement actual chat API integration
    // const response = await chatApi.sendMessage(message);
    // setMessages([...newMessages, { text: response.text, sender: "bot", timestamp: new Date() }]);
    setIsTyping(false);
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

  // Keyboard navigation for chat widget
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="chat-widget">
      <button 
        className="chat-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat widget"
        aria-expanded={isOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <img src={chatIcon} alt="Logo" className="chat-logo-icon" />
        <FaComments className="chat-icon" />
        <span>Chat with Us!</span>
      </button>

      {isOpen && (
        <div className="chat-box" role="dialog" aria-modal="true" aria-labelledby="chat-header-title">
          <div className="chat-header">
            {activeView !== "chat" && (
              <button
                onClick={() => setActiveView("chat")}
                className="back-btn"
                aria-label="Back to chat"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveView("chat");
                  }
                }}
              >
                <FaArrowLeft />
              </button>
            )}
            <h3 id="chat-header-title">{renderHeaderTitle()}</h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="close-btn"
              aria-label="Close chat"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsOpen(false);
                }
              }}
            >
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveView("faq");
                  }
                }}
              >
                <FaQuestionCircle /> FAQs
              </button>
              <button
                className="nav-btn news-btn"
                onClick={() => setActiveView("news")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveView("news");
                  }
                }}
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
