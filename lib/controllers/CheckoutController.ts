import { CheckoutService } from "../services/checkoutService";
import cartService from "../services/cartService";
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

export class CheckoutController {
  private checkoutService: CheckoutService;

  constructor() {
    this.checkoutService = new CheckoutService();
  }

  async createCheckoutSession(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { sessionToken }: { sessionToken: string } = req.body;
      if (!sessionToken) {
        return res.status(400).json({ error: "Token de session requis" });
      }

      const session = await cartService.getSessionByToken(sessionToken);
      if (!session) {
        return res.status(400).json({ error: "Session invalide" });
      }

      const successUrl = `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${req.headers.origin}/cart`;

      const stripeSession = await this.checkoutService.createCheckoutSession(
        session.id_session,
        successUrl,
        cancelUrl
      );
      return res.status(200).json({ sessionId: stripeSession.id });
    } catch (error) {
      console.error("Erreur lors de la création de la session:", error);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  async handleWebhook(req: NextApiRequest, res: NextApiResponse) {
    try {
      const event = req.body as Stripe.Event;
      await this.checkoutService.handleWebhookEvent(event);
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Erreur lors du traitement du webhook:", error);
      return res.status(400).json({ error: "Erreur webhook" });
    }
  }
}