import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { decrypt } from '@/lib/utils/encryption'
import { authOptions } from "../../../auth/[...nextauth]/route"

interface Address {
  id_address: string
  first_name: string
  last_name: string
  address1: string
  address2?: string | null
  postal_code: string
  city: string
  country: string
  mobile_phone: string
}

interface PaymentInfo {
  id_payment_info: string | number
  card_name: string
  last_card_digits: string
}

export async function POST(req: NextRequest) {
  try {
    // Récupérer la session avec authOptions
    const session = await getServerSession(authOptions)
    const userId = req.headers.get('x-user-id')

    // Logs détaillés pour le débogage
    console.log('[UserDecrypt] Session:', session)
    console.log('[UserDecrypt] x-user-id header:', userId)
    console.log('[UserDecrypt] session.user.id_user:', session?.user?.id_user)

    // Vérification de l'authentification
    if (!session) {
      // console.error('[UserDecrypt] Erreur: Aucune session trouvée')
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }
    if (!userId) {
      // console.error('[UserDecrypt] Erreur: En-tête x-user-id manquant')
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }
    if (!session.user.id_user) {
      // console.error('[UserDecrypt] Erreur: session.user.id_user est indéfini')
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }
    if (parseInt(userId) !== session.user.id_user) {
      /*console.error('[UserDecrypt] Erreur: userId ne correspond pas', {
        userId,
        sessionUserId: session.user.id_user,
      })*/
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les données envoyées
    const { addresses, payments } = await req.json()
    console.log('[UserDecrypt] Données reçues:', { addresses, payments })

    // Déchiffrement des adresses
    const decryptedAddresses = await Promise.all(
      addresses.map(async (addr: Address) => ({
        ...addr,
        first_name: addr.first_name.includes(':') ? await decrypt(addr.first_name) : addr.first_name,
        last_name: addr.last_name.includes(':') ? await decrypt(addr.last_name) : addr.last_name,
        address1: addr.address1.includes(':') ? await decrypt(addr.address1) : addr.address1,
        address2: addr.address2?.includes(':') ? await decrypt(addr.address2) : addr.address2,
        postal_code: addr.postal_code.includes(':') ? await decrypt(addr.postal_code) : addr.postal_code,
        city: addr.city.includes(':') ? await decrypt(addr.city) : addr.city,
        country: addr.country.includes(':') ? await decrypt(addr.country) : addr.country,
        mobile_phone: addr.mobile_phone.includes(':') ? await decrypt(addr.mobile_phone) : addr.mobile_phone,
      }))
    )

    // Déchiffrement des informations de paiement
    const decryptedPayments = await Promise.all(
      payments.map(async (pay: PaymentInfo) => ({
        ...pay,
        last_card_digits: pay.last_card_digits.includes(':') ? await decrypt(pay.last_card_digits) : pay.last_card_digits,
      }))
    )

    console.log('[UserDecrypt] Données déchiffrées:', { decryptedAddresses, decryptedPayments })

    return NextResponse.json({ addresses: decryptedAddresses, payments: decryptedPayments })
  } catch (error) {
    // console.error('[UserDecrypt] Erreur serveur:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}