export type ProductType = {
    id_produit: number
    nom: string
    description?: string
    caracteristiques_techniques?: string
    prix_unitaire: number
    disponible: boolean
    ordre_priorite: number
    date_maj: Date
    id_categorie: number
    image: string
  }
  