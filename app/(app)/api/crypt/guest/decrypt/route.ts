import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/utils/encryption';

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
    const { addresses, payments } = await req.json();
    console.log('[GuestDecrypt] Données reçues:', { addresses, payments });

    // Déchiffrer les adresses
    const decryptedAddresses = addresses.map((addr: Address) => {
      try {
        return {
          ...addr,
          first_name: addr.first_name.includes(':') ? decrypt(addr.first_name) : addr.first_name,
          last_name: addr.last_name.includes(':') ? decrypt(addr.last_name) : addr.last_name,
          address1: addr.address1.includes(':') ? decrypt(addr.address1) : addr.address1,
          address2: addr.address2 ? (addr.address2.includes(':') ? decrypt(addr.address2) : addr.address2) : undefined,
          postal_code: addr.postal_code.includes(':') ? decrypt(addr.postal_code, true) : addr.postal_code,
          city: addr.city.includes(':') ? decrypt(addr.city) : addr.city,
          country: addr.country.includes(':') ? decrypt(addr.country) : addr.country,
          mobile_phone: addr.mobile_phone.includes(':') ? decrypt(addr.mobile_phone) : addr.mobile_phone,
        };
      } catch (error) {
        console.error('[GuestDecrypt] Échec du déchiffrement de l\'adresse:', { address: addr, error });
        throw new Error('Échec du déchiffrement des données d\'adresse');
      }
    });

    // Déchiffrer les paiements
    const decryptedPayments = payments.map((pay: PaymentInfo) => {
      try {
        return {
          ...pay,
          card_name: pay.card_name.includes(':') ? decrypt(pay.card_name) : pay.card_name,
          last_card_digits: pay.last_card_digits.includes(':') ? decrypt(pay.last_card_digits) : pay.last_card_digits,
        };
      } catch (error) {
        console.error('[GuestDecrypt] Échec du déchiffrement du paiement:', { payment: pay, error });
        throw new Error('Échec du déchiffrement des données de paiement');
      }
    });

    console.log('[GuestDecrypt] Données déchiffrées:', { decryptedAddresses, decryptedPayments });
    return NextResponse.json({ addresses: decryptedAddresses, payments: decryptedPayments }, { status: 200 });
  } catch (error) {
    console.error('[GuestDecrypt] Erreur:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erreur lors du déchiffrement des données invité' },
      { status: 500 }
    );
  }
}