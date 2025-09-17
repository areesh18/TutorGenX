import React from 'react';
import Chatbot, { createChatBotMessage } from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';

const config = {
  initialMessages: [createChatBotMessage(`Hello! How can I help you today?`)],
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

const MessageParser = ({ children, actions }) => {
  const parse = (message) => {
    // This is where you would add your logic to handle user messages
    // For now, it just gives a generic response.
    actions.handleGenericResponse();
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

const ActionProvider = ({ createChatBotMessage, setState, children }) => {
  const handleGenericResponse = () => {
    const botMessage = createChatBotMessage("I'm still learning, but I'm here to help!");

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, botMessage],
    }));
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          actions: {
            handleGenericResponse,
          },
        });
      })}
    </div>
  );
};

const MyChatbot = () => {
  return (
    <Chatbot
      config={config}
      messageParser={MessageParser}
      actionProvider={ActionProvider}
    />
  );
};

export default MyChatbot;