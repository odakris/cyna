// /app/MessageParser.js
class MessageParser {
    constructor(actionProvider, state) {
      this.actionProvider = actionProvider;
      this.state = state;
    }
  
    parse(message) {
      const lowercaseMessage = message.toLowerCase();
  
      if (lowercaseMessage.includes("prix")) {
        this.actionProvider.handlePriceQuery();
      } else if (lowercaseMessage.includes("produit")) {
        this.actionProvider.handleProductQuery();
      } else if (lowercaseMessage.includes("assistance")) {
        this.actionProvider.handleAssistance();
      } else if (lowercaseMessage.includes("humain")) {
        this.actionProvider.handleEscalateToHuman(this.state.userEmail, message);
      } else {
        this.actionProvider.handleDefault(message);
      }
    }
  }
  
  export default MessageParser;