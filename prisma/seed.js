import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

// Utilise une image d'une API comme Lorem Picsum
function generateRandomImageUrl() {
  const width = 200
  const height = 200
  return `https://picsum.photos/${width}/${height}`
}

async function main() {
  // Insertion des 10 catégories
  for (let i = 0; i < 10; i++) {
    const categorie = await prisma.categorie.create({
      data: {
        nom: faker.commerce.department(),
        description: faker.commerce.productDescription(),
        image: generateRandomImageUrl(), // Génère une URL d'image aléatoire
      },
    })
    console.log(`Catégorie créée: ${categorie.nom}`)
  }

  // Insertion des 10 produits
  for (let i = 0; i < 10; i++) {
    const produit = await prisma.produit.create({
      data: {
        nom: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        caracteristiques_techniques: faker.commerce.productMaterial(),
        prix_unitaire: parseFloat(faker.commerce.price()),
        disponible: faker.datatype.boolean(),
        ordre_priorite: faker.number.int({ min: 1, max: 5 }), // Correction ici
        date_maj: faker.date.past(),
        id_categorie: faker.number.int({ min: 1, max: 10 }), // Correction ici
        image: generateRandomImageUrl(), // Utilisation de la fonction d'image aléatoire
      },
    })
    console.log(`Produit créé: ${produit.nom}`)
  }

  // Insertion des 10 clients
  for (let i = 0; i < 10; i++) {
    const client = await prisma.client.create({
      data: {
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        email: faker.internet.email(),
        mot_de_passe: faker.internet.password(),
      },
    })
    console.log(`Client créé: ${client.nom} ${client.prenom}`)
  }

  // Insertion des 10 adresses pour chaque client
  for (let i = 0; i < 10; i++) {
    const adresse = await prisma.adresse_Client.create({
      data: {
        prenom: faker.person.firstName(),
        nom: faker.person.lastName(),
        rue: faker.location.streetAddress(), // Remplacé `address` par `location`
        complement: faker.location.secondaryAddress(),
        cp: faker.location.zipCode(),
        ville: faker.location.city(),
        region: faker.location.state(),
        pays: faker.location.country(),
        telephone_mobile: faker.phone.number(), // Utilisation de faker.phone.number()
        est_facturation_defaut: faker.datatype.boolean(),
        est_livraison_defaut: faker.datatype.boolean(),
        id_client: i + 1, // Associer l'adresse à un client existant
      },
    })
    console.log(
      `Adresse créée pour le client: ${adresse.prenom} ${adresse.nom}`
    )
  }

  // Insertion des 10 commandes pour chaque client (exemple simple)
  for (let i = 0; i < 10; i++) {
    const commande = await prisma.commande.create({
      data: {
        date_commande: faker.date.recent(),
        type_abonnement: faker.helpers.arrayElement(["Mensuel", "Annuel"]),
        duree_abonnement: faker.number.int({ min: 1, max: 12 }), // Durée en mois
        montant_total: parseFloat(faker.commerce.price()),
        statut_commande: faker.helpers.arrayElement([
          "En cours",
          "Livré",
          "Annulé",
        ]),
        mode_paiement: faker.helpers.arrayElement([
          "Carte bancaire",
          "PayPal",
          "Virement",
        ]),
        dernier_chiffre_cb: faker.finance.creditCardNumber().slice(-4), // Derniers chiffres de la carte
        facture_pdf_url: faker.internet.url(),
        date_renouvellement: faker.date.future(),
        id_client: faker.number.int({ min: 1, max: 10 }),
      },
    })
    console.log(`Commande créée: ${commande.id_commande}`)
  }

  // Associer des produits aux commandes (produit_commande)
  for (let i = 0; i < 10; i++) {
    const produitsCommandes = await prisma.produit_Commande.create({
      data: {
        id_produit: faker.number.int({ min: 1, max: 10 }), // Associe un produit existant
        id_commande: i + 1, // Associe une commande existante
      },
    })
    console.log(
      `Produit ajouté à la commande: ${produitsCommandes.id_produit_commande}`
    )
  }

  // Ajoute des infos de paiement pour les clients
  for (let i = 0; i < 10; i++) {
    const infoPaiement = await prisma.info_Paiement.create({
      data: {
        nom_carte: faker.finance.creditCardIssuer(), // Remplacer par la méthode correcte
        numero_carte: faker.finance.creditCardNumber(),
        date_expiration: faker.date.future(),
        CVV: faker.finance.creditCardCVV(),
        est_paiement_defaut: faker.datatype.boolean(),
        id_client: faker.number.int({ min: 1, max: 10 }),
      },
    })
    console.log(
      `Information de paiement ajoutée pour le client: ${infoPaiement.id_info_paiement}`
    )
  }
}

main()
  .catch(e => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
