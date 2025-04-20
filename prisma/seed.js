import {
  OrderStatus,
  PrismaClient,
  // Role,
  SubscriptionType,
} from "@prisma/client"
const prisma = new PrismaClient()

// const bcrypt = require("bcrypt")

// Fonction utilitaire pour générer des dates récentes
const getRecentDate = daysAgo => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

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
          "Diagnostic complet des cyber-risques pour votre entreprise, incluant l'évaluation de votre infrastructure et de vos pratiques de sécurité.",
        technical_specs:
          "Audit complet de sécurité, analyse des vulnérabilités, cartographie des risques et recommandations personnalisées.",
        unit_price: 4500,
        discount_price: 4200,
        available: true,
        priority_order: 1,
        main_image: "/uploads/diagnostic_cyber.jpg",
        stock: Math.floor(Math.random() * 10) + 10, // Stock plus élevé
        id_category: prevention.id_category,
      },
    })

    const testIntrusion = await prisma.product.create({
      data: {
        name: "Test d'intrusion",
        description:
          "Test d'intrusion pour évaluer la sécurité de vos systèmes et applications en simulant des attaques réelles.",
        technical_specs:
          "Pentesting sur applications web, infrastructure et systèmes, avec rapport détaillé des vulnérabilités découvertes.",
        unit_price: 4000,
        discount_price: 3800,
        available: true,
        priority_order: 2,
        main_image: "/uploads/test_intrusion.jpg",
        stock: Math.floor(Math.random() * 10) + 5,
        id_category: prevention.id_category,
      },
    })

    const microSOC = await prisma.product.create({
      data: {
        name: "Micro SOC",
        description:
          "Surveillance continue de la sécurité avec un centre d'opérations de sécurité adapté aux PME.",
        technical_specs:
          "Surveillance 24/7, analyse des logs, détection d'anomalies, alertes en temps réel.",
        unit_price: 5000,
        discount_price: null,
        available: true, // Maintenant disponible
        priority_order: 1,
        main_image: "/uploads/micro_soc.jpg",
        stock: Math.floor(Math.random() * 10) + 8,
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
        stock: Math.floor(Math.random() * 10) + 5,
        id_category: protection.id_category,
      },
    })

    const investigation = await prisma.product.create({
      data: {
        name: "Investigation, éradication, remédiation",
        description:
          "Réponse complète aux incidents de sécurité, depuis l'investigation jusqu'à la remédiation.",
        technical_specs:
          "Analyse forensique, confinement des menaces, élimination des malwares, reconstruction des systèmes compromis.",
        unit_price: 8500,
        discount_price: 8000,
        available: true,
        priority_order: 1,
        main_image: "/uploads/investigation.jpg",
        stock: Math.floor(Math.random() * 10) + 3,
        id_category: reponse.id_category,
      },
    })

    // Nouveau produit dans la catégorie Réponse
    const crisisManagement = await prisma.product.create({
      data: {
        name: "Gestion de crise cybersécurité",
        description:
          "Service de gestion de crise complet pour faire face aux incidents de sécurité majeurs.",
        technical_specs:
          "Cellule de crise, communication interne et externe, coordination avec les autorités, plan de continuité d'activité.",
        unit_price: 9500,
        discount_price: 9000,
        available: true,
        priority_order: 2,
        main_image: "/uploads/crisis_management.jpg",
        stock: Math.floor(Math.random() * 5) + 2,
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
          alt: "Détail du test d'intrusion",
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
          alt: "Détail du service d'investigation",
          id_product: investigation.id_product,
        },
        {
          url: "/uploads/crisis_management.jpg",
          alt: "Gestion de crise",
          id_product: crisisManagement.id_product,
        },
        {
          url: "/uploads/cyber2.jpg",
          alt: "Détail de la gestion de crise",
          id_product: crisisManagement.id_product,
        },
      ],
    })

    // *** AJOUT : Création des slides du Hero Carousel ***
    console.log("Création des slides pour le Hero Carousel...")
    await prisma.heroCarouselSlide.createMany({
      data: [
        {
          title: "Solutions de cybersécurité pour les entreprises",
          description:
            "Des services de pointe pour protéger vos actifs numériques et garantir la continuité de votre activité",
          image_url:
            "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1920",
          button_text: "Découvrir nos solutions",
          button_link: "/categories",
          active: true,
          priority_order: 1,
        },
        {
          title: "Tests d'intrusion et audit de sécurité",
          description:
            "Identifiez vos vulnérabilités avant que les hackers ne le fassent",
          image_url:
            "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?q=80&w=1920",
          button_text: "En savoir plus",
          button_link: "/produit/2",
          active: true,
          priority_order: 2,
        },
        {
          title: "Nouveau : SOC Managé 24/7",
          description:
            "Surveillance continue et réponse immédiate aux menaces pour une protection optimale",
          image_url:
            "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1920",
          button_text: "Découvrir le service",
          button_link: "/produit/4",
          active: true,
          priority_order: 3,
        },
        {
          title: "Offre spéciale 2025 : -10% sur nos diagnostics",
          description:
            "Profitez de notre offre spéciale jusqu'à la fin du mois d'avril",
          image_url:
            "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1920",
          button_text: "Profiter de l'offre",
          button_link: "/produit/1",
          active: true,
          priority_order: 4,
        },
        {
          title: "Services de remédiation après incident",
          description:
            "Retrouvez la sérénité après une cyberattaque grâce à nos experts",
          image_url:
            "https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1920",
          button_text: "Nos services de réponse",
          button_link: "/produit/5",
          active: true,
          priority_order: 5,
        },
      ],
    })

    // Création des utilisateurs
    console.log("Création des utilisateurs...")
    // const salt = await bcrypt.genSalt(10)
    // const hashedPassword = await bcrypt.hash("Password123!", salt)
    // const adminPassword = await bcrypt.hash("AdminSecure456!", salt)

    // *** AJOUT : Création d'un utilisateur SUPER_ADMIN ***
    const superAdmin = await prisma.user.create({
      data: {
        first_name: "Super",
        last_name: "Admin",
        email: "superadmin@cyna.fr",
        password: "superAdminPassword",
        role: "SUPER_ADMIN", // Rôle SUPER_ADMIN
        email_verified: true,
      },
    })

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

    // *** AJOUT : Création de plus d'utilisateurs ***
    const manager1 = await prisma.user.create({
      data: {
        first_name: "Philippe",
        last_name: "Dubois",
        email: "philippe.dubois@cyna.fr",
        password: "hashedPassword",
        role: "MANAGER",
        email_verified: true,
      },
    })

    const manager2 = await prisma.user.create({
      data: {
        first_name: "Sophie",
        last_name: "Moreau",
        email: "sophie.moreau@cyna.fr",
        password: "hashedPassword",
        role: "MANAGER",
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

    const customer3 = await prisma.user.create({
      data: {
        first_name: "Thomas",
        last_name: "Bernard",
        email: "thomas.bernard@example.com",
        password: "hashedPassword",
        role: "CUSTOMER",
        email_verified: true,
      },
    })

    const customer4 = await prisma.user.create({
      data: {
        first_name: "Émilie",
        last_name: "Leroy",
        email: "emilie.leroy@example.com",
        password: "hashedPassword",
        role: "CUSTOMER",
        email_verified: false, // Email non vérifié
        verify_token: "verify_emilie_token_123",
      },
    })

    // Nouveaux clients pour les commandes récentes
    const customer5 = await prisma.user.create({
      data: {
        first_name: "Alexandre",
        last_name: "Petit",
        email: "alexandre.petit@example.com",
        password: "hashedPassword",
        role: "CUSTOMER",
        email_verified: true,
      },
    })

    const customer6 = await prisma.user.create({
      data: {
        first_name: "Caroline",
        last_name: "Durand",
        email: "caroline.durand@example.com",
        password: "hashedPassword",
        role: "CUSTOMER",
        email_verified: true,
      },
    })

    const customer7 = await prisma.user.create({
      data: {
        first_name: "Stéphane",
        last_name: "Moreau",
        email: "stephane.moreau@example.com",
        password: "hashedPassword",
        role: "CUSTOMER",
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

    // *** AJOUT : Plus d'adresses pour les nouveaux utilisateurs ***
    const address3 = await prisma.address.create({
      data: {
        first_name: "Thomas",
        last_name: "Bernard",
        address1: "789 Boulevard Saint-Michel",
        postal_code: "44000",
        city: "Nantes",
        region: "Pays de la Loire",
        country: "France",
        mobile_phone: "07 11 22 33 44",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer3.id_user,
      },
    })

    const address4 = await prisma.address.create({
      data: {
        first_name: "Émilie",
        last_name: "Leroy",
        address1: "24 Rue des Lilas",
        postal_code: "33000",
        city: "Bordeaux",
        region: "Nouvelle-Aquitaine",
        country: "France",
        mobile_phone: "06 55 66 77 88",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer4.id_user,
      },
    })

    // Adresses pour les nouveaux clients
    const address5 = await prisma.address.create({
      data: {
        first_name: "Alexandre",
        last_name: "Petit",
        address1: "15 Rue du Commerce",
        postal_code: "13001",
        city: "Marseille",
        region: "Provence-Alpes-Côte d'Azur",
        country: "France",
        mobile_phone: "07 89 01 23 45",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer5.id_user,
      },
    })

    const address6 = await prisma.address.create({
      data: {
        first_name: "Caroline",
        last_name: "Durand",
        address1: "78 Avenue des Fleurs",
        postal_code: "59000",
        city: "Lille",
        region: "Hauts-de-France",
        country: "France",
        mobile_phone: "06 12 34 56 78",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer6.id_user,
      },
    })

    const address7 = await prisma.address.create({
      data: {
        first_name: "Stéphane",
        last_name: "Moreau",
        address1: "42 Rue de la République",
        postal_code: "67000",
        city: "Strasbourg",
        region: "Grand Est",
        country: "France",
        mobile_phone: "07 65 43 21 09",
        is_default_billing: true,
        is_default_shipping: true,
        id_user: customer7.id_user,
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

    // *** AJOUT : Plus de sessions ***
    const session3 = await prisma.session.create({
      data: {
        session_token: "sess_abcde12345",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        id_user: customer3.id_user,
      },
    })

    const sessionAdmin = await prisma.session.create({
      data: {
        session_token: "sess_admin54321",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        id_user: admin.id_user,
      },
    })

    const sessionSuperAdmin = await prisma.session.create({
      data: {
        session_token: "sess_super98765",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
        id_user: superAdmin.id_user,
      },
    })

    // Sessions pour les nouveaux clients
    const session5 = await prisma.session.create({
      data: {
        session_token: "sess_alex12345",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        id_user: customer5.id_user,
      },
    })

    const session6 = await prisma.session.create({
      data: {
        session_token: "sess_carol67890",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        id_user: customer6.id_user,
      },
    })

    const session7 = await prisma.session.create({
      data: {
        session_token: "sess_steph13579",
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        id_user: customer7.id_user,
      },
    })

    // Création des éléments du panier
    console.log("Création des éléments du panier...")
    await prisma.cartItem.create({
      data: {
        quantity: 1,
        subscription_type: SubscriptionType.YEARLY,
        id_product: diagnosticCyber.id_product,
        sessionId_session: session2.id_session,
      },
    })

    await prisma.cartItem.create({
      data: {
        quantity: 2,
        subscription_type: SubscriptionType.MONTHLY,
        id_product: testIntrusion.id_product,
        sessionId_session: session2.id_session,
      },
    })

    // *** AJOUT : Plus d'éléments de panier ***
    await prisma.cartItem.create({
      data: {
        quantity: 1,
        subscription_type: SubscriptionType.YEARLY,
        id_product: socManage.id_product,
        sessionId_session: session3.id_session,
      },
    })

    await prisma.cartItem.create({
      data: {
        quantity: 1,
        subscription_type: SubscriptionType.MONTHLY,
        id_product: investigation.id_product,
        userId_user: customer4.id_user, // Panier associé à l'utilisateur directement
      },
    })

    // Création des informations de paiement
    console.log("Création des informations de paiement...")
    await prisma.paymentInfo.create({
      data: {
        card_name: "Jean Dupont",
        last_card_digits: "4242",
        expiration_month: 12,
        expiration_year: 2026,
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

    // *** AJOUT : Plus d'informations de paiement ***
    await prisma.paymentInfo.create({
      data: {
        card_name: "Thomas Bernard",
        last_card_digits: "5555",
        expiration_month: 3,
        expiration_year: 2026,
        provider_token_id: "tok_mastercard_5555",
        is_default: true,
        id_user: customer3.id_user,
      },
    })

    await prisma.paymentInfo.create({
      data: {
        card_name: "Jean Dupont Pro",
        last_card_digits: "9876",
        expiration_month: 6,
        expiration_year: 2025,
        provider_token_id: "tok_amex_9876",
        is_default: false,
        id_user: customer1.id_user,
      },
    })

    // Informations de paiement pour les nouveaux clients
    await prisma.paymentInfo.create({
      data: {
        card_name: "Alexandre Petit",
        last_card_digits: "1234",
        expiration_month: 4,
        expiration_year: 2027,
        provider_token_id: "tok_visa_1234",
        is_default: true,
        id_user: customer5.id_user,
      },
    })

    await prisma.paymentInfo.create({
      data: {
        card_name: "Caroline Durand",
        last_card_digits: "5678",
        expiration_month: 8,
        expiration_year: 2026,
        provider_token_id: "tok_mastercard_5678",
        is_default: true,
        id_user: customer6.id_user,
      },
    })

    await prisma.paymentInfo.create({
      data: {
        card_name: "Stéphane Moreau",
        last_card_digits: "9012",
        expiration_month: 11,
        expiration_year: 2025,
        provider_token_id: "tok_visa_9012",
        is_default: true,
        id_user: customer7.id_user,
      },
    })

    // Création des commandes historiques (conserver celles existantes)
    console.log("Création des commandes historiques...")

    // ----- Commande 1 - Jean Dupont - Diagnostic Cyber (Abonnement annuel) -----
    const orderItems1 = [
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-06-15"),
        quantity: 1,
        unit_price: diagnosticCyber.unit_price, // 4500
        id_product: diagnosticCyber.id_product,
      },
    ]

    // Calcul précis du total
    const total1 = orderItems1.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    const order1 = await prisma.order.create({
      data: {
        order_date: new Date("2023-06-15"),
        total_amount: total1,
        subtotal: total1,
        order_status: OrderStatus.PROCESSING,
        payment_method: "CARD",
        last_card_digits: "4242",
        invoice_number: "INV-2023-001",
        invoice_pdf_url: "/invoices/INV-2023-001.pdf",
        id_user: customer1.id_user,
        id_address: address1.id_address,
      },
    })

    // Création des éléments de commande pour order1
    for (const item of orderItems1) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id_order: order1.id_order,
        },
      })
    }

    // ----- Commande 2 - Marie Martin - Investigation + Test d'intrusion (Abonnement annuel) -----
    const orderItems2 = [
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-07-22"),
        quantity: 1,
        unit_price: investigation.unit_price, // 8500
        id_product: investigation.id_product,
      },
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-07-22"),
        quantity: 1,
        unit_price: testIntrusion.discount_price || testIntrusion.unit_price, // 3800 (prix remisé)
        id_product: testIntrusion.id_product,
      },
    ]

    // Calcul précis du total
    const total2 = orderItems2.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    const order2 = await prisma.order.create({
      data: {
        order_date: new Date("2023-07-22"),
        total_amount: total2,
        subtotal: total2,
        order_status: OrderStatus.PROCESSING,
        payment_method: "CARD",
        last_card_digits: "4444",
        invoice_number: "INV-2023-002",
        invoice_pdf_url: "/invoices/INV-2023-002.pdf",
        id_user: customer2.id_user,
        id_address: address2.id_address,
      },
    })

    // Création des éléments de commande pour order2
    for (const item of orderItems2) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id_order: order2.id_order,
        },
      })
    }

    // ----- Commande 3 - Jean Dupont - SOC Managé (Mensuel) + Diagnostic Cyber (Annuel) -----
    const orderItems3 = [
      {
        subscription_type: SubscriptionType.MONTHLY,
        subscription_status: OrderStatus.PENDING,
        subscription_duration: 1,
        renewal_date: new Date("2023-10-05"),
        quantity: 1,
        unit_price: socManage.discount_price || socManage.unit_price, // 6500 (prix remisé)
        id_product: socManage.id_product,
      },
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.PENDING,
        subscription_duration: 12,
        renewal_date: new Date("2024-09-05"),
        quantity: 1,
        unit_price:
          diagnosticCyber.discount_price || diagnosticCyber.unit_price, // 4200 (prix remisé)
        id_product: diagnosticCyber.id_product,
      },
    ]

    // Calcul précis du total
    const total3 = orderItems3.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    const order3 = await prisma.order.create({
      data: {
        order_date: new Date("2023-09-05"),
        total_amount: total3,
        subtotal: total3,
        order_status: OrderStatus.ACTIVE,
        payment_method: "CARD",
        last_card_digits: "4242",
        invoice_number: "INV-2023-003",
        id_user: customer1.id_user,
        id_address: address1.id_address,
      },
    })

    // Création des éléments de commande pour order3
    for (const item of orderItems3) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id_order: order3.id_order,
        },
      })
    }

    // ----- Commande 4 - Marie Martin - Test d'intrusion (Mensuel) avec quantité de 2 -----
    const orderItems4 = [
      {
        subscription_type: SubscriptionType.MONTHLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 1,
        renewal_date: new Date("2023-09-25"),
        quantity: 2, // Commander 2 tests d'intrusion mensuels
        unit_price: testIntrusion.unit_price, // 4000 (prix normal)
        id_product: testIntrusion.id_product,
      },
    ]

    // Calcul précis du total (en prenant en compte la quantité)
    const total4 = orderItems4.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    const order4 = await prisma.order.create({
      data: {
        order_date: new Date("2023-08-25"),
        total_amount: total4,
        subtotal: total4,
        order_status: OrderStatus.COMPLETED,
        payment_method: "CARD",
        last_card_digits: "4444",
        invoice_number: "INV-2023-004",
        invoice_pdf_url: "/invoices/INV-2023-004.pdf",
        id_user: customer2.id_user,
        id_address: address2.id_address,
      },
    })

    // Création des éléments de commande pour order4
    for (const item of orderItems4) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id_order: order4.id_order,
        },
      })
    }

    // *** AJOUT : Commande supplémentaire pour Thomas Bernard ***
    const orderItems5 = [
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-11-10"),
        quantity: 1,
        unit_price: microSOC.unit_price, // 5000
        id_product: microSOC.id_product,
      },
      {
        subscription_type: SubscriptionType.YEARLY,
        subscription_status: OrderStatus.ACTIVE,
        subscription_duration: 12,
        renewal_date: new Date("2024-11-10"),
        quantity: 1,
        unit_price: investigation.unit_price, // 8500
        id_product: investigation.id_product,
      },
    ]

    const total5 = orderItems5.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    const order5 = await prisma.order.create({
      data: {
        order_date: new Date("2023-11-10"),
        total_amount: total5,
        subtotal: total5,
        order_status: OrderStatus.ACTIVE,
        payment_method: "CARD",
        last_card_digits: "5555",
        invoice_number: "INV-2023-005",
        invoice_pdf_url: "/invoices/INV-2023-005.pdf",
        id_user: customer3.id_user,
        id_address: address3.id_address,
      },
    })

    for (const item of orderItems5) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id_order: order5.id_order,
        },
      })
    }

    // Création des commandes récentes (pour le tableau de bord)
    console.log("Création des commandes récentes pour le tableau de bord...")

    // Fonction utilitaire pour créer une commande
    async function createOrder(
      orderDate,
      user,
      address,
      items,
      status,
      cardDigits
    ) {
      // Génération du numéro de facture avec l'année actuelle et un numéro séquentiel
      const year = orderDate.getFullYear()
      const month = String(orderDate.getMonth() + 1).padStart(2, "0")
      const seq = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      const invoiceNumber = `INV-${year}${month}-${seq}`

      // Calcul du total
      const total = items.reduce(
        (acc, item) => acc + item.unit_price * item.quantity,
        0
      )

      // Création de la commande
      const order = await prisma.order.create({
        data: {
          order_date: orderDate,
          total_amount: total,
          subtotal: total,
          order_status: status,
          payment_method: "CARD",
          last_card_digits: cardDigits,
          invoice_number: invoiceNumber,
          invoice_pdf_url: `/invoices/${invoiceNumber}.pdf`,
          id_user: user.id_user,
          id_address: address.id_address,
        },
      })

      // Création des éléments de commande
      for (const item of items) {
        await prisma.orderItem.create({
          data: {
            ...item,
            id_order: order.id_order,
          },
        })
      }

      return order
    }

    // Créer des commandes pour les 7 derniers jours
    for (let i = 0; i < 7; i++) {
      // Jour actuel moins i jours
      const orderDate = getRecentDate(i)

      // Définir des utilisateurs différents pour chaque jour
      const users = [
        customer1,
        customer2,
        customer3,
        customer4,
        customer5,
        customer6,
        customer7,
      ]
      const addresses = [
        address1,
        address2,
        address3,
        address4,
        address5,
        address6,
        address7,
      ]
      const cardDigits = [
        "4242",
        "4444",
        "5555",
        "6666",
        "1234",
        "5678",
        "9012",
      ]

      // Nombre de commandes pour ce jour (entre 1 et 3)
      const numOrders = Math.floor(Math.random() * 3) + 1

      for (let j = 0; j < numOrders; j++) {
        // Sélectionner utilisateur et adresse aléatoires
        const userIndex = Math.floor(Math.random() * users.length)
        const user = users[userIndex]
        const address = addresses[userIndex]
        const cardDigit = cardDigits[userIndex]

        // Déterminer les produits pour cette commande (entre 1 et 3 produits)
        const numProducts = Math.floor(Math.random() * 3) + 1
        const products = [
          diagnosticCyber,
          testIntrusion,
          microSOC,
          socManage,
          investigation,
          crisisManagement,
        ]
        const selectedProducts = []

        // Sélectionner des produits aléatoires sans duplication
        while (selectedProducts.length < numProducts && products.length > 0) {
          const randomIndex = Math.floor(Math.random() * products.length)
          selectedProducts.push(products.splice(randomIndex, 1)[0])
        }

        // Créer les éléments de commande
        const orderItems = selectedProducts.map(product => {
          const subscriptionTypes = [
            SubscriptionType.MONTHLY,
            SubscriptionType.YEARLY,
          ]
          const randomSubType =
            subscriptionTypes[
              Math.floor(Math.random() * subscriptionTypes.length)
            ]
          const duration = randomSubType === SubscriptionType.MONTHLY ? 1 : 12

          // Date de renouvellement
          const renewalDate = new Date(orderDate)
          renewalDate.setMonth(renewalDate.getMonth() + duration)

          // Quantité (1 ou 2)
          const quantity = Math.random() > 0.7 ? 2 : 1

          // Prix (normal ou remisé si disponible)
          const unitPrice = product.discount_price || product.unit_price

          return {
            subscription_type: randomSubType,
            subscription_status: OrderStatus.ACTIVE,
            subscription_duration: duration,
            renewal_date: renewalDate,
            quantity: quantity,
            unit_price: unitPrice,
            id_product: product.id_product,
          }
        })

        // Statut de la commande (le plus souvent ACTIVE, parfois PENDING ou COMPLETED)
        const statuses = [
          OrderStatus.ACTIVE,
          OrderStatus.ACTIVE,
          OrderStatus.ACTIVE,
          OrderStatus.PENDING,
          OrderStatus.COMPLETED,
        ]
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)]

        // Créer la commande
        await createOrder(
          orderDate,
          user,
          address,
          orderItems,
          randomStatus,
          cardDigit
        )
      }
    }

    // Créer des commandes pour les semaines précédentes (pour les 5 dernières semaines)
    for (let week = 1; week <= 4; week++) {
      // Pour chaque semaine, créer quelques commandes
      for (let day = 0; day < 3; day++) {
        // week semaines plus day jours en arrière
        const daysAgo = week * 7 + day
        const orderDate = getRecentDate(daysAgo)

        // Sélectionner utilisateur et adresse aléatoires
        const userIndex = Math.floor(Math.random() * 7)
        const users = [
          customer1,
          customer2,
          customer3,
          customer4,
          customer5,
          customer6,
          customer7,
        ]
        const addresses = [
          address1,
          address2,
          address3,
          address4,
          address5,
          address6,
          address7,
        ]
        const cardDigits = [
          "4242",
          "4444",
          "5555",
          "6666",
          "1234",
          "5678",
          "9012",
        ]

        const user = users[userIndex]
        const address = addresses[userIndex]
        const cardDigit = cardDigits[userIndex]

        // Nombre de produits (entre 1 et 2)
        const numProducts = Math.floor(Math.random() * 2) + 1
        const products = [
          diagnosticCyber,
          testIntrusion,
          microSOC,
          socManage,
          investigation,
          crisisManagement,
        ]
        const selectedProducts = []

        // Sélectionner des produits aléatoires sans duplication
        while (selectedProducts.length < numProducts && products.length > 0) {
          const randomIndex = Math.floor(Math.random() * products.length)
          selectedProducts.push(products.splice(randomIndex, 1)[0])
        }

        // Créer les éléments de commande
        const orderItems = selectedProducts.map(product => {
          // Privilégier les abonnements annuels pour les anciennes commandes
          const subscriptionType =
            Math.random() > 0.3
              ? SubscriptionType.YEARLY
              : SubscriptionType.MONTHLY
          const duration =
            subscriptionType === SubscriptionType.MONTHLY ? 1 : 12

          // Date de renouvellement
          const renewalDate = new Date(orderDate)
          renewalDate.setMonth(renewalDate.getMonth() + duration)

          // Prix (normal ou remisé si disponible)
          const unitPrice = product.discount_price || product.unit_price

          return {
            subscription_type: subscriptionType,
            subscription_status: OrderStatus.ACTIVE,
            subscription_duration: duration,
            renewal_date: renewalDate,
            quantity: 1,
            unit_price: unitPrice,
            id_product: product.id_product,
          }
        })

        // La plupart des anciennes commandes sont ACTIVE ou COMPLETED
        const statuses = [OrderStatus.ACTIVE, OrderStatus.COMPLETED]
        const randomStatus =
          statuses[Math.floor(Math.random() * statuses.length)]

        // Créer la commande
        await createOrder(
          orderDate,
          user,
          address,
          orderItems,
          randomStatus,
          cardDigit
        )
      }
    }

    // Création des messages de contact
    console.log("Création des messages de contact...")
    await prisma.contactMessage.create({
      data: {
        email: "jean.dupont@example.com",
        subject: "Question sur le diagnostic cyber",
        message:
          "Bonjour, je souhaite en savoir plus sur votre service de diagnostic cyber. Comment se déroule l'intervention dans nos locaux ? Merci d'avance pour votre réponse.",
        sent_date: new Date("2023-06-10"),
        is_read: true,
        is_responded: true,
        response:
          "Bonjour Jean, merci pour votre intérêt. Notre intervention se déroule en trois phases : audit initial, analyse des vulnérabilités et remise du rapport détaillé. Un consultant se déplacera dans vos locaux pour la première phase. N'hésitez pas si vous avez d'autres questions.",
        response_date: new Date("2023-06-12"),
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
        is_responded: false,
        id_user: customer2.id_user,
      },
    })

    await prisma.contactMessage.create({
      data: {
        email: "contact@entreprise-xyz.fr",
        subject: "Demande d'information",
        message:
          "Bonjour, je souhaite recevoir plus d'informations sur vos services de SOC managé. Pouvez-vous me contacter au 01 23 45 67 89 ? Merci.",
        sent_date: new Date(),
        is_read: false,
        is_responded: false,
      },
    })

    // Messages récents
    await prisma.contactMessage.create({
      data: {
        email: "alexandre.petit@example.com",
        subject: "Question technique sur le Micro SOC",
        message:
          "Bonjour, nous avons récemment souscrit à votre service Micro SOC et j'aimerais savoir comment accéder au tableau de bord de surveillance. Merci d'avance.",
        sent_date: getRecentDate(2),
        is_read: true,
        is_responded: true,
        response:
          "Bonjour Alexandre, merci pour votre message. Vous pouvez accéder au tableau de bord via l'URL suivante : dashboard.cyna.fr en utilisant les identifiants qui vous ont été envoyés par email. N'hésitez pas si vous avez d'autres questions.",
        response_date: getRecentDate(1),
        id_user: customer5.id_user,
      },
    })

    await prisma.contactMessage.create({
      data: {
        email: "caroline.durand@example.com",
        subject: "Renouvellement de contrat",
        message:
          "Bonjour, notre contrat arrive à échéance le mois prochain. Pouvez-vous me contacter pour discuter des conditions de renouvellement ? Merci.",
        sent_date: getRecentDate(3),
        is_read: true,
        is_responded: false,
        id_user: customer6.id_user,
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

    console.log("Création des messages principaux pour la page d'accueil...")
    await prisma.mainMessage.createMany({
      data: [
        {
          content:
            "Offres spéciales printemps 2025 : -15% sur tous nos services de protection jusqu'au 30 avril !",
          active: true,
          has_background: true,
          background_color: "bg-amber-100",
          text_color: "text-amber-800",
        },
        {
          content:
            "Découvrez notre nouveau service de SOC managé avec 15% de réduction pendant tout le mois",
          active: false,
          has_background: true,
          background_color: "bg-blue-100",
          text_color: "text-blue-800",
        },
        {
          content:
            "Important : Mise à jour de sécurité disponible pour tous nos clients",
          active: false,
          has_background: false,
          background_color: null,
          text_color: "text-red-600",
        },
      ],
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
