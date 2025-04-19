import Stripe from "stripe";
import cartService from "./cartService"; // Import par défaut
import { CartItem } from "./cartService"; // Import nommé
import { CheckoutRepository, Transaction } from "../repositories/CheckoutRepository";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export class CheckoutService {
  private checkoutRepository: CheckoutRepository;

  constructor() {
    this.checkoutRepository = new CheckoutRepository();
  }

  async createCheckoutSession(sessionId: number, successUrl: string, cancelUrl: string) {
    const cart = await cartService.getCartItems(sessionId);
    if (!cart || cart.length === 0) {
      throw new Error("Panier vide");
    }

    const totalAmount = cartService.calculateCartTotal(cart);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cart.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
            metadata: { subscription: item.subscription || "MONTHLY" },
          },
          unit_amount: Math.round(
            (item.subscription === "YEARLY" ? item.price * 12 : item.price) * 100
          ),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    await this.checkoutRepository.createTransaction({
      stripeCheckoutId: session.id,
      userId: null, // Pas d'utilisateur connecté requis pour le moment
      amount: totalAmount,
      currency: "eur",
      status: "pending",
      cartItems: cart,
    });

    return session;
  }

  async handleWebhookEvent(event: Stripe.Event) {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.checkoutRepository.updateTransactionStatus(session.id, "succeeded");
    }
  }
}