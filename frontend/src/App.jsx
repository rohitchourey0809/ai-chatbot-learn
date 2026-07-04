import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API_BASE_URL = "/api";

const initialMessages = [
  {
    id: 1,
    sender: "AI",
    text: "Hello! I’m your AI assistant. Ask me anything.",
  },
];

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (event) => {
    event?.preventDefault();

    if (!message.trim() || isLoading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      sender: "You",
      text: message.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/chat`, { message: userMessage.text });

      const aiMessage = {
        id: Date.now() + 1,
        sender: "AI",
        text: data.reply || "Sorry, I could not generate a response.",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const serverError = error.response?.data?.error;
      const errorMessage = typeof serverError === "string" && serverError.trim()
        ? serverError
        : "Something went wrong. Please try again.";
      const fallbackMessage = {
        id: Date.now() + 2,
        sender: "AI",
        text: `Error: ${errorMessage}`,
      };

      console.error("Chat request failed:", error);
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(event);
    }
  };

  return (
    <div className="app-shell">
      <div className="app-card">
        <header className="app-header">
          <div>
            <p className="eyebrow">AI Assistant</p>
            <h1>Smart Chatbot</h1>
          </div>
          <div className="status-pill">Online</div>
        </header>

        <main className="messages-panel">
          {messages.map((msg) => (
            <div key={msg.id} className={`message-row ${msg.sender === "You" ? "user" : "ai"}`}>
              <div className="message-bubble">
                <span className="message-label">{msg.sender}</span>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-row ai">
              <div className="message-bubble typing">
                <span className="message-label">AI</span>
                <p>Thinking...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </main>

        <form className="composer" onSubmit={sendMessage}>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
