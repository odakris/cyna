// utils/invoice-generator.ts
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

export interface Address {
  id_address: string
  first_name: string
  last_name: string
  address1: string
  address2?: string | null
  postal_code: string
  city: string
  country: string
  mobile_phone?: string | null
  region?: string | null
  email?: string
}

export interface OrderItem {
  id?: string | number // ID du produit
  name: string // Nom du produit
  price: number // Prix unitaire
  quantity: number // Quantité
  subscription?: string // Type d'abonnement
  description?: string // Description du produit
  technical_specs?: string // Spécifications techniques
  imageUrl?: string // URL de l'image
}

export interface OrderData {
  id_order: string | number // ID de la commande
  invoice_number?: string // Numéro de facture
  total_amount: number // Montant total
  taxes?: number // Taxes
  order_date?: string | Date // Date de commande
  payment_method?: string // Méthode de paiement
  order_status?: string // Statut de la commande
  last_card_digits?: string // Derniers chiffres de la carte
}

/**
 * Charge le logo en fonction de l'environnement (navigateur ou serveur)
 */
async function loadLogo(
  pdfDoc: PDFDocument
): Promise<{ image: any; width: number; height: number } | null> {
  try {
    // Déterminer si on est dans un environnement navigateur
    const isBrowser = typeof window !== "undefined"

    let logoData: Uint8Array

    if (isBrowser) {
      // Approche navigateur - utilise fetch
      try {
        const logoResponse = await fetch("/logo.jpeg")
        const logoArrayBuffer = await logoResponse.arrayBuffer()
        logoData = new Uint8Array(logoArrayBuffer)
      } catch (err) {
        console.error("[InvoiceGenerator] Erreur fetch logo (navigateur):", err)
        return null
      }
    } else {
      // Approche serveur - importe dynamiquement fs et path
      try {
        // Import dynamique des modules Node.js
        // const fs = await import("fs").then(module => module.default || module)
        const path = await import("path").then(
          module => module.default || module
        )

        const logoPath = path.join(process.cwd(), "public", "logo.jpeg")
        logoData = await fs.promises.readFile(logoPath)
      } catch (err) {
        console.error("[InvoiceGenerator] Erreur lecture logo (serveur):", err)
        return null
      }
    }

    const logoImage = await pdfDoc.embedJpg(logoData)
    // Logo plus petit (échelle à 0.25)
    const logoDims = logoImage.scale(0.25)

    return {
      image: logoImage,
      width: logoDims.width,
      height: logoDims.height,
    }
  } catch (err) {
    console.error("[InvoiceGenerator] Erreur lors du chargement du logo:", err)
    return null
  }
}

/**
 * Tronque un texte à une longueur maximum
 */
function truncateText(text: string, maxLength: number): string {
  if (!text) return ""
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + "..."
}

/**
 * Génère une facture PDF professionnelle
 */
export async function generateInvoicePDF(
  order: OrderData,
  address: Address,
  items: OrderItem[],
  customerEmail?: string
): Promise<Uint8Array> {
  console.log("[InvoiceGenerator] Génération PDF pour la commande:", {
    orderId: order.id_order,
  })

  if (!address) {
    console.error("[InvoiceGenerator] Adresse manquante pour générer le PDF")
    throw new Error("Adresse manquante pour la génération de la facture")
  }

  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // Format A4
  const { width, height } = page.getSize()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const helveticaOblique = await pdfDoc.embedFont(
    StandardFonts.HelveticaOblique
  )

  // Couleurs CYNA
  const primaryColor = rgb(48 / 255, 32 / 255, 130 / 255) // #302082
  const secondaryColor = rgb(255 / 255, 107 / 255, 0 / 255) // #FF6B00
  const grayColor = rgb(0.5, 0.5, 0.5) // Gris pour le texte secondaire
  const lightGrayColor = rgb(0.95, 0.95, 0.95) // Gris clair pour les fonds

  // Chargement et insertion du logo
  const logoResult = await loadLogo(pdfDoc)
  if (logoResult) {
    // Positionnement en haut à gauche, plus petit
    page.drawImage(logoResult.image, {
      x: 50,
      y: height - 80, // Plus haut
      width: logoResult.width,
      height: logoResult.height,
    })
  }

  // En-tête principal
  page.drawRectangle({
    x: 50,
    y: height - 110, // Plus haut que dans la version précédente
    width: width - 100,
    height: 40,
    color: lightGrayColor,
    borderColor: primaryColor,
    borderWidth: 1,
  })

  page.drawText("FACTURE", {
    x: width / 2 - 40,
    y: height - 95,
    size: 20,
    font: helveticaBold,
    color: primaryColor,
  })

  // Infos facture (partie droite)
  const invoiceNumber = order.invoice_number || `F-${order.id_order}`
  page.drawText(`N° Facture: ${invoiceNumber}`, {
    x: 350,
    y: height - 140,
    size: 10,
    font: helveticaBold,
    color: primaryColor,
  })

  page.drawText(`N° Commande: ${order.id_order}`, {
    x: 350,
    y: height - 160,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  // Formatage de la date dans un format français
  const dateStr = order.order_date
    ? new Date(order.order_date).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })

  page.drawText(`Date: ${dateStr}`, {
    x: 350,
    y: height - 180,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  // Ajout de la méthode de paiement si disponible
  if (order.payment_method) {
    let paymentText = `Paiement: ${order.payment_method}`
    if (order.last_card_digits) {
      paymentText += ` (**** ${order.last_card_digits})`
    }

    page.drawText(paymentText, {
      x: 350,
      y: height - 200,
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    })
  }

  // Ajout du statut de commande si disponible
  if (order.order_status) {
    let statusColor = rgb(0, 0, 0)
    // Coloriser le statut en fonction de sa valeur
    switch (order.order_status.toUpperCase()) {
      case "COMPLETED":
      case "PAID":
      case "ACTIVE":
        statusColor = rgb(0, 0.5, 0) // Vert
        break
      case "PENDING":
        statusColor = rgb(0.9, 0.6, 0) // Orange
        break
      case "CANCELLED":
        statusColor = rgb(0.8, 0, 0) // Rouge
        break
    }

    page.drawText(`Statut: ${order.order_status}`, {
      x: 350,
      y: height - 220,
      size: 10,
      font: helveticaBold,
      color: statusColor,
    })
  }

  // Coordonnées entreprise (partie gauche)
  page.drawText("CYNA", {
    x: 50,
    y: height - 140,
    size: 12,
    font: helveticaBold,
    color: primaryColor,
  })

  page.drawText("123 rue des Entreprises", {
    x: 50,
    y: height - 160,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  page.drawText("75000 Paris, France", {
    x: 50,
    y: height - 175,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  page.drawText("SIRET: 123 456 789 00012", {
    x: 50,
    y: height - 190,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  page.drawText("TVA: FR 12 345678900", {
    x: 50,
    y: height - 205,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  page.drawText("Email: contact@cyna.com", {
    x: 50,
    y: height - 220,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  // Informations client - CORRECTION pour l'adresse de l'acheteur
  page.drawRectangle({
    x: 50,
    y: height - 280,
    width: width - 100,
    height: 30,
    color: lightGrayColor,
    borderColor: primaryColor,
    borderWidth: 1,
  })

  page.drawText("FACTURER À", {
    x: 60,
    y: height - 270,
    size: 12,
    font: helveticaBold,
    color: primaryColor,
  })

  // Vérification que les champs de l'adresse existent
  const firstName = address.first_name || ""
  const lastName = address.last_name || ""
  const fullName = `${firstName} ${lastName}`.trim() || "Client"

  page.drawText(fullName, {
    x: 50,
    y: height - 300,
    size: 10,
    font: helveticaBold, // En gras pour le nom
    color: rgb(0, 0, 0),
  })

  // Ligne d'adresse 1 - obligatoire
  if (address.address1) {
    page.drawText(address.address1, {
      x: 50,
      y: height - 315,
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    })
  }

  // Déterminer la position Y pour les éléments suivants
  let addressY = height - 330

  // Ligne d'adresse 2 - facultatif
  if (address.address2) {
    page.drawText(address.address2, {
      x: 50,
      y: addressY,
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    })
    addressY -= 15
  }

  // Code postal, ville et pays
  const postalCode = address.postal_code || ""
  const city = address.city || ""
  const country = address.country || ""

  if (postalCode || city || country) {
    const locationText = [postalCode, city, country].filter(Boolean).join(", ")

    page.drawText(locationText, {
      x: 50,
      y: addressY,
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    })
    addressY -= 15
  }

  // Email
  const emailToUse = customerEmail || address.email || "Non spécifié"
  page.drawText(`Email: ${emailToUse}`, {
    x: 50,
    y: addressY,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })
  addressY -= 15

  // Téléphone s'il est disponible
  if (address.mobile_phone) {
    page.drawText(`Téléphone: ${address.mobile_phone}`, {
      x: 50,
      y: addressY,
      size: 10,
      font: helvetica,
      color: rgb(0, 0, 0),
    })
    addressY -= 15
  }

  // Tableau des articles - avec entêtes explicites
  const tableTop = addressY - 25 // Ajuster en fonction de l'espace disponible

  // En-tête du tableau
  page.drawRectangle({
    x: 50,
    y: tableTop,
    width: width - 100,
    height: 30,
    color: primaryColor,
  })

  // Colonnes du tableau avec libellés plus précis
  const col1 = 60 // Référence
  const col2 = 110 // Description
  const col3 = 340 // Quantité
  const col4 = 380 // Prix unitaire HT
  const col5 = 440 // Type d'abonnement
  const col6 = 500 // Montant HT

  // Entêtes des colonnes plus explicites
  page.drawText("Référence", {
    x: col1,
    y: tableTop - 20,
    size: 9,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText("Description du produit", {
    x: col2,
    y: tableTop - 20,
    size: 9,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText("Qté", {
    x: col3,
    y: tableTop - 20,
    size: 9,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText("Prix unitaire HT", {
    x: col4,
    y: tableTop - 20,
    size: 9,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText("Type d'abonnement", {
    x: col5,
    y: tableTop - 20,
    size: 9,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText("Montant HT", {
    x: col6,
    y: tableTop - 20,
    size: 9,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  // Lignes du tableau
  let y = tableTop - 40
  let totalCartPrice = 0

  items.forEach((item, index) => {
    const itemTotal =
      item.price * (item.subscription === "YEARLY" ? 12 : 1) * item.quantity
    const unitPrice = item.price * (item.subscription === "YEARLY" ? 12 : 1)
    totalCartPrice += itemTotal

    // Déterminer la hauteur de ligne en fonction de la quantité de contenu
    const rowHeight = item.description || item.technical_specs ? 45 : 30

    // Fond alterné pour les lignes
    if (index % 2 === 0) {
      page.drawRectangle({
        x: 50,
        y: y,
        width: width - 100,
        height: rowHeight,
        color: lightGrayColor,
      })
    }

    // Référence du produit (ID)
    page.drawText(`${item.id || "-"}`, {
      x: col1,
      y: y + rowHeight - 15,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    })

    // Nom du produit
    page.drawText(`${item.name}`, {
      x: col2,
      y: y + rowHeight - 15,
      size: 9,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    })

    // Description du produit (si disponible)
    if (item.description) {
      page.drawText(truncateText(item.description, 50), {
        x: col2,
        y: y + rowHeight - 30,
        size: 8,
        font: helveticaOblique,
        color: grayColor,
      })
    }

    // Spécifications techniques (si disponibles)
    if (item.technical_specs) {
      page.drawText(truncateText(item.technical_specs, 50), {
        x: col2,
        y: y + rowHeight - 40,
        size: 7,
        font: helvetica,
        color: grayColor,
      })
    }

    // Quantité
    page.drawText(`${item.quantity}`, {
      x: col3 + 5,
      y: y + rowHeight - 15,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    })

    // Prix unitaire HT
    page.drawText(`${unitPrice.toFixed(2)} €`, {
      x: col4,
      y: y + rowHeight - 15,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    })

    // Type d'abonnement
    let subscriptionDisplay = ""
    switch (item.subscription || "MONTHLY") {
      case "MONTHLY":
        subscriptionDisplay = "Mensuel"
        break
      case "YEARLY":
        subscriptionDisplay = "Annuel"
        break
      case "PER_USER":
        subscriptionDisplay = "Par utilisateur"
        break
      case "PER_MACHINE":
        subscriptionDisplay = "Par machine"
        break
      default:
        subscriptionDisplay = item.subscription || "Mensuel"
        break
    }

    page.drawText(subscriptionDisplay, {
      x: col5,
      y: y + rowHeight - 15,
      size: 9,
      font: helvetica,
      color: rgb(0, 0, 0),
    })

    // Montant HT
    page.drawText(`${itemTotal.toFixed(2)} €`, {
      x: col6,
      y: y + rowHeight - 15,
      size: 9,
      font: helveticaBold,
      color: rgb(0, 0, 0),
    })

    y -= rowHeight // Ajuster la position Y pour la ligne suivante
  })

  // Ligne de séparation
  page.drawLine({
    start: { x: 50, y: y - 10 },
    end: { x: width - 50, y: y - 10 },
    thickness: 1,
    color: grayColor,
  })

  // Calcul des taxes et du total
  const taxes = order.taxes !== undefined ? order.taxes : totalCartPrice * 0.2
  const finalTotal = order.total_amount || totalCartPrice + taxes

  // Résumé des totaux (aligné à droite)
  page.drawText("Total HT:", {
    x: 400,
    y: y - 30,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  page.drawText(`${totalCartPrice.toFixed(2)} €`, {
    x: 500,
    y: y - 30,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  page.drawText("TVA (20%):", {
    x: 400,
    y: y - 50,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  page.drawText(`${taxes.toFixed(2)} €`, {
    x: 500,
    y: y - 50,
    size: 10,
    font: helvetica,
    color: rgb(0, 0, 0),
  })

  // Total en gras et plus grand
  page.drawRectangle({
    x: 350,
    y: y - 80,
    width: 195,
    height: 25,
    color: primaryColor,
  })

  page.drawText("TOTAL TTC:", {
    x: 360,
    y: y - 70,
    size: 12,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  page.drawText(`${finalTotal.toFixed(2)} €`, {
    x: 470,
    y: y - 70,
    size: 12,
    font: helveticaBold,
    color: rgb(1, 1, 1),
  })

  // Instructions de paiement ou termes et conditions
  page.drawRectangle({
    x: 50,
    y: y - 150,
    width: width - 100,
    height: 30,
    color: lightGrayColor,
    borderColor: primaryColor,
    borderWidth: 1,
  })

  page.drawText("CONDITIONS DE PAIEMENT", {
    x: 60,
    y: y - 140,
    size: 10,
    font: helveticaBold,
    color: primaryColor,
  })

  page.drawText(
    "Paiement à réception de facture. Les abonnements sont automatiquement renouvelés",
    {
      x: 50,
      y: y - 165,
      size: 8,
      font: helvetica,
      color: rgb(0, 0, 0),
    }
  )

  page.drawText(
    "à la période définie, sauf annulation de votre part 30 jours avant l'échéance.",
    {
      x: 50,
      y: y - 180,
      size: 8,
      font: helvetica,
      color: rgb(0, 0, 0),
    }
  )

  // Pied de page
  const footerY = 50

  page.drawLine({
    start: { x: 50, y: footerY + 30 },
    end: { x: width - 50, y: footerY + 30 },
    thickness: 1,
    color: primaryColor,
  })

  page.drawText("MERCI POUR VOTRE ACHAT", {
    x: width / 2 - 70,
    y: footerY + 15,
    size: 10,
    font: helveticaBold,
    color: primaryColor,
  })

  page.drawText(
    "Pour toute question concernant cette facture, contactez-nous à support@cyna.com",
    {
      x: 150,
      y: footerY,
      size: 8,
      font: helvetica,
      color: grayColor,
    }
  )

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}
