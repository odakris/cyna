import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../api/auth/[...nextauth]/route';
import { encrypt } from '@/lib/utils/encryption';

interface Address {
  id_address: string;
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string | null;
  postal_code: string;
  city: string;
  country: string;
  mobile_phone: string;
}

interface PaymentInfo {
  id_payment_info: string;
  card_name: string;
  last_card_digits: string;
  stripe_payment_id?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Récupérer la session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id_user ?? null;
    let guestId = req.headers.get('x-guest-id');

    // Vérifier les variations de casse pour x-guest-id
    if (!guestId) {
      guestId =
        req.headers.get('X-Guest-Id') ||
        req.headers.get('x-guest-id'.toLowerCase()) ||
        null;
    }

    console.log('[UserEncrypt] Requête reçue:', {
      userId,
      guestId,
      headers: Object.fromEntries(req.headers),
      cookies: req.cookies.get('next-auth.session-token')?.value ?? 'aucun cookie',
      session: session ? {
        user: {
          id_user: session.user.id_user,
          email: session.user.email,
          first_name: session.user.first_name,
          last_name: session.user.last_name,
          role: session.user.role,
          isGuest: session.user.isGuest,
        },
      } : 'aucune session',
      nextAuthSecretDefined: !!process.env.NEXTAUTH_SECRET,
    });

    // Vérifier l'autorisation
    if (!userId && !guestId) {
      console.error('[UserEncrypt] Authentification échouée:', {
        session,
        userId,
        guestId,
        headers: Object.fromEntries(req.headers),
        cookies: req.cookies.get('next-auth.session-token')?.value ?? 'aucun cookie',
      });
      return NextResponse.json(
        {
          message: 'Non autorisé',
          details: {
            userIdMissing: !userId,
            guestIdMissing: !guestId,
            sessionPresent: !!session,
            sessionUser: session?.user ?? null,
            cookiesPresent: !!req.cookies.get('next-auth.session-token'),
          },
        },
        { status: 401 }
      );
    }

    console.log('[UserEncrypt] Accès autorisé pour:', userId ? `userId=${userId}` : `guestId=${guestId}`);

    const { addresses, payments } = await req.json();
    console.log('[UserEncrypt] Données reçues:', { addresses, payments });

    // Valider les données
    if (!Array.isArray(addresses) || !Array.isArray(payments)) {
      console.error('[UserEncrypt] Données invalides:', { addresses, payments });
      return NextResponse.json(
        { message: 'Les données doivent être des tableaux d\'adresses et de paiements' },
        { status: 400 }
      );
    }

    // Valider les champs obligatoires pour les adresses
    for (const addr of addresses) {
      if (!addr.first_name || !addr.last_name || !addr.address1 || !addr.postal_code) {
        console.error('[UserEncrypt] Champs d\'adresse manquants:', { address: addr });
        return NextResponse.json(
          { message: 'Champs obligatoires manquants dans les données d\'adresse' },
          { status: 400 }
        );
      }
    }

    // Valider les champs obligatoires pour les paiements
    for (const pay of payments) {
      if (!pay.card_name || !pay.last_card_digits) {
        console.error('[UserEncrypt] Champs de paiement manquants:', { payment: pay });
        return NextResponse.json(
          { message: 'Champs obligatoires manquants dans les données de paiement' },
          { status: 400 }
        );
      }
    }

    // Chiffrer les adresses
    const encryptedAddresses = addresses.map((addr: Address) => {
      try {
        return {
          ...addr,
          first_name: encrypt(addr.first_name),
          last_name: encrypt(addr.last_name),
          address1: encrypt(addr.address1),
          address2: addr.address2 ? encrypt(addr.address2) : null,
          postal_code: encrypt(addr.postal_code, true),
          city: encrypt(addr.city),
          country: encrypt(addr.country),
          mobile_phone: encrypt(addr.mobile_phone || ''),
        };
      } catch (error) {
        console.error('[UserEncrypt] Échec du chiffrement de l\'adresse:', { address: addr, error });
        throw new Error('Échec du chiffrement des données d\'adresse');
      }
    });

    // Chiffrer les paiements
    const encryptedPayments = payments.map((pay: PaymentInfo) => {
      try {
        return {
          ...pay,
          card_name: encrypt(pay.card_name),
          last_card_digits: encrypt(pay.last_card_digits),
        };
      } catch (error) {
        console.error('[UserEncrypt] Échec du chiffrement du paiement:', { payment: pay, error });
        throw new Error('Échec du chiffrement des données de paiement');
      }
    });

    console.log('[UserEncrypt] Données chiffrées:', { encryptedAddresses, encryptedPayments });
    return NextResponse.json({ addresses: encryptedAddresses, payments: encryptedPayments }, { status: 200 });
  } catch (error) {
    console.error('[UserEncrypt] Erreur inattendue:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erreur lors du chiffrement des données' },
      { status: 500 }
    );
  }
}