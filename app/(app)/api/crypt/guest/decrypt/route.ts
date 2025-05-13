import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../api/auth/[...nextauth]/route';
import { decrypt } from '@/lib/utils/encryption';

interface DecryptRequest {
  addresses: Array<{
    id_address: string;
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string | null;
    postal_code: string;
    city: string;
    country: string;
    mobile_phone: string;
  }>;
  payments: Array<{
    id_payment_info: string | number;
    card_name: string;
    last_card_digits: string;
    brand?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id_user;
    const guestId = request.headers.get('x-guest-id');

    console.log('[Decrypt API] Requête reçue:', {
      userId,
      guestId,
      headers: Object.fromEntries(request.headers),
      cookies: request.cookies.getAll(),
    });

    // Vérifier que la requête est valide (authentifié ou invité avec guestId)
    if (!userId && !(guestId && guestId !== 'undefined')) {
      console.error('[Decrypt API] Utilisateur non authentifié et aucun guestId fourni');
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body: DecryptRequest = await request.json();
    const { addresses, payments } = body;

    if (!addresses.length && !payments.length) {
      console.error('[Decrypt API] Aucune donnée à déchiffrer');
      return NextResponse.json({ message: 'Aucune donnée à déchiffrer' }, { status: 400 });
    }

    // Vérifier que les données appartiennent à l'utilisateur ou à l'invité
    for (const address of addresses) {
      const order = await prisma.order.findFirst({
        where: {
          id_address: address.id_address,
          ...(userId
            ? { id_user: Number(userId) }
            : { guest_id: guestId }),
        },
      });
      if (!order) {
        console.error('[Decrypt API] Accès non autorisé à l\'adresse:', {
          id_address: address.id_address,
          userId,
          guestId,
        });
        return NextResponse.json(
          { message: 'Accès non autorisé à cette adresse' },
          { status: 403 }
        );
      }
    }

    for (const payment of payments) {
      const order = await prisma.order.findFirst({
        where: {
          id_order: Number(payment.id_payment_info), // Conversion en entier ici
          ...(userId
            ? { id_user: Number(userId) }
            : { guest_id: guestId }),
        },
      });
      if (!order) {
        console.error('[Decrypt API] Accès non autorisé au paiement:', {
          id_payment_info: payment.id_payment_info,
          userId,
          guestId,
        });
        return NextResponse.json(
          { message: 'Accès non autorisé à ce paiement' },
          { status: 403 }
        );
      }
    }

    // Déchiffrer les adresses
    const decryptedAddresses = addresses.map((addr) => {
      const decryptedAddr = {
        ...addr,
        first_name: addr.first_name.includes(":") ? decrypt(addr.first_name) : addr.first_name,
        last_name: addr.last_name.includes(":") ? decrypt(addr.last_name) : addr.last_name,
        address1: addr.address1.includes(":") ? decrypt(addr.address1) : addr.address1,
        address2: addr.address2 && addr.address2.includes(":") ? decrypt(addr.address2) : addr.address2,
        postal_code: addr.postal_code.includes(":") ? decrypt(addr.postal_code, true) : addr.postal_code,
        city: addr.city.includes(":") ? decrypt(addr.city) : addr.city,
        country: addr.country.includes(":") ? decrypt(addr.country) : addr.country,
        mobile_phone: addr.mobile_phone.includes(":") ? decrypt(addr.mobile_phone) : addr.mobile_phone,
      };

      if (!decryptedAddr.first_name || !decryptedAddr.last_name || !decryptedAddr.address1) {
        console.error('[Decrypt API] Données d\'adresse incomplètes après déchiffrement:', { decryptedAddr });
        throw new Error('Échec du déchiffrement: données d\'adresse incomplètes');
      }

      return decryptedAddr;
    });

    // Déchiffrer les paiements
    const decryptedPayments = payments.map((pay) => {
      const decryptedPay = {
        ...pay,
        card_name: pay.card_name.includes(":") ? decrypt(pay.card_name) : pay.card_name,
        last_card_digits: pay.last_card_digits.includes(":") ? decrypt(pay.last_card_digits) : pay.last_card_digits,
      };

      if (!decryptedPay.last_card_digits) {
        console.error('[Decrypt API] Données de paiement incomplètes après déchiffrement:', { decryptedPay });
        throw new Error('Échec du déchiffrement: données de paiement incomplètes');
      }

      return decryptedPay;
    });

    console.log('[Decrypt API] Données déchiffrées:', { decryptedAddresses, decryptedPayments });

    return NextResponse.json({
      addresses: decryptedAddresses,
      payments: decryptedPayments,
    });
  } catch (error: any) {
    console.error('[Decrypt API] Erreur:', {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: 'Erreur lors du déchiffrement', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
