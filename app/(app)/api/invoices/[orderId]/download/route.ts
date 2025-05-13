import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/utils/encryption"
import { hasPermission } from "@/lib/permissions"

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

function isOrderAuthorized(order: any, token: any): boolean {
  // Vérifier si l'utilisateur a la permission orders:view
  if (token && token.role && hasPermission(token.role, "orders:view")) {
    return true
  }

  // Vérification standard pour les propriétaires de la commande
  if (token && (token.id_user || token.email)) {
    return (
      (token.id_user && order.id_user === token.id_user) ||
      (token.email &&
        order.user.email?.toLowerCase() === token.email.toLowerCase())
    )
  }

  return false
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    // Valider orderId
    const params = await context.params
    const orderId = parseInt(params.orderId)
    console.log("[Invoice] orderId:", orderId)

    if (!orderId || isNaN(orderId)) {
      // console.error('[Invoice] Erreur: orderId invalide ou manquant');
      return NextResponse.json(
        { message: "Identifiant de commande requis" },
        { status: 400 }
      )
    }

    // Récupérer le token JWT (NextAuth)
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    console.log("[Invoice] Token (NextAuth):", token)

    // Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { id_order: orderId },
      include: {
        order_items: true,
        address: true,
        user: true,
      },
    })

    console.log(
      "[Invoice] Commande trouvée:",
      order
        ? {
            id_order: order.id_order,
            id_user: order.id_user,
            email: order.user.email,
          }
        : null
    )

    if (!order) {
      // console.error('[Invoice] Erreur: Commande non trouvée');
      return NextResponse.json(
        { message: "Commande introuvable" },
        { status: 404 }
      )
    }

    // Vérifier l'autorisation
    const isAuthorized = isOrderAuthorized(order, token)
    if (!isAuthorized) {
      console.error("[Invoice] Erreur: Non autorisé", {
        raison: token ? "Token invalide ou mismatch" : "Aucun token fourni",
        orderUserId: order.id_user,
        orderEmail: order.user.email,
        tokenUserId: token?.id_user,
        tokenEmail: token?.email,
      })
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    // Déchiffrer les données de l'adresse si nécessaire
    let decryptedAddress: Address = order.address
    const isAddressEncrypted = order.address.first_name.includes(":")
    if (isAddressEncrypted) {
      console.log("[Invoice] Déchiffrement de l'adresse pour orderId:", orderId)
      decryptedAddress = {
        ...order.address,
        first_name: await decrypt(order.address.first_name),
        last_name: await decrypt(order.address.last_name),
        address1: await decrypt(order.address.address1),
        address2: order.address.address2?.includes(":")
          ? await decrypt(order.address.address2)
          : order.address.address2,
        postal_code: await decrypt(order.address.postal_code),
        city: await decrypt(order.address.city),
        country: await decrypt(order.address.country),
        mobile_phone: await decrypt(order.address.mobile_phone),
      }
      console.log("[Invoice] Adresse déchiffrée:", decryptedAddress)
    }

    // Génération du PDF
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontSize = 12

    page.drawText(`Facture #${order.invoice_number}`, {
      x: 50,
      y: height - 50,
      size: 18,
      font,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Client : ${order.user.email}`, {
      x: 50,
      y: height - 80,
      size: fontSize,
      font,
    })

    page.drawText(
      `Adresse : ${decryptedAddress.address1}, ${decryptedAddress.city}, ${decryptedAddress.country}`,
      {
        x: 50,
        y: height - 100,
        size: fontSize,
        font,
      }
    )

    let yPosition = height - 140
    for (const item of order.order_items) {
      page.drawText(
        `Produit #${item.id_product} - ${item.quantity} x ${item.unit_price} €`,
        {
          x: 50,
          y: yPosition,
          size: fontSize,
          font,
        }
      )
      yPosition -= 20
    }

    page.drawText(`Total payé : ${order.total_amount} €`, {
      x: 50,
      y: yPosition - 20,
      size: fontSize,
      font,
    })

    const pdfBytes = await pdfDoc.save()
    console.log("[Invoice] Facture générée pour orderId:", orderId)

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=facture_${order.invoice_number}.pdf`,
      },
    })
  } catch (error) {
    // console.error('[Invoice] Erreur serveur:', error);
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Erreur lors de la génération de la facture",
      },
      { status: 500 }
    )
  }
}
