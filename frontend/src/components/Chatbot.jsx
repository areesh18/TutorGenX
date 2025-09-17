// frontend/src/components/Chatbot.jsx
import React, { useState, useEffect } from 'react';
import Chatbot, { createChatBotMessage } from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import './Chatbot.css';
import { useChatbotContext } from '../context/ChatbotContext'; // Import the context hook

const MyMessageParser = ({ children, actions }) => {
    const parse = (message) => {
        actions.sendMessage(message);
    };

    return (
        <div>
            {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    parse: parse,
                    actions,
                });
            })}
        </div>
    );
};

const MyActionProvider = ({ createChatBotMessage, setState, children }) => {
    const { learningContext } = useChatbotContext(); // Get the learning context
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = new WebSocket("ws://localhost:8080/ws");
        newSocket.onopen = () => console.log("WebSocket connected");
        newSocket.onclose = () => console.log("WebSocket disconnected");
        newSocket.onerror = (error) => console.error("WebSocket error:", error);

        newSocket.onmessage = (event) => {
            const botMessage = createChatBotMessage(event.data);
            setState((prev) => ({
                ...prev,
                messages: [...prev.messages, botMessage],
            }));
        };

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    const sendMessage = (message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            const payload = JSON.stringify({
                message: message,
                context: learningContext, // Include the context
            });
            socket.send(payload);
        }
    };

    return (
        <div>
            {React.Children.map(children, (child) => {
                return React.cloneElement(child, {
                    actions: {
                        sendMessage,
                    },
                });
            })}
        </div>
    );
};


const config = {
    initialMessages: [createChatBotMessage("Hi! I'm TutorBot. Ask me anything about the topic you're currently studying.")],
    botName: "TutorBot",
    customStyles: {
        botMessageBox: {
            backgroundColor: '#3B82F6',
        },
        chatButton: {
            backgroundColor: '#3B82F6',
        },
    },
};


const MyChatbot = () => {
    return (
        <Chatbot
            config={config}
            messageParser={MyMessageParser}
            actionProvider={MyActionProvider}
        />
    );
};

export default MyChatbot;