import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(request: Request) {
  try {
    const { sessionToken, cart, addressId, paymentId, guestEmail, guestAddress, guestPayment } =
      await request.json();
    console.log('[API Checkout] Requête reçue:', {
      sessionToken,
      cartLength: cart?.length,
      addressId,
      paymentId,
      guestEmail,
    });

    if (!cart || cart.length === 0) {
      console.error('[API Checkout] Panier vide ou invalide');
      return NextResponse.json({ message: 'Panier vide ou invalide' }, { status: 400 });
    }

    let customerId: string;
    let addressData: any;
    let paymentMethodId: string;
    let userId: number;

    // Calculer le total et le sous-total
    const subtotal = cart.reduce((sum: number, item: any) => {
      let unitPrice = item.price;
      switch (item.subscription || 'MONTHLY') {
        case 'MONTHLY':
          unitPrice = item.price;
          break;
        case 'YEARLY':
          unitPrice = item.price * 12;
          break;
        case 'PER_USER':
          unitPrice = item.price;
          break;
        case 'PER_MACHINE':
          unitPrice = item.price;
          break;
        default:
          unitPrice = item.price;
      }
      return sum + unitPrice * item.quantity;
    }, 0);
    const totalAmount = subtotal * 1.2; // Inclut 20% de taxes

    if (sessionToken) {
      // Utilisateur connecté
      if (!addressId || !paymentId) {
        console.error('[API Checkout] Adresse ou moyen de paiement manquant');
        return NextResponse.json(
          { message: 'Adresse et moyen de paiement requis' },
          { status: 400 }
        );
      }

      userId = parseInt(sessionToken);
      const user = await prisma.user.findUnique({
        where: { id_user: userId },
        select: { stripeCustomerId: true },
      });

      if (!user || !user.stripeCustomerId) {
        console.error('[API Checkout] Utilisateur ou client Stripe non trouvé');
        return NextResponse.json({ message: 'Utilisateur invalide' }, { status: 400 });
      }
      customerId = user.stripeCustomerId;

      const address = await prisma.address.findUnique({
        where: { id_address: parseInt(addressId) },
      });
      if (!address) {
        console.error('[API Checkout] Adresse non trouvée');
        return NextResponse.json({ message: 'Adresse non trouvée' }, { status: 400 });
      }
      addressData = {
        name: `${address.first_name} ${address.last_name}`,
        address: {
          line1: address.address1,
          line2: address.address2 || undefined,
          postal_code: address.postal_code,
          city: address.city,
          country: address.country,
        },
        phone: address.mobile_phone,
      };

      const paymentInfo = await prisma.paymentInfo.findUnique({
        where: { id_payment_info: parseInt(paymentId) },
      });
      if (!paymentInfo || !paymentInfo.stripe_payment_id) {
        console.error('[API Checkout] Moyen de paiement non trouvé');
        return NextResponse.json({ message: 'Moyen de paiement non trouvé' }, { status: 400 });
      }
      paymentMethodId = paymentInfo.stripe_payment_id;
    } else if (guestEmail && guestAddress && guestPayment) {
      // Utilisateur invité
      // Créer un utilisateur temporaire
      const guestUser = await prisma.user.create({
        data: {
          email: guestEmail,
          isGuest: true,
          role: 'CUSTOMER',
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      userId = guestUser.id_user;

      // Créer une adresse temporaire
      const guestAddressRecord = await prisma.address.create({
        data: {
          id_user: userId,
          first_name: guestAddress.first_name,
          last_name: guestAddress.last_name,
          address1: guestAddress.address1,
          address2: guestAddress.address2,
          postal_code: guestAddress.postal_code,
          city: guestAddress.city,
          region: guestAddress.region || guestAddress.city,
          country: guestAddress.country,
          mobile_phone: guestAddress.mobile_phone,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Créer un moyen de paiement temporaire
      const guestPaymentRecord = await prisma.paymentInfo.create({
        data: {
          id_user: userId,
          card_name: guestPayment.card_name,
          brand: guestPayment.brand || 'unknown',
          last_card_digits: guestPayment.last_card_digits,
          stripe_payment_id: guestPayment.stripe_payment_id,
          exp_month: guestPayment.exp_month || 12,
          exp_year: guestPayment.exp_year || 2025,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      const customer = await stripe.customers.create({
        email: guestEmail,
        name: `${guestAddress.first_name} ${guestAddress.last_name}`,
        address: {
          line1: guestAddress.address1,
          line2: guestAddress.address2 || undefined,
          postal_code: guestAddress.postal_code,
          city: guestAddress.city,
          country: guestAddress.country,
        },
        phone: guestAddress.mobile_phone,
      });
      customerId = customer.id;

      addressData = {
        name: `${guestAddress.first_name} ${guestAddress.last_name}`,
        address: {
          line1: guestAddress.address1,
          line2: guestAddress.address2 || undefined,
          postal_code: guestAddress.postal_code,
          city: guestAddress.city,
          country: guestAddress.country,
        },
        phone: guestAddress.mobile_phone,
      };

      paymentMethodId = guestPayment.stripe_payment_id;

      // Mettre à jour l'utilisateur avec stripeCustomerId
      await prisma.user.update({
        where: { id_user: userId },
        data: { stripeCustomerId: customerId },
      });
    } else {
      console.error('[API Checkout] Données utilisateur ou invité manquantes');
      return NextResponse.json(
        { message: 'Données utilisateur ou invité manquantes' },
        { status: 400 }
      );
    }

    // Créer un ordre temporaire
    const invoiceNumber = `INV-${nanoid(8)}`;
    const order = await prisma.order.create({
      data: {
        id_user: userId,
        id_address: sessionToken ? parseInt(addressId) : (await prisma.address.findFirst({ where: { id_user: userId } }))!.id_address,
        total_amount: totalAmount,
        subtotal,
        order_status: 'PENDING',
        payment_method: 'card',
        last_card_digits: (await prisma.paymentInfo.findFirst({ where: { id_user: userId } }))?.last_card_digits || '****',
        invoice_number: invoiceNumber,
        order_date: new Date(),
        order_items: {
          create: cart.map((item: any) => ({
            id_product: parseInt(item.id),
            quantity: item.quantity,
            unit_price: item.price,
            subscription_type: item.subscription || 'MONTHLY',
            subscription_status: 'PENDING',
            subscription_duration: item.subscription === 'YEARLY' ? 12 : 1,
            renewal_date: new Date(Date.now() + (item.subscription === 'YEARLY' ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)),
          })),
        },
      },
    });

    const lineItems = cart.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
          metadata: {
            productId: item.id,
            subscriptionType: item.subscription || 'MONTHLY',
          },
        },
        unit_amount: Math.round(
          (item.price * (item.subscription === 'YEARLY' ? 12 : 1)) * 100
        ),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      payment_method: paymentMethodId,
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=Paiement%20annulé`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['FR', 'US', 'CA', 'GB', 'DE'],
      },
      metadata: {
        orderId: order.id_order.toString(),
        sessionToken: sessionToken || 'guest',
        addressId: addressId?.toString() || 'guest',
        paymentId: paymentId?.toString() || 'guest',
        guestEmail: guestEmail || '',
      },
    });
    
    console.log('[API Checkout] Session Stripe créée:', { sessionId: session.id, clientSecret: session.client_secret });
    
    // Renvoyer le clientSecret au frontend
    return NextResponse.json({ clientSecret: session.client_secret }, { status: 200 });
    
  } catch (error: any) {
    console.error('[API Checkout] Erreur:', error);
    return NextResponse.json(
      { message: 'Erreur lors de la création de la session de paiement', error: error.message },
      { status: 500 }
    );
  }
}