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
  const prevention = await prisma.categorie.create({
    data: {
      nom: "Prévention",
      description: "Services dédiés à la prévention des cyber-risques.",
      image: "image_prevention.jpg",
    },
  })

  const protection = await prisma.categorie.create({
    data: {
      nom: "Protection",
      description: "Services dédiés à la protection contre les menaces cyber.",
      image: "image_protection.jpg",
    },
  })

  const reponse = await prisma.categorie.create({
    data: {
      nom: "Réponse",
      description: "Services dédiés à la réponse aux incidents de sécurité.",
      image: "image_reponse.jpg",
    },
  })

  // Création des produits
  const produits = [
    {
      nom: "Diagnostic Cyber",
      prix_unitaire: 4500,
      description: "Diagnostic des cyber-risques",
      image: "image_diagnostic_cyber.jpg",
      stock: 5,
      id_categorie: prevention.id_categorie,
    },
    {
      nom: "Test d'intrusion",
      prix_unitaire: 4000,
      description: "Test d'intrusion pour évaluer la sécurité",
      image: "image_test_intrusion.jpg",
      stock: 2,
      id_categorie: prevention.id_categorie,
    },
    {
      nom: "Micro SOC",
      prix_unitaire: 5000,
      description: "Surveillance continue de la sécurité",
      image: "image_micro_soc.jpg",
      stock: 0,
      id_categorie: protection.id_categorie,
    },
    {
      nom: "SOC Managé",
      prix_unitaire: 7000,
      description: "SOC avec gestion managée",
      image: "image_soc_manage.jpg",
      stock: 3,
      id_categorie: protection.id_categorie,
    },
    {
      nom: "Investigation, éradication, remédiation",
      prix_unitaire: 8500,
      description: "Réponse complète aux incidents de sécurité",
      image: "image_investigation.jpg",
      stock: 5,
      id_categorie: reponse.id_categorie,
    },
  ]

  // Insertion des produits et récupération de leurs IDs
  const createdProduits = []
  for (const produit of produits) {
    const createdProduit = await prisma.produit.create({
      data: {
        nom: produit.nom,
        description: produit.description,
        caracteristiques_techniques: "Caractéristiques techniques à définir",
        prix_unitaire: produit.prix_unitaire,
        disponible: true,
        ordre_priorite: 1,
        date_maj: new Date(),
        id_categorie: produit.id_categorie,
        image: produit.image,
        stock: produit.stock,
      },
    })
    createdProduits.push(createdProduit) // Stocker les produits créés
  }

  // Création de 10 clients
  for (let i = 0; i < 10; i++) {
    const firstName = firstNames[i]
    const lastName = lastNames[i]
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`

    const client = await prisma.client.create({
      data: {
        nom: firstName,
        prenom: lastName,
        email: email,
        mot_de_passe: "hashedpassword",
      },
    })

    // Création de 3 adresses pour chaque client
    for (let j = 0; j < 3; j++) {
      await prisma.adresse_Client.create({
        data: {
          prenom: firstName,
          nom: lastName,
          rue: `${i + 1} Rue de Paris`,
          cp: `7500${i + 1}`,
          ville: "Paris",
          region: "Île-de-France",
          pays: "France",
          telephone_mobile: `01234567${i + 1}`,
          est_facturation_defaut: j === 0,
          est_livraison_defaut: j === 0,
          id_client: client.id_client,
        },
      })
    }

    // Création de 3 infos de paiement pour chaque client
    for (let k = 0; k < 3; k++) {
      await prisma.info_Paiement.create({
        data: {
          nom_carte: `Carte ${firstName} ${lastName} - ${k + 1}`,
          numero_carte: `411111111111111${k + 1}`,
          date_expiration: new Date(2025, 12, 31),
          CVV: `${Math.floor(Math.random() * 900) + 100}`,
          est_paiement_defaut: k === 0,
          id_client: client.id_client,
        },
      })
    }

    // Création de 3 commandes pour chaque client
    for (let j = 0; j < 3; j++) {
      const commande = await prisma.commande.create({
        data: {
          date_commande: new Date(),
          type_abonnement: "Annuel",
          duree_abonnement: 12,
          montant_total: 4500 + j * 100,
          statut_commande: "En attente",
          mode_paiement: "Carte bancaire",
          dernier_chiffre_cb: "1234",
          facture_pdf_url: `https://example.com/facture${i + 1}_${j + 1}.pdf`,
          date_renouvellement: new Date(),
          id_client: client.id_client,
        },
      })

      // Sélection aléatoire de 1 à 3 produits pour cette commande
      const numberOfProducts = Math.floor(Math.random() * 3) + 1 // 1 à 3 produits
      const randomProducts = getRandomProducts(
        createdProduits,
        numberOfProducts
      )

      // Insertion des liens produits_commande
      for (const produit of randomProducts) {
        await prisma.produit_Commande.create({
          data: {
            id_produit: produit.id_produit, // Utilisation du bon id_produit
            id_commande: commande.id_commande,
          },
        })
      }
    }
  }

  // Création de 10 messages dans la table Message_Contact
  for (let i = 0; i < 10; i++) {
    const firstName = firstNames[i]
    const lastName = lastNames[i]
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`
    const subject = `Message de ${firstName} ${lastName}`
    const message = `Bonjour, je suis ${firstName} ${lastName}, et j'ai une question concernant vos services.`

    // Insertion du message dans la table Message_Contact
    await prisma.message_Contact.create({
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
  const shuffled = [...produits].sort(() => 0.5 - Math.random()) // Mélange des produits
  return shuffled.slice(0, count) // Sélectionner les premiers produits
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
