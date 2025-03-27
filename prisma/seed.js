import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// const bcrypt = require("bcrypt")

async function main() {
  try {
    console.log("Début de la procédure de seeding...")

    // Création des catégories
    console.log("Création des catégories...")
    const prevention = await prisma.category.create({
      data: {
        name: "Prévention",
        description: "Services dédiés à la prévention des cyber-risques.",
        image: "/uploads/prevention.jpg",
        priority_order: 1,
        updated_at: new Date(),
        created_at: new Date(),
      },
    })

    const protection = await prisma.category.create({
      data: {
        name: "Protection",
        description:
          "Services dédiés à la protection contre les menaces cyber.",
        image: "/uploads/protection.jpg",
        priority_order: 2,
        updated_at: new Date(),
        created_at: new Date(),
      },
    })

    const reponse = await prisma.category.create({
      data: {
        name: "Réponse",
        description: "Services dédiés à la réponse aux incidents de sécurité.",
        image: "/uploads/reponse.jpg",
        priority_order: 3,
        updated_at: new Date(),
        created_at: new Date(),
      },
    })

    // Création des produits
    console.log("Création des produits...")
    const diagnosticCyber = await prisma.product.create({
      data: {
        name: "Diagnostic Cyber",
        description:
          "Diagnostic complet des cyber-risques pour votre entreprise, incluant l’évaluation de votre infrastructure et de vos pratiques de sécurité.",
        technical_specs:
          "Audit complet de sécurité, analyse des vulnérabilités, cartographie des risques et recommandations personnalisées.",
        unit_price: 4500,
        discount_price: 4200,
        available: true,
        priority_order: 1,
        main_image: "/uploads/diagnostic_cyber.jpg",
        stock: Math.floor(Math.random() * 10),
        id_category: prevention.id_category,
      },
    })

    const testIntrusion = await prisma.product.create({
      data: {
        name: "Test d'intrusion",
        description:
          "Test d’intrusion pour évaluer la sécurité de vos systèmes et applications en simulant des attaques réelles.",
        technical_specs:
          "Pentesting sur applications web, infrastructure et systèmes, avec rapport détaillé des vulnérabilités découvertes.",
        unit_price: 4000,
        discount_price: 3800,
        available: true,
        priority_order: 2,
        main_image: "/uploads/test_intrusion.jpg",
        stock: Math.floor(Math.random() * 10),
        id_category: prevention.id_category,
      },
    })

    const microSOC = await prisma.product.create({
      data: {
        name: "Micro SOC",
        description:
          "Surveillance continue de la sécurité avec un centre d’opérations de sécurité adapté aux PME.",
        technical_specs:
          "Surveillance 24/7, analyse des logs, détection d’anomalies, alertes en temps réel.",
        unit_price: 5000,
        discount_price: null,
        available: false,
        priority_order: 1,
        main_image: "/uploads/micro_soc.jpg",
        stock: Math.floor(Math.random() * 10),
        id_category: protection.id_category,
      },
    })

    const socManage = await prisma.product.create({
      data: {
        name: "SOC Managé",
        description:
          "SOC avec gestion managée pour une sécurité optimale et une réactivité immédiate.",
        technical_specs:
          "Surveillance 24/7/365, analyse comportementale, traitement des incidents, équipe dédiée, rapports réguliers.",
        unit_price: 7000,
        discount_price: 6500,
        available: true,
        priority_order: 2,
        main_image: "/uploads/soc_manage.jpg",
        stock: Math.floor(Math.random() * 10),
        id_category: protection.id_category,
      },
    })

    const investigation = await prisma.product.create({
      data: {
        name: "Investigation, éradication, remédiation",
        description:
          "Réponse complète aux incidents de sécurité, depuis l’investigation jusqu’à la remédiation.",
        technical_specs:
          "Analyse forensique, confinement des menaces, élimination des malwares, reconstruction des systèmes compromis.",
        unit_price: 8500,
        discount_price: 8000,
        available: true,
        priority_order: 1,
        main_image: "/uploads/investigation.jpg",
        stock: Math.floor(Math.random() * 10),
        id_category: reponse.id_category,
      },
    })

    // Création des images pour les produits
    console.log("Création des images pour les produits...")
    await prisma.productCarousselImage.createMany({
      data: [
        {
          url: "/uploads/diagnostic_cyber.jpg",
          alt: "Diagnostic Cyber",
          id_product: diagnosticCyber.id_product,
        },
        {
          url: "/uploads/cyber2.jpg",
          alt: "Détail du diagnostic cyber",
          id_product: diagnosticCyber.id_product,
        },
        {
          url: "/uploads/test_intrusion.jpg",
          alt: "Test d'intrusion",
          id_product: testIntrusion.id_product,
        },
        {
          url: "/uploads/cyber2.jpg",
          alt: "Détail du test d’intrusion",
          id_product: testIntrusion.id_product,
        },
        {
          url: "/uploads/micro_soc.jpg",
          alt: "Micro SOC",
          id_product: microSOC.id_product,
        },
        {
          url: "/uploads/cyber1.jpg",
          alt: "Détail du micro SOC",
          id_product: microSOC.id_product,
        },
        {
          url: "/uploads/soc_manage.jpg",
          alt: "SOC Managé",
          id_product: socManage.id_product,
        },
        {
          url: "/uploads/cyber1.jpg",
          alt: "Détail du SOC managé",
          id_product: socManage.id_product,
        },
        {
          url: "/uploads/investigation.jpg",
          alt: "Investigation",
          id_product: investigation.id_product,
        },
        {
          url: "/uploads/cyber1.jpg",
          alt: "Détail du SOC managé",
          id_product: investigation.id_product,
        },
      ],
    })

    // Création des images pour le carrousel
    console.log("Création des images pour le carrousel...")
    await prisma.carouselImage.createMany({
      data: [
        {
          url: "/uploads/carousel/diagnostic_cyber.jpg",
          alt: "Diagnostic Cyber - Visuel 1",
          priority_order: 1,
          id_product: diagnosticCyber.id_product,
        },
        {
          url: "/uploads/carousel/diagnostic_cyber.jpg",
          alt: "Diagnostic Cyber - Visuel 2",
          priority_order: 2,
          id_product: diagnosticCyber.id_product,
        },
        {
          url: "/uploads/carousel/test_intrusion.jpg",
          alt: "Test d'intrusion - Visuel 1",
          priority_order: 1,
          id_product: testIntrusion.id_product,
        },
        {
          url: "/uploads/carousel/soc_manage.jpg",
          alt: "SOC Managé - Visuel 1",
          priority_order: 1,
          id_product: socManage.id_product,
        },
        {
          url: "/uploads/carousel/investigation.jpg",
          alt: "Investigation - Visuel 1",
          priority_order: 1,
          id_product: investigation.id_product,
        },
      ],
    })

    // Création des utilisateurs
    console.log("Création des utilisateurs...")
    // const salt = await bcrypt.genSalt(10)
    // const hashedPassword = await bcrypt.hash("Password123!", salt)
    // const adminPassword = await bcrypt.hash("AdminSecure456!", salt)

    const admin = await prisma.user.create({
      data: {
        first_name: "Admin",
        last_name: "Système",
        email: "admin@cyna.fr",
        password: "adminPassword",
        role: "ADMIN",
        email_verified: true,
      },
    })

    const customer1 = await prisma.user.create({
      data: {
        first_name: "Jean",
        last_name: "Dupont",
        email: "jean.dupont@example.com",
        password: "hashedPassword",
        role: "CUSTOMER",
        email_verified: true,
      },
    })

    const customer2 = await prisma.user.create({
      data: {
        first_name: "Marie",
        last_name: "Martin",
        email: "marie.martin@example.com",
        password: "hashedPassword",
        role: "CUSTOMER",
        email_verified: true,
      },
    })

    const manager = await prisma.user.create({
      data: {
        first_name: "Philippe",
        last_name: "Dubois",
        email: "philippe.dubois@cyna.fr",
        password: "hashedPassword",
        role: "MANAGER",
        email_verified: true,
      },
    })

    // Création des adresses
    console.log("Création des adresses...")
    const address1 = await prisma.address.create({
      data: {
        first_name: "Jean",
        last_name: "Dupont",
        address1: "123 Rue de la Paix",
        address2: "Appartement 4B",
        postal_code: "75001",
        city: "Paris",
        region: "Île-de-France",
        country: "France",
        mobile_phone: "06 12 34 56 78",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer1.id_user,
      },
    })

    const address2 = await prisma.address.create({
      data: {
        first_name: "Marie",
        last_name: "Martin",
        address1: "456 Avenue Victor Hugo",
        postal_code: "69002",
        city: "Lyon",
        region: "Auvergne-Rhône-Alpes",
        country: "France",
        mobile_phone: "06 98 76 54 32",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer2.id_user,
      },
    })

    // Création des sessions
    console.log("Création des sessions...")
    const session1 = await prisma.session.create({
      data: {
        session_token: "sess_12345abcde",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        id_user: customer1.id_user,
      },
    })

    const session2 = await prisma.session.create({
      data: {
        session_token: "sess_67890fghij",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        id_user: customer2.id_user,
      },
    })

    // Création des éléments du panier
    console.log("Création des éléments du panier...")
    await prisma.cartItem.create({
      data: {
        quantity: 1,
        subscription_type: "YEARLY",
        id_product: diagnosticCyber.id_product,
        sessionId_session: session2.id_session,
      },
    })

    await prisma.cartItem.create({
      data: {
        quantity: 2,
        subscription_type: "MONTHLY",
        id_product: testIntrusion.id_product,
        sessionId_session: session2.id_session,
      },
    })

    // Création des informations de paiement
    console.log("Création des informations de paiement...")
    await prisma.paymentInfo.create({
      data: {
        card_name: "Jean Dupont",
        last_card_digits: "4242",
        expiration_month: 12,
        expiration_year: 2025,
        provider_token_id: "tok_visa_4242",
        is_default: true,
        id_user: customer1.id_user,
      },
    })

    await prisma.paymentInfo.create({
      data: {
        card_name: "Marie Martin",
        last_card_digits: "4444",
        expiration_month: 9,
        expiration_year: 2026,
        provider_token_id: "tok_visa_4444",
        is_default: true,
        id_user: customer2.id_user,
      },
    })

    // Création des commandes
    console.log("Création des commandes...")
    const order1 = await prisma.order.create({
      data: {
        order_date: new Date("2023-06-15"),
        total_amount: 4500,
        subtotal: 4500,
        order_status: "COMPLETED",
        payment_method: "CARD",
        last_card_digits: "4242",
        invoice_number: "INV-2023-001",
        invoice_pdf_url: "/invoices/INV-2023-001.pdf",
        id_user: customer1.id_user,
        id_address: address1.id_address,
      },
    })

    const order2 = await prisma.order.create({
      data: {
        order_date: new Date("2023-07-22"),
        total_amount: 8500,
        subtotal: 8500,
        order_status: "PAID",
        payment_method: "CARD",
        last_card_digits: "4444",
        invoice_number: "INV-2023-002",
        invoice_pdf_url: "/invoices/INV-2023-002.pdf",
        id_user: customer2.id_user,
        id_address: address2.id_address,
      },
    })

    const order3 = await prisma.order.create({
      data: {
        order_date: new Date("2023-09-05"),
        total_amount: 11000,
        subtotal: 11000,
        order_status: "PENDING",
        payment_method: "CARD",
        last_card_digits: "4242",
        invoice_number: "INV-2023-003",
        id_user: customer1.id_user,
        id_address: address1.id_address,
      },
    })

    // Création des éléments de commande
    console.log("Création des éléments de commande...")
    await prisma.orderItem.create({
      data: {
        subscription_type: "YEARLY",
        subscription_status: "ACTIVE",
        subscription_duration: 12,
        renewal_date: new Date("2024-06-15"),
        quantity: 1,
        unit_price: 4500,
        id_product: diagnosticCyber.id_product,
        id_order: order1.id_order,
      },
    })

    await prisma.orderItem.create({
      data: {
        subscription_type: "YEARLY",
        subscription_status: "ACTIVE",
        subscription_duration: 12,
        renewal_date: new Date("2024-07-22"),
        quantity: 1,
        unit_price: 8500,
        id_product: investigation.id_product,
        id_order: order2.id_order,
      },
    })

    await prisma.orderItem.create({
      data: {
        subscription_type: "MONTHLY",
        subscription_status: "PENDING",
        subscription_duration: 1,
        renewal_date: new Date("2023-10-05"),
        quantity: 1,
        unit_price: 7000,
        id_product: socManage.id_product,
        id_order: order3.id_order,
      },
    })

    await prisma.orderItem.create({
      data: {
        subscription_type: "MONTHLY",
        subscription_status: "PENDING",
        subscription_duration: 1,
        renewal_date: new Date("2023-10-05"),
        quantity: 1,
        unit_price: 4000,
        id_product: testIntrusion.id_product,
        id_order: order3.id_order,
      },
    })

    // Création des messages de contact
    console.log("Création des messages de contact...")
    await prisma.contactMessage.create({
      data: {
        email: "jean.dupont@example.com",
        subject: "Question sur le diagnostic cyber",
        message:
          "Bonjour, je souhaite en savoir plus sur votre service de diagnostic cyber. Comment se déroule l’intervention dans nos locaux ? Merci d’avance pour votre réponse.",
        sent_date: new Date("2023-06-10"),
        is_read: true,
        id_user: customer1.id_user,
      },
    })

    await prisma.contactMessage.create({
      data: {
        email: "marie.martin@example.com",
        subject: "Demande de devis personnalisé",
        message:
          "Bonjour, je dirige une PME de 25 employés dans le secteur financier. Pouvez-vous me proposer un devis personnalisé pour vos services de protection ? Cordialement, Marie Martin",
        sent_date: new Date("2023-07-18"),
        is_read: true,
        id_user: customer2.id_user,
      },
    })

    await prisma.contactMessage.create({
      data: {
        email: "contact@entreprise-xyz.fr",
        subject: "Demande d'information",
        message:
          "Bonjour, je souhaite recevoir plus d’informations sur vos services de SOC managé. Pouvez-vous me contacter au 01 23 45 67 89 ? Merci.",
        sent_date: new Date(),
        is_read: false,
      },
    })

    // Création des tokens de réinitialisation de mot de passe
    console.log("Création des tokens de réinitialisation de mot de passe...")
    await prisma.passwordResetToken.create({
      data: {
        token: "reset_123456789",
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 heures
        id_user: customer1.id_user,
      },
    })

    console.log("Seeding terminé avec succès !")
  } catch (error) {
    console.error("Erreur durant le seeding :", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
