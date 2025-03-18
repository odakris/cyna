import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

// Liste de prénoms et noms génériques
const firstNames = [
  "Alice",
  "Bob",
  "Charlie",
  "David",
  "Eve",
  "Frank",
  "Grace",
  "Hannah",
  "Isaac",
  "Jack",
]

const lastNames = [
  "Dupont",
  "Lemoine",
  "Martin",
  "Bernard",
  "Petit",
  "Robert",
  "Dufresne",
  "Lopez",
  "Tanguy",
  "Lemoine",
]

async function main() {
  // Création des catégories
  const prevention = await prisma.category.create({
    data: {
      name: "Prévention",
      description: "Services dédiés à la prévention des cyber-risques.",
      image: "image_prevention.jpg",
    },
  })

  const protection = await prisma.category.create({
    data: {
      name: "Protection",
      description: "Services dédiés à la protection contre les menaces cyber.",
      image: "image_protection.jpg",
    },
  })

  const reponse = await prisma.category.create({
    data: {
      name: "Réponse",
      description: "Services dédiés à la réponse aux incidents de sécurité.",
      image: "image_reponse.jpg",
    },
  })

  // Création des produits
  const produits = [
    {
      name: "Diagnostic Cyber",
      unit_price: 4500,
      description: "Diagnostic des cyber-risques",
      image: "image_diagnostic_cyber.jpg",
      stock: 5,
      id_category: prevention.id_category,
    },
    {
      name: "Test d'intrusion",
      unit_price: 4000,
      description: "Test d'intrusion pour évaluer la sécurité",
      image: "image_test_intrusion.jpg",
      stock: 2,
      id_category: prevention.id_category,
    },
    {
      name: "Micro SOC",
      unit_price: 5000,
      description: "Surveillance continue de la sécurité",
      image: "image_micro_soc.jpg",
      stock: 0,
      id_category: protection.id_category,
    },
    {
      name: "SOC Managé",
      unit_price: 7000,
      description: "SOC avec gestion managée",
      image: "image_soc_manage.jpg",
      stock: 3,
      id_category: protection.id_category,
    },
    {
      name: "Investigation, éradication, remédiation",
      unit_price: 8500,
      description: "Réponse complète aux incidents de sécurité",
      image: "image_investigation.jpg",
      stock: 5,
      id_category: reponse.id_category,
    },
  ]

  // Insertion des produits et récupération de leurs IDs
  const createdProduits = []
  for (const produit of produits) {
    const createdProduit = await prisma.product.create({
      data: {
        name: produit.name,
        description: produit.description,
        technical_specs: "Caractéristiques techniques à définir",
        unit_price: produit.unit_price,
        available: true,
        priority_order: 1,
        last_updated: new Date(),
        id_category: produit.id_category,
        image: produit.image,
        stock: produit.stock,
      },
    })
    createdProduits.push(createdProduit)
  }

  // Création d'un utilisateur admin pour le back-office
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: "adminpassword123", // À hacher dans un environnement réel ==> const hashedPassword = await bcrypt.hash("adminpassword123", 10);
      role: "ADMIN",
    },
  })
  console.log("Utilisateur admin créé :", {
    email: adminUser.email,
    password: "adminpassword123", // À utiliser pour tester la connexion
    role: adminUser.role,
  })

  // Création de 10 utilisateurs et leurs clients associés
  for (let i = 0; i < 10; i++) {
    const firstName = firstNames[i]
    const lastName = lastNames[i]
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`

    // Création d'un utilisateur avec rôle "client"
    const user = await prisma.user.create({
      data: {
        email: email,
        password: "hashedpassword", // À remplacer par un vrai hash dans un vrai projet
        role: "CLIENT",
      },
    })

    // Création du client lié à cet utilisateur
    const client = await prisma.client.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email: email,
        id_user: user.id_user, // Liaison avec l'utilisateur
      },
    })

    // Création de 3 adresses pour chaque client
    for (let j = 0; j < 3; j++) {
      await prisma.clientAddress.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          street: `${i + 1} Rue de Paris`,
          postal_code: `7500${i + 1}`,
          city: "Paris",
          region: "Île-de-France",
          country: "France",
          mobile_phone: `01234567${i + 1}`,
          is_default_billing: j === 0,
          is_default_shipping: j === 0,
          id_client: client.id_client,
        },
      })
    }

    // Création de 3 infos de paiement pour chaque client
    for (let k = 0; k < 3; k++) {
      await prisma.paymentInfo.create({
        data: {
          card_name: `Carte ${firstName} ${lastName} - ${k + 1}`,
          last_card_digits: `123${k + 1}`,
          expiration_month: 12,
          expiration_year: 2025,
          is_default_payment: k === 0,
          id_client: client.id_client,
        },
      })
    }

    // Création de 3 commandes pour chaque client
    for (let j = 0; j < 3; j++) {
      const order = await prisma.order.create({
        data: {
          order_date: new Date(),
          subscription_type: "Annuel",
          subscription_duration: 12,
          total_amount: 4500 + j * 100,
          order_status: "En attente",
          payment_method: "Carte bancaire",
          last_card_digits: "1234",
          invoice_pdf_url: `https://example.com/facture${i + 1}_${j + 1}.pdf`,
          renewal_date: new Date(),
          id_client: client.id_client,
        },
      })

      // Sélection aléatoire de 1 à 3 produits pour cette commande
      const numberOfProducts = Math.floor(Math.random() * 3) + 1
      const randomProducts = getRandomProducts(
        createdProduits,
        numberOfProducts
      )

      // Insertion des liens produits_commande
      for (const produit of randomProducts) {
        await prisma.orderedProduct.create({
          data: {
            id_product: produit.id_product,
            id_order: order.id_order,
          },
        })
      }
    }
  }

  // Création de 10 messages dans la table ContactMessage
  for (let i = 0; i < 10; i++) {
    const firstName = firstNames[i]
    const lastName = lastNames[i]
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`
    const subject = `Message de ${firstName} ${lastName}`
    const message = `Bonjour, je suis ${firstName} ${lastName}, et j'ai une question concernant vos services.`

    await prisma.contactMessage.create({
      data: {
        email: email,
        subject: subject,
        message: message,
      },
    })
  }

  console.log("Base de données peuplée avec succès.")
}

// Fonction pour obtenir des produits au hasard
function getRandomProducts(produits, count) {
  const shuffled = [...produits].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
