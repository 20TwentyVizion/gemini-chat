import React, { useState, useRef } from 'react';
import './App.css';
import { FiSettings } from 'react-icons/fi';

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [apiKey, setApiKey] = useState(localStorage.getItem('geminiApiKey') || '');
  const [showSettings, setShowSettings] = useState(false);
  const settingsRef = useRef(null);

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
  };

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
  };

  const handleSaveApiKey = () => {
    localStorage.setItem('geminiApiKey', apiKey);
    setShowSettings(false);
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: input }],
          }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const botResponse = data.candidates[0].content.parts[0].text;
      const botMessage = { text: botResponse, sender: 'bot' };
      setMessages([...messages, userMessage, botMessage]);
    } catch (error) {
      console.error('Error fetching Gemini API:', error);
      const errorMessage = { text: `Error: ${error.message}`, sender: 'bot' };
      setMessages([...messages, userMessage, errorMessage]);
    }

    setInput('');
  };


  return (
    <div className="chat-container">
      <div className="chat-header">
        <span>Chatbot</span>
        <FiSettings className="settings-icon" onClick={handleSettingsClick} />
      </div>
      {showSettings && (
        <div className="settings-menu" ref={settingsRef}>
          <div className="settings-content">
            <label>
              Gemini API Key:
              <input type="text" value={apiKey} onChange={handleApiKeyChange} />
            </label>
            <button onClick={handleSaveApiKey}>Save</button>
          </div>
        </div>
      )}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            {message.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="chat-input"
          placeholder="Type a message..."
        />
        <button type="submit" className="chat-button">Send</button>
      </form>
    </div>
  );
}

export default App;
