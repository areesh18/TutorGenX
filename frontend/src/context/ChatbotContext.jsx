// frontend/src/context/ChatbotContext.jsx
import React, { createContext, useState, useContext } from 'react';

const ChatbotContext = createContext();

export const useChatbotContext = () => useContext(ChatbotContext);

export const ChatbotProvider = ({ children }) => {
    const [learningContext, setLearningContext] = useState({
        topic: '',
        explanation: ''
    });

    return (
        <ChatbotContext.Provider value={{ learningContext, setLearningContext }}>
            {children}
        </ChatbotContext.Provider>
    );
};