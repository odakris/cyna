// /app/chatbotConfig.js
import ActionProvider from "./ActionProvider";
import MessageParser from "./MessageParser";

const config = {
  initialMessages: [{ type: "bot", text: "Bonjour ! Comment puis-je vous aider aujourd'hui ?" }],
  botName: "Assistant",
  customComponents: {},
  state: {
    userEmail: null, // Stocke l'email de l'utilisateur s'il est connecté ou saisi
  },
};

export default config;