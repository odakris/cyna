import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/utils/encryption';
import { getServerSession } from 'next-auth';

interface Address {
  id_address: string;
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
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
    const session = await getServerSession();
    const userId = req.headers.get('x-user-id');
    
    if (!session || !userId || session.user?.id_user !== parseInt(userId)) {
      console.error('[UserEncrypt] Authentification échouée:', { session, userId });
      return NextResponse.json(
        { message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const { addresses, payments } = await req.json();
    console.log('[UserEncrypt] Données reçues:', { addresses, payments });

    const encryptedAddresses = addresses.map((addr: Address) => {
      try {
        return {
          ...addr,
          first_name: encrypt(addr.first_name),
          last_name: encrypt(addr.last_name),
          address1: encrypt(addr.address1),
          address2: addr.address2 ? encrypt(addr.address2) : undefined,
          postal_code: encrypt(addr.postal_code, true),
          city: encrypt(addr.city),
          country: encrypt(addr.country),
          mobile_phone: encrypt(addr.mobile_phone),
        };
      } catch (error) {
        console.error('[UserEncrypt] Échec du chiffrement de l\'adresse:', { address: addr, error });
        throw new Error('Échec du chiffrement des données d\'adresse');
      }
    });

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
    console.error('[UserEncrypt] Erreur:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erreur lors du chiffrement des données utilisateur' },
      { status: 500 }
    );
  }
}