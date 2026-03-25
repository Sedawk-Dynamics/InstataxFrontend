import React, { useState, useRef, useEffect } from "react";
import "./ChatWidget.css";
import chatIcon from "../assets/smalllogo.png";
import {
  FaQuestionCircle,
  FaNewspaper,
  FaTimes,
  FaArrowLeft,
  FaComments,
  FaRobot,
  FaUser,
} from "react-icons/fa";

// ─── Knowledge Base ───────────────────────────────────────────────────────────
// Every entry: array of trigger keywords/phrases → answer text.
// The matcher scores each entry and picks the best match.
const knowledgeBase = [
  // ── About Instatax ──
  {
    keywords: ["what is instatax", "about instatax", "instatax", "tell me about", "who are you", "what do you do", "company"],
    answer:
      "InstaTax.ai is a platform by TSMTX Solutions Private Limited that simplifies legal, taxation, and compliance processes for individuals, startups, and businesses across India. Our team includes Chartered Accountants, Company Secretaries, Lawyers, Tax Consultants, and IT Professionals.",
  },
  {
    keywords: ["mission", "vision", "goal"],
    answer:
      "Our mission is to make professional legal, tax, and compliance services accessible and affordable for everyone. Our vision is to simplify complex legal, taxation, and compliance processes across India using technology.",
  },
  {
    keywords: ["team", "experts", "professionals", "who works"],
    answer:
      "Our team comprises Chartered Accountants (CAs), Company Secretaries (CS), Lawyers, Tax Consultants, and IT Professionals — all working together to deliver reliable services.",
  },
  {
    keywords: ["office", "address", "location", "where", "registered office", "headquarter"],
    answer:
      "Our registered office is at KGB Kalpataru, Gotalgram, Balianta, Balakati, Khordha, Odisha – 752100, India.",
  },

  // ── Services ──
  {
    keywords: ["services", "what services", "offerings", "what can you do", "help with"],
    answer:
      "We offer services in four categories:\n\n• Start Business – Company registration, incorporation\n• Protect Business – Trademark, copyright, patent registration\n• Manage Business – Accounting, compliance, filings\n• Grow Business – Advisory and consulting\n\nVisit our Services page or type a specific service name to learn more!",
  },
  {
    keywords: ["start business", "register company", "company registration", "new company", "incorporation", "business registration"],
    answer:
      "We help you start your business with services like Private Limited Company Registration, One Person Company (OPC) Registration, LLP Registration, Partnership Firm Registration, and Startup Incorporation. Visit our 'Start Business' category to explore all options and get an instant quote!",
  },
  {
    keywords: ["private limited", "pvt ltd", "private company"],
    answer:
      "Private Limited Company Registration typically takes around 15 days. We handle everything from name approval to incorporation certificate. Head to our Services page and select 'Start Business' to get a quote!",
  },
  {
    keywords: ["opc", "one person company"],
    answer:
      "One Person Company (OPC) is ideal for solo entrepreneurs. It gives you limited liability with single ownership. We handle the full registration process. Check our 'Start Business' services for details!",
  },
  {
    keywords: ["llp", "limited liability partnership"],
    answer:
      "LLP Registration combines the benefits of a partnership and a company with limited liability protection. We assist with the entire registration process. Visit our 'Start Business' category!",
  },
  {
    keywords: ["trademark", "brand registration", "tm", "brand protect"],
    answer:
      "Trademark Registration protects your brand name, logo, or slogan. The process typically takes 3-6 months. We handle the application, follow-ups, and documentation. Check our 'Protect Business' services!",
  },
  {
    keywords: ["copyright", "content protection"],
    answer:
      "Copyright Registration protects your original creative works — including software, art, music, and literary works. We guide you through the entire filing process. See our 'Protect Business' category!",
  },
  {
    keywords: ["patent", "invention", "patent filing"],
    answer:
      "Patent Filing protects your inventions and innovations. We assist with patent search, application drafting, and filing with the patent office. Visit our 'Protect Business' services!",
  },
  {
    keywords: ["accounting", "bookkeeping", "compliance", "filing", "manage business", "gst filing", "tax filing", "income tax"],
    answer:
      "Under 'Manage Business', we offer accounting, bookkeeping, GST filing, income tax filing, annual compliance filings, and more. Our CAs and tax experts ensure you stay compliant. Check our services page!",
  },
  {
    keywords: ["advisory", "consulting", "grow business", "business growth"],
    answer:
      "Our 'Grow Business' services include business advisory, financial consulting, and strategic growth planning. Our experts help you scale efficiently. Visit the 'Grow Business' category!",
  },

  // ── Contact ──
  {
    keywords: ["contact", "email", "reach", "get in touch", "phone", "call"],
    answer:
      "You can reach us through:\n\n• General: Contact@instatax.ai\n• Privacy: Privacy@instatax.ai\n• Refunds: Refund@instatax.ai\n• Careers: Careers@instatax.ai\n• Grievances: Grievance@instatax.ai\n\nOr visit our Contact Us page to send a message directly!",
  },
  {
    keywords: ["grievance", "complaint", "issue", "problem"],
    answer:
      "For grievances, please email our Grievance Officer at Grievance@instatax.ai. You can also use the Contact Us page on our website to submit your concern.",
  },

  // ── Pricing & Payment ──
  {
    keywords: ["price", "pricing", "cost", "how much", "fee", "charges"],
    answer:
      "Pricing varies by service. You can get an instant quote by filling out the 'Get Quote' form on our homepage or any service page. Just provide your details and select a service!",
  },
  {
    keywords: ["payment", "pay", "payment method", "upi", "card", "paypal"],
    answer:
      "We accept multiple payment methods:\n\n• Visa / Mastercard\n• UPI\n• PayPal\n\nVisit our Payment page to make a secure payment.",
  },
  {
    keywords: ["quote", "get quote", "enquiry", "enquire"],
    answer:
      "You can get an instant quote by filling out the form on our homepage! Just provide your name, email, phone, state, city, and select a service. Our team will get back to you quickly.",
  },

  // ── Refund Policy ──
  {
    keywords: ["refund", "money back", "cancel", "cancellation"],
    answer:
      "Our refund policy allows cancellation within 24 hours before service initiation. To request a refund, email Refund@instatax.ai. After 24 hours or once work has begun, refunds are evaluated case-by-case. Visit our Refund Policy page for full details.",
  },

  // ── Privacy Policy ──
  {
    keywords: ["privacy", "data", "personal data", "data protection", "privacy policy"],
    answer:
      "We take your privacy seriously. We collect only necessary data and follow the IT Act 2000 and Digital Personal Data Protection Act 2023. Your data is encrypted and securely stored. For details, visit our Privacy Policy page or email Privacy@instatax.ai.",
  },

  // ── Terms & Conditions ──
  {
    keywords: ["terms", "terms and conditions", "terms of service", "tos"],
    answer:
      "Our Terms and Conditions cover intellectual property rights, user accounts, service nature, payment terms, and refund policy. The jurisdiction is under courts in Bhubaneswar, Odisha. Visit our Terms and Conditions page for full details.",
  },

  // ── Disclaimer ──
  {
    keywords: ["disclaimer", "liability", "legal disclaimer"],
    answer:
      "Our disclaimer clarifies that no professional relationship is created without a formal engagement. We are not liable for third-party system issues or government processing delays. Visit our Disclaimer page for complete information.",
  },

  // ── Careers ──
  {
    keywords: ["career", "careers", "job", "hiring", "work with", "join", "openings", "vacancy"],
    answer:
      "We're always looking for talented people! Check our Careers page for current openings, or send your resume to Careers@instatax.ai. We'd love to hear from you!",
  },

  // ── Blog ──
  {
    keywords: ["blog", "blogs", "articles", "news", "updates", "read"],
    answer:
      "We publish insightful articles on legal, tax, and business topics on our Blog page. Stay updated with the latest industry news, guides, and tips!",
  },

  // ── App ──
  {
    keywords: ["app", "mobile app", "download", "android", "ios", "play store", "app store"],
    answer:
      "InstaTax.ai has a mobile app — ranked #1 in the Business category! Download it from Google Play Store or Apple App Store. 'Law made simple, startups made easy!'",
  },

  // ── Account & Login ──
  {
    keywords: ["login", "sign in", "account", "register", "sign up", "otp"],
    answer:
      "You can log in or create an account using your phone number. We use OTP verification via Firebase for secure authentication. Click the login button in the navigation bar to get started!",
  },

  // ── Startup ──
  {
    keywords: ["startup", "startup india", "startup registration"],
    answer:
      "We offer complete Startup Incorporation services including company registration, compliance setup, and advisory. Our services are designed to make startup formation quick and hassle-free. Visit our 'Start Business' category!",
  },

  // ── GST ──
  {
    keywords: ["gst", "gst registration", "goods and services tax"],
    answer:
      "We assist with GST Registration and ongoing GST filing/compliance. Our tax experts ensure your GST returns are filed accurately and on time. Check our 'Manage Business' services!",
  },

  // ── Social Media ──
  {
    keywords: ["social media", "facebook", "instagram", "twitter", "linkedin", "youtube"],
    answer:
      "Follow us on social media:\n\n• Facebook: @InstaTaxai\n• Twitter/X: @instatax_ai\n• Instagram: @instatax.ai\n• LinkedIn: /company/instatax-ai/\n\nStay connected for updates and tips!",
  },

  // ── Security ──
  {
    keywords: ["security", "safe", "secure", "encryption", "data safe"],
    answer:
      "Your data security is our priority. We use encryption for data transmission and storage, and comply with the Information Technology Act 2000 and Digital Personal Data Protection Act 2023.",
  },

  // ── How it works ──
  {
    keywords: ["how it works", "process", "steps", "how do i", "how to"],
    answer:
      "Here's how it works:\n\n1. Choose a service from our categories\n2. Fill out the quick quote form\n3. Our experts review and get back to you\n4. We handle document drafting, filing & submissions\n5. You receive your deliverables!\n\nIt's that simple. Get started on our homepage!",
  },

  // ── Greetings ──
  {
    keywords: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"],
    answer:
      "Hello! Welcome to InstaTax.ai 👋 I'm here to help you with questions about our services, policies, and more. What would you like to know?",
  },
  {
    keywords: ["thanks", "thank you", "thank", "appreciate"],
    answer:
      "You're welcome! If you have more questions about InstaTax.ai, feel free to ask anytime. We're here to help!",
  },
  {
    keywords: ["bye", "goodbye", "see you", "close"],
    answer:
      "Goodbye! Thank you for visiting InstaTax.ai. Feel free to come back anytime you need help with legal, tax, or compliance services!",
  },
];

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const faqItems = [
  {
    icon: "🏢",
    question: "What is InstaTax.ai?",
    answer:
      "InstaTax.ai is a platform by TSMTX Solutions Pvt Ltd that simplifies legal, taxation, and compliance services for individuals, startups, and businesses across India.",
  },
  {
    icon: "📋",
    question: "What services do you offer?",
    answer:
      "We offer services in four categories: Start Business (registrations), Protect Business (trademark, copyright, patent), Manage Business (accounting, compliance), and Grow Business (advisory).",
  },
  {
    icon: "💰",
    question: "How do I get a price quote?",
    answer:
      "Fill out the 'Get Quote Instantly' form on our homepage or any service page with your details. Our team will provide a quote quickly.",
  },
  {
    icon: "💳",
    question: "What payment methods are accepted?",
    answer:
      "We accept Visa, Mastercard, UPI, and PayPal. Visit the Payment page to make a secure payment.",
  },
  {
    icon: "🔄",
    question: "What is the refund policy?",
    answer:
      "You can request a refund within 24 hours before service initiation by emailing Refund@instatax.ai. After that, refunds are evaluated case-by-case.",
  },
  {
    icon: "📧",
    question: "How can I contact support?",
    answer:
      "Email us at Contact@instatax.ai or visit the Contact Us page. For grievances, email Grievance@instatax.ai.",
  },
  {
    icon: "📱",
    question: "Is there a mobile app?",
    answer:
      "Yes! Our app is available on Google Play Store and Apple App Store — ranked #1 in the Business category.",
  },
  {
    icon: "🔒",
    question: "Is my data secure?",
    answer:
      "Absolutely. We use encryption and comply with the IT Act 2000 and Digital Personal Data Protection Act 2023.",
  },
  {
    icon: "⏱️",
    question: "How long does company registration take?",
    answer:
      "Private Limited Company Registration typically takes around 15 days. Other registration types may vary. Get a quote for specific timelines.",
  },
  {
    icon: "💼",
    question: "Are you hiring?",
    answer:
      "Yes! Check our Careers page or send your resume to Careers@instatax.ai.",
  },
];

// ─── News / Updates Data ──────────────────────────────────────────────────────
const newsItems = [
  {
    image: "feature-update",
    title: "New Services Launched",
    date: "March 2026",
    summary:
      "We've expanded our service catalog with new business registration and compliance offerings.",
  },
  {
    image: "mobile-update",
    title: "Mobile App Update",
    date: "February 2026",
    summary:
      "Our mobile app has been updated with a smoother experience and new features. Download now!",
  },
  {
    image: "support-hours",
    title: "Extended Support Hours",
    date: "January 2026",
    summary:
      "We now offer extended support hours to serve you better. Reach out anytime!",
  },
  {
    image: "maintenance",
    title: "Platform Improvements",
    date: "December 2025",
    summary:
      "We've improved platform speed and security for a better user experience.",
  },
];

// ─── Quick Suggestions shown at start ─────────────────────────────────────────
const quickSuggestions = [
  "What services do you offer?",
  "How do I register a company?",
  "What is the refund policy?",
  "How can I contact you?",
  "Tell me about InstaTax",
];

// ─── Matching Logic ───────────────────────────────────────────────────────────
function findBestAnswer(userMessage) {
  const input = userMessage.toLowerCase().trim();

  if (!input) return null;

  let bestMatch = null;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      const kw = keyword.toLowerCase();
      if (input === kw) {
        // Exact match gets highest boost
        score += 10;
      } else if (input.includes(kw)) {
        // Input contains the full keyword phrase
        score += 5 + kw.split(" ").length; // longer phrase = better match
      } else {
        // Check if individual words from the keyword appear in input
        const kwWords = kw.split(" ");
        const matchedWords = kwWords.filter((w) => w.length > 2 && input.includes(w));
        if (matchedWords.length > 0) {
          score += matchedWords.length * 1.5;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  // Require a minimum score to avoid irrelevant matches
  if (bestScore >= 1.5) {
    return bestMatch.answer;
  }

  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────
const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState("chat");
  const [messages, setMessages] = useState([
    {
      text: "Welcome to InstaTax.ai! 👋 I can help you with questions about our services, policies, contact info, and more. What would you like to know?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && activeView === "chat") {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, activeView]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const processMessage = (userText) => {
    const answer = findBestAnswer(userText);

    if (answer) {
      return answer;
    }

    return "I'm sorry, I can only answer questions related to InstaTax.ai — our services, policies, pricing, contact details, and more. Could you rephrase your question? You can also check our FAQs below or visit our Contact Us page for further assistance.";
  };

  const handleSendMessage = async (text) => {
    const msgText = text || message;
    if (!msgText.trim()) return;

    const userMsg = {
      text: msgText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setShowSuggestions(false);
    setIsTyping(true);

    // Simulate a short "thinking" delay for natural feel
    const delay = 400 + Math.random() * 600;
    setTimeout(() => {
      const botReply = processMessage(msgText);
      setMessages((prev) => [
        ...prev,
        {
          text: botReply,
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
      setIsTyping(false);
    }, delay);
  };

  const handleFaqClick = (question) => {
    setActiveView("chat");
    handleSendMessage(question);
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

  const renderMessage = (msg, idx) => {
    // Split message by newlines to render line breaks
    const lines = msg.text.split("\n");
    return (
      <div key={idx} className={`chat-message-container ${msg.sender}`}>
        <div className="avatar-container">
          <div className={`avatar-icon ${msg.sender}`}>
            {msg.sender === "bot" ? <FaRobot /> : <FaUser />}
          </div>
        </div>
        <div className="message-content">
          <div className={`chat-message ${msg.sender}`}>
            {lines.map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
          <div className="message-timestamp">{formatTime(msg.timestamp)}</div>
        </div>
      </div>
    );
  };

  const renderChatView = () => (
    <>
      <div className="chat-body">
        {messages.map((msg, idx) => renderMessage(msg, idx))}
        {isTyping && (
          <div className="chat-message-container bot">
            <div className="avatar-container">
              <div className="avatar-icon bot">
                <FaRobot />
              </div>
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
        {showSuggestions && !isTyping && (
          <div className="quick-suggestions">
            <p className="suggestions-label">Quick questions:</p>
            {quickSuggestions.map((q, i) => (
              <button
                key={i}
                className="suggestion-btn"
                onClick={() => handleSendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-footer">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask about InstaTax..."
        />
        <button className="send-btn" onClick={() => handleSendMessage()}>
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
          <div
            key={index}
            className="faq-item"
            onClick={() => handleFaqClick(item.question)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleFaqClick(item.question);
              }
            }}
          >
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
        return "FAQs";
      case "news":
        return "Latest News";
      default:
        return "InstaTax Assistant";
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
    return () => document.removeEventListener("keydown", handleEscape);
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
        <div
          className="chat-box"
          role="dialog"
          aria-modal="true"
          aria-labelledby="chat-header-title"
        >
          <div className="chat-header">
            {activeView !== "chat" && (
              <button
                onClick={() => setActiveView("chat")}
                className="back-btn"
                aria-label="Back to chat"
              >
                <FaArrowLeft />
              </button>
            )}
            <h3 id="chat-header-title">{renderHeaderTitle()}</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="close-btn"
              aria-label="Close chat"
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
