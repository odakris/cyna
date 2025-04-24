"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Product, Category } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  ChevronDown,
  ChevronUp,
  Search,
  ArrowDownAZ,
  Calendar,
  Package2,
  X,
  SlidersHorizontal,
} from "lucide-react"
import { ProductCard } from "@/components/Products/ProductCard"
import { BaseProductGrid } from "@/components/Products/BaseProductGrid"
import { formatEuro } from "@/lib/utils/format"

// Type pour les filtres actifs
type ActiveFilters = {
  title: string | null
  description: string | null
  features: string | null
  minPrice: number | null
  maxPrice: number | null
  category: string | null
  onlyAvailable: boolean
}

// Type pour les options de tri
type SortOptions = {
  price: "asc" | "desc"
  newness: "new" | "old"
  availability: "available" | "unavailable"
}

type AdvancedSearchProps = {
  categories: Category[]
}

export default function AdvancedSearch({ categories }: AdvancedSearchProps) {
  // États pour les champs de recherche
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [features, setFeatures] = useState("")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [priceInput, setPriceInput] = useState({ min: "0", max: "10000" })
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  // État pour les produits
  const [products, setProducts] = useState<Product[]>([])
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
    (products: Product[]) => {
      const sortedProducts = [...products]

      // Tri par prix
      sortedProducts.sort((a, b) => {
        return sortOptions.price === "asc"
          ? a.unit_price - b.unit_price
          : b.unit_price - a.unit_price
      })

      // Tri par disponibilité
      sortedProducts.sort((a, b) => {
        if (sortOptions.availability === "available") {
          return a.available === b.available ? 0 : a.available ? -1 : 1
        } else {
          return a.available === b.available ? 0 : a.available ? 1 : -1
        }
      })

      // Tri par nouveauté
      sortedProducts.sort((a, b) => {
        const dateA = new Date(a.updated_at)
        const dateB = new Date(b.updated_at)
        return sortOptions.newness === "new"
          ? dateB.getTime() - dateA.getTime()
          : dateA.getTime() - dateB.getTime()
      })

      return sortedProducts
    },
    [sortOptions]
  )

  // Effet pour charger tous les produits au démarrage
  const fetchProducts = useCallback(
    async (filters?: Partial<ActiveFilters>) => {
      setLoading(true)
      try {
        const query = new URLSearchParams()

        // Ajouter les filtres à la requête
        if (filters?.title) query.append("query", filters.title)
        if (filters?.description)
          query.append("description", filters.description)
        if (filters?.features) query.append("features", filters.features)
        if (filters?.minPrice)
          query.append("minPrice", String(filters.minPrice))
        if (filters?.maxPrice)
          query.append("maxPrice", String(filters.maxPrice))
        if (filters?.onlyAvailable) query.append("onlyAvailable", "true")
        if (filters?.category && filters.category !== "all")
          query.append("category", filters.category)

        const response = await fetch(`/api/products/search?${query.toString()}`)
        if (!response.ok) {
          throw new Error(`Erreur HTTP : ${response.status}`)
        }

        let data = await response.json()

        // Appliquer le tri
        data = sortProducts(data)

        setProducts(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error)
      } finally {
        setLoading(false)
      }
    },
    [sortProducts]
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

    // Trier à nouveau les produits avec les nouvelles options
    setProducts(prev => sortProducts([...prev]))
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
      title: title || null,
      description: description || null,
      features: features || null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      category: selectedCategory || null,
      onlyAvailable: onlyAvailable,
    }

    setActiveFilters(newFilters)

    // Effectuer la recherche
    fetchProducts({
      title,
      description,
      features,
      minPrice,
      maxPrice,
      category: selectedCategory,
      onlyAvailable,
    })
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
    // Mettre à jour l'état correspondant
    if (key === "title") setTitle("")
    if (key === "description") setDescription("")
    if (key === "features") setFeatures("")
    if (key === "minPrice" || key === "maxPrice") {
      if (key === "minPrice") {
        setPriceInput(prev => ({ ...prev, min: "0" }))
        setPriceRange([0, priceRange[1]])
      } else {
        setPriceInput(prev => ({ ...prev, max: "10000" }))
        setPriceRange([priceRange[0], 10000])
      }
    }
    if (key === "category") setSelectedCategory("")
    if (key === "onlyAvailable") setOnlyAvailable(false)

    // Mettre à jour les filtres actifs
    const newFilters = {
      ...activeFilters,
      [key]: key === "onlyAvailable" ? false : null,
    }
    setActiveFilters(newFilters)

    // Refaire la recherche avec les filtres mis à jour
    fetchProducts({
      title: key === "title" ? null : activeFilters.title,
      description: key === "description" ? null : activeFilters.description,
      features: key === "features" ? null : activeFilters.features,
      minPrice: key === "minPrice" ? null : activeFilters.minPrice,
      maxPrice: key === "maxPrice" ? null : activeFilters.maxPrice,
      category: key === "category" ? null : activeFilters.category,
      onlyAvailable:
        key === "onlyAvailable" ? false : activeFilters.onlyAvailable,
    })
  }

  // Fonction pour vérifier si au moins un filtre est actif
  const hasActiveFilters = () => {
    return Object.values(activeFilters).some(
      value => value !== null && (typeof value !== "boolean" || value === true)
    )
  }

  // Rendu des filtres actifs
  const renderActiveFilters = () => {
    if (!hasActiveFilters()) return null

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {activeFilters.title && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-100"
          >
            Titre: {activeFilters.title}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 rounded-full"
              onClick={() => removeFilter("title")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {activeFilters.description && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-100"
          >
            Description: {activeFilters.description}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 rounded-full"
              onClick={() => removeFilter("description")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {activeFilters.features && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-100"
          >
            Caractéristiques: {activeFilters.features}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 rounded-full"
              onClick={() => removeFilter("features")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {activeFilters.minPrice && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-100"
          >
            Prix min: {formatEuro(activeFilters.minPrice)}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 rounded-full"
              onClick={() => removeFilter("minPrice")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {activeFilters.maxPrice && activeFilters.maxPrice < 10000 && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-100"
          >
            Prix max: {formatEuro(activeFilters.maxPrice)}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 rounded-full"
              onClick={() => removeFilter("maxPrice")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {activeFilters.category && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-100"
          >
            Catégorie:{" "}
            {
              categories.find(
                c => c.id_category.toString() === activeFilters.category
              )?.name
            }
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 rounded-full"
              onClick={() => removeFilter("category")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {activeFilters.onlyAvailable && (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-gray-100"
          >
            Uniquement disponibles
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 rounded-full"
              onClick={() => removeFilter("onlyAvailable")}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {hasActiveFilters() && (
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-red-500"
            onClick={resetFilters}
          >
            Effacer tous les filtres
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#302082] mb-2">
          Recherche avancée
        </h1>
        <p className="text-gray-600">
          Trouvez le service SaaS idéal pour répondre à vos besoins en
          cybersécurité
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Panneau de filtres pour grands écrans */}
        <Card className="lg:col-span-3 hidden lg:block h-fit sticky top-24">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <SlidersHorizontal className="mr-2 h-5 w-5" /> Filtres
            </h2>

            <form onSubmit={handleSearch} className="space-y-6">
              {/* Texte du titre */}
              <div className="space-y-2">
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Rechercher par titre..."
                  className="border-[#302082]/30 focus:border-[#302082]"
                />
              </div>

              {/* Texte de la description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Rechercher dans les descriptions..."
                  className="border-[#302082]/30 focus:border-[#302082]"
                />
              </div>

              {/* Caractéristiques techniques */}
              <div className="space-y-2">
                <Label htmlFor="features">Caractéristiques techniques</Label>
                <Input
                  id="features"
                  value={features}
                  onChange={e => setFeatures(e.target.value)}
                  placeholder="Rechercher dans les caractéristiques..."
                  className="border-[#302082]/30 focus:border-[#302082]"
                />
              </div>

              {/* Prix */}
              <div className="space-y-4">
                <Label>Prix</Label>
                <div className="pt-2 px-1">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={10000}
                    step={100}
                    onValueChange={handlePriceRangeChange}
                    className="my-6"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="minPrice" className="text-xs">
                      Min
                    </Label>
                    <Input
                      id="minPrice"
                      value={priceInput.min}
                      onChange={e =>
                        handlePriceInputChange("min", e.target.value)
                      }
                      className="border-[#302082]/30 focus:border-[#302082]"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label htmlFor="maxPrice" className="text-xs">
                      Max
                    </Label>
                    <Input
                      id="maxPrice"
                      value={priceInput.max}
                      onChange={e =>
                        handlePriceInputChange("max", e.target.value)
                      }
                      className="border-[#302082]/30 focus:border-[#302082]"
                    />
                  </div>
                </div>
              </div>

              {/* Catégories */}
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger
                    id="category"
                    className="border-[#302082]/30 focus:border-[#302082]"
                  >
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map(category => (
                      <SelectItem
                        key={category.id_category}
                        value={category.id_category.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Uniquement disponibles */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="onlyAvailable"
                  checked={onlyAvailable}
                  onCheckedChange={checked =>
                    setOnlyAvailable(checked as boolean)
                  }
                />
                <Label htmlFor="onlyAvailable" className="cursor-pointer">
                  Uniquement services disponibles
                </Label>
              </div>

              {/* Boutons d'action */}
              <div>
                <Button type="submit" className="w-full" variant={"cyna"}>
                  <Search className="mr-2 h-4 w-4" /> Rechercher
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  className="text-gray-500 my-2 w-full"
                >
                  Réinitialiser
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contenu principal et résultats */}
        <div className="lg:col-span-9">
          {/* Bouton pour afficher les filtres sur mobile */}
          <div className="mb-4 lg:hidden">
            <Collapsible
              open={isFilterMenuOpen}
              onOpenChange={setIsFilterMenuOpen}
            >
              <div className="flex justify-between items-center mb-2">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full flex justify-between items-center"
                  >
                    <span className="flex items-center">
                      <SlidersHorizontal className="mr-2 h-5 w-5" /> Filtres
                    </span>
                    {isFilterMenuOpen ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent>
                <Card>
                  <CardContent className="p-4">
                    <form onSubmit={handleSearch} className="space-y-4">
                      {/* Version mobile des filtres */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title-mobile">Titre</Label>
                          <Input
                            id="title-mobile"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Rechercher par titre..."
                            className="border-[#302082]/30 focus:border-[#302082]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description-mobile">
                            Description
                          </Label>
                          <Input
                            id="description-mobile"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Rechercher dans les descriptions..."
                            className="border-[#302082]/30 focus:border-[#302082]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="features-mobile">
                          Caractéristiques techniques
                        </Label>
                        <Input
                          id="features-mobile"
                          value={features}
                          onChange={e => setFeatures(e.target.value)}
                          placeholder="Rechercher dans les caractéristiques..."
                          className="border-[#302082]/30 focus:border-[#302082]"
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>
                          Prix: {formatEuro(priceRange[0])} -{" "}
                          {formatEuro(priceRange[1])}
                        </Label>
                        <div className="pt-2 px-1">
                          <Slider
                            value={priceRange}
                            min={0}
                            max={10000}
                            step={100}
                            onValueChange={handlePriceRangeChange}
                            className="my-4"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="minPrice-mobile"
                              className="text-xs"
                            >
                              Min
                            </Label>
                            <Input
                              id="minPrice-mobile"
                              value={priceInput.min}
                              onChange={e =>
                                handlePriceInputChange("min", e.target.value)
                              }
                              className="border-[#302082]/30 focus:border-[#302082]"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor="maxPrice-mobile"
                              className="text-xs"
                            >
                              Max
                            </Label>
                            <Input
                              id="maxPrice-mobile"
                              value={priceInput.max}
                              onChange={e =>
                                handlePriceInputChange("max", e.target.value)
                              }
                              className="border-[#302082]/30 focus:border-[#302082]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category-mobile">Catégorie</Label>
                          <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger
                              id="category-mobile"
                              className="border-[#302082]/30 focus:border-[#302082]"
                            >
                              <SelectValue placeholder="Toutes les catégories" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                Toutes les catégories
                              </SelectItem>
                              {categories.map(category => (
                                <SelectItem
                                  key={category.id_category}
                                  value={category.id_category.toString()}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center space-x-2 self-end h-10">
                          <Checkbox
                            id="onlyAvailable-mobile"
                            checked={onlyAvailable}
                            onCheckedChange={checked =>
                              setOnlyAvailable(checked as boolean)
                            }
                          />
                          <Label
                            htmlFor="onlyAvailable-mobile"
                            className="cursor-pointer"
                          >
                            Uniquement services disponibles
                          </Label>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={resetFilters}
                          className="text-gray-500"
                        >
                          Réinitialiser
                        </Button>
                        <Button
                          type="submit"
                          className="bg-[#302082] hover:bg-[#302082]/90"
                        >
                          <Search className="mr-2 h-4 w-4" /> Rechercher
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Filtres actifs */}
          {renderActiveFilters()}

          {/* Options de tri */}
          <div className="flex flex-wrap justify-between items-center mt-6 mb-4">
            <h2 className="text-xl font-semibold mb-2">
              {products.length} service{products.length !== 1 ? "s" : ""} trouvé
              {products.length !== 1 ? "s" : ""}
            </h2>
            <div className="flex flex-wrap gap-2">
              {/* Tri par prix */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <ArrowDownAZ className="mr-2 h-4 w-4" />
                    Prix{" "}
                    {sortOptions.price === "asc" ? "croissant" : "décroissant"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Trier par prix</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={sortOptions.price}
                    onValueChange={value => updateSort("price", value)}
                  >
                    <DropdownMenuRadioItem value="asc">
                      Croissant
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc">
                      Décroissant
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tri par nouveauté */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {sortOptions.newness === "new"
                      ? "Plus récents"
                      : "Plus anciens"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Trier par date</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={sortOptions.newness}
                    onValueChange={value => updateSort("newness", value)}
                  >
                    <DropdownMenuRadioItem value="new">
                      Plus récents
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="old">
                      Plus anciens
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tri par disponibilité */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <Package2 className="mr-2 h-4 w-4" />
                    {sortOptions.availability === "available"
                      ? "Disponibles"
                      : "Non disponibles"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Trier par disponibilité</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={sortOptions.availability}
                    onValueChange={value => updateSort("availability", value)}
                  >
                    <DropdownMenuRadioItem value="available">
                      Disponibles d&apos;abord
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="unavailable">
                      Non disponibles d&apos;abord
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Résultats de recherche */}
          <BaseProductGrid loading={loading} isEmpty={products.length === 0}>
            {products.map(product => (
              <ProductCard key={product.id_product} {...product} />
            ))}
          </BaseProductGrid>
        </div>
      </div>
    </div>
  )
}
