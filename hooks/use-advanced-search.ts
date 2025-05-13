import { useState, useEffect, useCallback } from "react"
import { Product } from "@prisma/client"
import { ActiveFilters, SortOptions } from "@/types/Types"

export function useAdvancedSearch() {
  // États pour les champs de recherche
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [features, setFeatures] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [priceInput, setPriceInput] = useState({ min: "0", max: "10000" })
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  // État pour les produits
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)

  // État pour les filtres et le tri
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    price: "asc",
    newness: "new",
    availability: "available",
  })

  // État pour les filtres actifs
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    title: null,
    description: null,
    features: null,
    minPrice: null,
    maxPrice: null,
    category: null,
    onlyAvailable: false,
  })

  // Fonction pour trier les produits
  const sortProducts = useCallback(
    (productsToSort: Product[], options = sortOptions) => {
      return [...productsToSort].sort((a, b) => {
        if (a.available !== b.available) {
          if (options.availability === "available") {
            return a.available ? -1 : 1
          } else {
            return a.available ? 1 : -1
          }
        }

        // Ensuite comparer par prix si les options le spécifient
        if (a.unit_price !== b.unit_price) {
          return options.price === "asc"
            ? a.unit_price - b.unit_price
            : b.unit_price - a.unit_price
        }

        // Finalement comparer par date
        const dateA = new Date(a.updated_at)
        const dateB = new Date(b.updated_at)
        return options.newness === "new"
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime()
      })
    },
    [sortOptions]
  )

  // Mettre à jour les produits affichés quand les options de tri changent
  useEffect(() => {
    const sorted =
      filteredProducts.length > 0 ? sortProducts(filteredProducts) : []
    setDisplayedProducts(sorted)
  }, [sortOptions, filteredProducts, sortProducts])

  useEffect(() => {
    console.log("Filtres actifs:", activeFilters)
  }, [activeFilters])

  // Effet pour charger tous les produits au démarrage
  const fetchProducts = useCallback(
    async (filters?: Partial<ActiveFilters>) => {
      setLoading(true)
      try {
        console.log("Fetching with filters:", filters)

        const query = new URLSearchParams()

        // Ajouter les filtres à la requête
        if (filters?.title) query.append("query", filters.title)
        if (filters?.description)
          query.append("description", filters.description)
        if (filters?.features) query.append("features", filters.features)
        if (filters?.minPrice !== null && filters?.minPrice !== undefined)
          query.append("minPrice", String(filters.minPrice))
        if (
          filters?.maxPrice !== null &&
          filters?.maxPrice !== undefined &&
          filters.maxPrice < 10000
        )
          query.append("maxPrice", String(filters.maxPrice))
        if (filters?.onlyAvailable) query.append("onlyAvailable", "true")
        if (
          filters?.category &&
          filters.category !== "all" &&
          filters.category !== ""
        )
          query.append("category", filters.category)

        console.log(
          "API Request URL:",
          `/api/products/search?${query.toString()}`
        )

        const response = await fetch(`/api/products/search?${query.toString()}`)
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`)
        }

        const data = await response.json()
        console.log(`Fetched ${data.length} products`)

        setFilteredProducts(data)
      } catch (error) {
        // console.error("Erreur lors de la récupération des produits:", error)
        setFilteredProducts([])
        setDisplayedProducts([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // Fonction pour mettre à jour le tri
  const updateSort = (
    key: keyof SortOptions,
    value: string | number | boolean
  ) => {
    setSortOptions(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  // Fonction pour gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Valider les entrées de prix
    const minPrice = priceInput.min ? Number(priceInput.min) : 0
    const maxPrice = priceInput.max ? Number(priceInput.max) : 10000

    if (minPrice > maxPrice) {
      alert("Le prix minimum ne peut pas être supérieur au prix maximum.")
      return
    }

    // Mettre à jour les filtres actifs
    const newFilters: ActiveFilters = {
      title: title.trim() || null,
      description: description.trim() || null,
      features: features.trim() || null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      category: selectedCategory || null,
      onlyAvailable: onlyAvailable,
    }

    console.log("Applying new filters:", newFilters)
    setActiveFilters(newFilters)

    // Effectuer la recherche
    fetchProducts(newFilters)
  }

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    setTitle("")
    setDescription("")
    setFeatures("")
    setPriceRange([0, 10000])
    setPriceInput({ min: "0", max: "10000" })
    setSelectedCategory("")
    setOnlyAvailable(false)

    setActiveFilters({
      title: null,
      description: null,
      features: null,
      minPrice: null,
      maxPrice: null,
      category: null,
      onlyAvailable: false,
    })

    fetchProducts()
  }

  // Fonction pour gérer les changements de prix
  const handlePriceRangeChange = (values: number[]) => {
    if (values.length === 2) {
      setPriceRange([values[0], values[1]])
      setPriceInput({
        min: values[0].toString(),
        max: values[1].toString(),
      })
    }
  }

  // Fonction pour gérer les entrées manuelles de prix
  const handlePriceInputChange = (type: "min" | "max", value: string) => {
    if (value === "" || /^\d+$/.test(value)) {
      if (type === "min") {
        setPriceInput(prev => ({ ...prev, min: value }))
        if (value !== "") {
          setPriceRange([Number(value), priceRange[1]])
        }
      } else {
        setPriceInput(prev => ({ ...prev, max: value }))
        if (value !== "") {
          setPriceRange([priceRange[0], Number(value)])
        }
      }
    }
  }

  // Fonction pour supprimer un filtre actif
  const removeFilter = (key: keyof ActiveFilters) => {
    // Créer une copie de l'état actuel
    const updatedFilters = { ...activeFilters }

    // Mettre à jour l'état correspondant et la copie
    if (key === "title") {
      setTitle("")
      updatedFilters.title = null
    } else if (key === "description") {
      setDescription("")
      updatedFilters.description = null
    } else if (key === "features") {
      setFeatures("")
      updatedFilters.features = null
    } else if (key === "minPrice") {
      setPriceInput(prev => ({ ...prev, min: "0" }))
      setPriceRange([0, priceRange[1]])
      updatedFilters.minPrice = null
    } else if (key === "maxPrice") {
      setPriceInput(prev => ({ ...prev, max: "10000" }))
      setPriceRange([priceRange[0], 10000])
      updatedFilters.maxPrice = null
    } else if (key === "category") {
      setSelectedCategory("")
      updatedFilters.category = null
    } else if (key === "onlyAvailable") {
      setOnlyAvailable(false)
      updatedFilters.onlyAvailable = false
    }

    console.log("Updated filters after removing", key, ":", updatedFilters)

    // Mettre à jour les filtres actifs
    setActiveFilters(updatedFilters)

    // Refaire la recherche avec tous les filtres mis à jour
    fetchProducts(updatedFilters)
  }

  // Fonction pour vérifier si au moins un filtre est actif
  const hasActiveFilters = () => {
    return Object.values(activeFilters).some(
      value => value !== null && (typeof value !== "boolean" || value === true)
    )
  }

  return {
    // États
    title,
    description,
    features,
    priceRange,
    priceInput,
    selectedCategory,
    onlyAvailable,
    filteredProducts,
    displayedProducts,
    loading,
    isFilterMenuOpen,
    sortOptions,
    activeFilters,

    // Manipulateurs d'état
    setTitle,
    setDescription,
    setFeatures,
    setPriceRange,
    setPriceInput,
    setSelectedCategory,
    setOnlyAvailable,
    setIsFilterMenuOpen,

    // Fonctions
    updateSort,
    handleSearch,
    resetFilters,
    handlePriceRangeChange,
    handlePriceInputChange,
    removeFilter,
    hasActiveFilters,
  }
}
