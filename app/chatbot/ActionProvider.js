// /app/ActionProvider.js
class ActionProvider {
  constructor(createChatBotMessage, setState, createClientMessage, stateRef, createCustomMessage) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setState;
    this.createClientMessage = createClientMessage;
    this.stateRef = stateRef;
    this.createCustomMessage = createCustomMessage;
  }

  handlePriceQuery = () => {
    const message = this.createChatBotMessage("Nos prix varient selon les produits. Consultez notre page produits pour plus de détails !");
    this.addMessageToState(message);
  };

  handleProductQuery = () => {
    const message = this.createChatBotMessage("Nous proposons des produits comme Diagnostic Cyber et Test d'intrusion. Voulez-vous en savoir plus ?");
    this.addMessageToState(message);
  };

  handleAssistance = () => {
    const message = this.createChatBotMessage("Pour une assistance technique, décrivez votre problème ou tapez 'humain' pour parler à un agent.");
    this.addMessageToState(message);
  };

  handleDefault = (message) => {
    const response = this.createChatBotMessage("Je ne suis pas sûr de comprendre. Tapez 'humain' pour une assistance personnalisée ou utilisez notre formulaire de contact.");
    this.addMessageToState(response);
  };

  handleEscalateToHuman = async (userEmail, question) => {
    const conversationData = {
      statut_conversation: "en cours",
      date_demarrage: new Date(),
      utilisateur_email: userEmail || "inconnu",
      id_client: null, // À récupérer si l'utilisateur est connecté
      messages: this.stateRef.current.messages.map((msg) => ({
        message: msg.text,
        type_message: msg.type,
        date_message: new Date(),
      })),
    };

    try {
      const response = await fetch("/api/chat/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(conversationData),
      });
      if (response.ok) {
        const escalationMessage = this.createChatBotMessage("Un humain vous contactera bientôt. Merci de votre patience !");
        this.addMessageToState(escalationMessage);
      }
    } catch (error) {
      console.error("Erreur lors de l'escalade :", error);
    }
  };

  addMessageToState = (message) => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  };
}

export default ActionProvider;