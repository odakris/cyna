import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import cartService from "@/lib/services/cartService";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
    }

    // Vérification de token.id
    if (!token.id || (typeof token.id !== "string" && typeof token.id !== "number")) {
      return NextResponse.json({ error: "ID utilisateur invalide" }, { status: 400 });
    }
    const userId = parseInt(token.id.toString()); // Convertir en chaîne avant parseInt

    const { cartItems, addressId, paymentId } = await request.json();
    if (!cartItems || !addressId || !paymentId) {
      return NextResponse.json(
        { error: "cartItems, addressId et paymentId sont requis" },
        { status: 400 }
      );
    }

    const sessionToken = request.cookies.get("next-auth.session-token")?.value;
    if (!sessionToken || typeof sessionToken !== "string") {
      return NextResponse.json({ error: "Session token invalide ou manquant" }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { session_token: sessionToken },
    });

    if (!session) {
      return NextResponse.json({ error: "Session invalide" }, { status: 400 });
    }

    const paymentInfo = await prisma.paymentInfo.findUnique({
      where: { id_payment_info: paymentId },
    });

    const order = await prisma.order.create({
      data: {
        id_user: userId, // Utiliser userId après vérification
        id_address: addressId,
        order_date: new Date(),
        total_amount: cartItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0),
        subtotal: cartItems.reduce((sum: number, item: any) => sum + item.totalPrice, 0),
        order_status: "COMPLETED",
        payment_method: "card",
        last_card_digits: paymentInfo?.last_card_digits,
        invoice_number: `INV-${Date.now()}`,
        order_items: {
          create: cartItems.map((item: any) => ({
            id_product: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.unitPrice,
            subscription_type: item.subscriptionType,
            subscription_status: "ACTIVE",
            subscription_duration: item.subscriptionType === "MONTHLY" ? 1 : 12,
            renewal_date: new Date(
              Date.now() + (item.subscriptionType === "MONTHLY" ? 30 : 365) * 24 * 60 * 60 * 1000
            ),
          })),
        },
      },
    });

    await cartService.clearCart(session.id_session);

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
    const message = error instanceof Error ? error.message : "Une erreur est survenue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}