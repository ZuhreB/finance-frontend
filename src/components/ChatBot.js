import React, { useState, useRef, useEffect } from 'react';
import '../styles/ChatBot.css'; 

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (input.trim() === '') return;

        const userMessage = { text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        try {
            const response = await fetch('http://localhost:8080/api/ai/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token') // JWT token
            },
            body: JSON.stringify({ message: input })
            });
            if (!response.ok) {
                throw new Error('API yanıtı başarısız oldu.');
            }

            const data = await response.json();
            const aiMessage = { text: data.response, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("AI ile sohbet hatası:", error);
            const errorMessage = { text: "Üzgünüm, şu anda sohbet edemiyorum. Lütfen daha sonra tekrar deneyin.", sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    return (
        <div className="chatbot-container">
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <span>AI Asistan</span>
                        <button onClick={() => setIsOpen(false)}>&times;</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <p>{msg.text}</p>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chatbot-input-form" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Bir soru sor..."
                        />
                        <button type="submit">Gönder</button>
                    </form>
                </div>
            )}
            <button
                className="chatbot-toggle-button"
                onClick={() => setIsOpen(!isOpen)}
            >
                AI
            </button>
        </div>
    );
};

export default ChatBot;