import React from "react"
import ProductPageBis from "../../components/ProductPage/ProductPage"

const exampleProductData = {
  title: "TITRE PAGE PRODUIT",
  description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            finibus accumsan lectus, id euismod nibh tempor vitae. Donec elit
            turpis, suscipit sit amet elit vel, egestas auctor nulla. Sed nec
            pharetra tellus. Mauris porta mattis nunc at iaculis. Suspendisse
            potenti. Donec in tincidunt lacus. Maecenas eget efficitur dui.
            Nulla faucibus commodo tincidunt. Sed dui ipsum, eleifend sed arcu
            in, aliquet cursus turpis. Sed posuere eros tellus, eu condimentum
            dolor tincidunt a. Maecenas in aliquet est. Donec vitae lacinia
            neque. Fusce neque tortor, pretium quis dolor a, dictum dapibus.`,
  desc_technique: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            finibus accumsan lectus, id euismod nibh tempor vitae. Donec elit
            turpis, suscipit sit amet elit vel, egestas auctor nulla. Sed nec
            pharetra tellus. Mauris porta mattis nunc at iaculis. Suspendisse
            potenti. Donec in tincidunt lacus. Maecenas eget efficitur dui.
            Nulla faucibus commodo tincidunt. Sed dui ipsum, eleifend sed arcu
            in, aliquet cursus turpis. Sed posuere eros tellus, eu condimentum
            dolor tincidunt a. Maecenas in aliquet est. Donec vitae lacinia
            neque. Fusce neque tortor, pretium quis dolor a, dictum dapibus.`,
  availabilityText: "Stock limité, disponible immédiatement!",
  subscriptionButtonText: "S'abonner maintenant !",
  products: [
    {
      id: 1,
      title: "PC Gamer RTX 4090",
      name: "PC Gamer",
      description: "Un PC ultra puissant avec une RTX 4090 et un i9-13900K.",
      image: "/images/cyber1.jpg",
      price: "3,499",
      stock: 4,
    },
    {
      id: 2,
      title: "Clavier Mécanique RGB",
      name: "Clavier Gaming",
      description: "Un clavier mécanique RGB avec switches personnalisables.",
      image: "/images/cyber2.jpg",
      price: "129",
      stock: 10,
    },
    {
      id: 3,
      title: "Souris Gaming Pro",
      name: "Souris Gamer",
      description: "Une souris gaming ultra précise avec 16 000 DPI.",
      image: "/images/cyber3.jpg",
      price: "89",
      stock: 0,
    },
    {
      id: 4,
      title: "Casque Audio Surround 7.1",
      name: "Casque Gaming",
      description: "Un casque immersif avec son surround 7.1 et microphone.",
      image: "/images/cyber4.jpg",
      price: "159",
      stock: 3,
    },
  ],
  plans: [
    {
      chipLabel: "Mensuel",
      planTitle: "Accès de base",
      features: [
        "Support Standard",
        "Essai gratuit de 14 jours",
        "Fonctionnalités basiques",
        "Personnalisation (non disponible)",
      ],
      price: "15,00€",
      period: "mois",
      buttonText: "S'abonner",
      buttonVariant: "soft",
      buttonColor: "neutral",
    },
    {
      chipLabel: "Annuel",
      planTitle: "Accès complet",
      features: [
        "Support Premium",
        "Essai gratuit de 30 jours",
        "Fonctionnalités complètes",
        "Personnalisation",
      ],
      price: "144,00€",
      period: "année",
      buttonText: "S'abonner",
      buttonVariant: "soft",
      buttonColor: "neutral",
    },
    {
      chipLabel: "Par utilisateur",
      planTitle: "Accès limité",
      features: [
        "Support Standard",
        "Essai gratuit de 7 jours",
        "Fonctionnalités limitées",
        "Personnalisation",
      ],
      price: "10,00€",
      period: "mois",
      buttonText: "S'abonner",
      buttonVariant: "soft",
      buttonColor: "neutral",
    },
  ],
}

const page = () => {
  return (
    <div>
      <ProductPageBis {...exampleProductData} />
    </div>
  )
}

export default page
