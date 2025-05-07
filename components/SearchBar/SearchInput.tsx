"use client"

import React, { useState, useEffect, useRef } from "react"
import { Search, Loader2, X, Command } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CommandDialog, CommandInput } from "@/components/ui/command"
import { SearchResults } from "@/components/SearchBar/SearchResults"
import { useSearch } from "@/hooks/use-search"

interface SearchInputProps {
  variant?: "desktop" | "mobile" | "tablet"
  placeholder?: string
  className?: string
  width?: string
  onSubmit?: () => void
  resultsWidth?: string
}

export function SearchInput({
  variant = "desktop",
  placeholder = "Rechercher un produit...",
  className = "",
  width,
  onSubmit,
  resultsWidth,
}: SearchInputProps) {
  const {
    query,
    setQuery,
    results,
    isLoading,
    showResults,
    setShowResults,
    goToProduct,
    goToCategory,
    closeResults,
    performFullSearch,
  } = useSearch()

  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [openCommandDialog, setOpenCommandDialog] = useState(false)

  // Determine results width
  const getResultsWidth = (): string => {
    return resultsWidth || "w-full md:w-96"
  }

  // Determine input classes based on variant
  const getInputClass = () => {
    const baseClasses = "transition-all duration-300 ease-in-out"
    const focusEffects = isFocused
      ? "ring-2 ring-[#FF6B00]/30 ring-offset-2 ring-offset-[#302082] shadow-lg shadow-[#FF6B00]/10"
      : "shadow-sm"

    switch (variant) {
      case "mobile":
        return `${baseClasses} ${focusEffects} w-full h-10 px-4 pr-16 text-sm bg-gradient-to-r from-[#302082]/90 to-[#231968]/90 text-white border border-white/20 focus:border-[#FF6B00]/50 focus:bg-[#302082]/95 rounded-lg placeholder:text-white/60 font-medium`
      case "tablet":
        return `${baseClasses} ${focusEffects} h-10 px-4 pr-16 text-sm bg-gradient-to-r from-[#302082]/90 to-[#231968]/90 text-white border border-white/20 focus:border-[#FF6B00]/50 focus:bg-[#302082]/95 rounded-lg placeholder:text-white/60 font-medium`
      case "desktop":
      default:
        return `${baseClasses} ${focusEffects} ${width || "w-64"} h-10 px-4 pr-16 text-sm bg-gradient-to-r from-[#302082]/90 to-[#231968]/90 text-white border border-white/20 hover:bg-[#302082]/95 hover:border-[#FF6B00]/30 focus:border-[#FF6B00]/50 focus:bg-[#302082]/95 rounded-lg placeholder:text-white/60 font-medium`
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performFullSearch()
    if (onSubmit) onSubmit()
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showResults) {
        closeResults()
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        if (variant === "mobile" || variant === "tablet") {
          setOpenCommandDialog(true)
        } else {
          inputRef.current?.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showResults, closeResults, variant])

  return (
    <div className={`relative ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="relative group search-input-container"
      >
        <Input
          ref={inputRef}
          placeholder={placeholder}
          className={getInputClass()}
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            if (e.target.value.length >= 2) {
              setShowResults(true)
            } else {
              setShowResults(false)
            }
          }}
          onFocus={() => {
            setIsFocused(true)
            if (query.length >= 2) setShowResults(true)
          }}
          onBlur={() => setIsFocused(false)}
          aria-label="Rechercher des produits et catégories"
          aria-expanded={showResults}
          aria-controls={showResults ? "search-results" : undefined}
          aria-autocomplete="list"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1.5">
          {query.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-[#FF6B00]/20 focus:ring-2 focus:ring-[#FF6B00]/50 rounded-full"
              onClick={() => {
                setQuery("")
                setShowResults(false)
                inputRef.current?.focus()
              }}
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          <button
            type="submit"
            className="text-white/80 hover:text-white focus:text-white focus:outline-none transition-colors p-1.5 rounded-full hover:bg-[#FF6B00]/20 focus:bg-[#FF6B00]/20 focus:ring-2 focus:ring-[#FF6B00]/50"
            disabled={isLoading}
            aria-label="Rechercher"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#FF6B00]" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>

      {/* Search results dropdown */}
      {showResults && (
        <div className="search-results-container">
          <SearchResults
            isLoading={isLoading}
            results={results}
            query={query}
            closeResults={closeResults}
            goToProduct={goToProduct}
            goToCategory={goToCategory}
            performFullSearch={performFullSearch}
            width={getResultsWidth()}
          />
        </div>
      )}

      {/* Mobile-optimized command dialog */}
      <CommandDialog
        open={openCommandDialog}
        onOpenChange={setOpenCommandDialog}
      >
        <div className="p-4 flex flex-col gap-3 bg-white">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <Search className="h-5 w-5 text-gray-500" />
            <CommandInput
              placeholder="Rechercher des produits..."
              value={query}
              onValueChange={value => {
                setQuery(value)
                if (value.length >= 2) {
                  setShowResults(true)
                } else {
                  setShowResults(false)
                }
              }}
              className="command-input"
            />
            {query && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                onClick={() => setQuery("")}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>

          {showResults && (
            <div className="max-h-[70vh] overflow-hidden">
              <SearchResults
                isLoading={isLoading}
                results={results}
                query={query}
                closeResults={() => {
                  closeResults()
                  setOpenCommandDialog(false)
                }}
                goToProduct={id => {
                  goToProduct(id)
                  setOpenCommandDialog(false)
                }}
                goToCategory={id => {
                  goToCategory(id)
                  setOpenCommandDialog(false)
                }}
                performFullSearch={() => {
                  performFullSearch()
                  setOpenCommandDialog(false)
                }}
                width="w-full"
              />
            </div>
          )}

          {!showResults && query.length < 2 && (
            <div className="p-6 text-center text-sm text-gray-600">
              <Command className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p className="font-medium">Saisissez au moins 2 caractères</p>
              <p className="text-xs mt-2 text-gray-500">
                Recherchez parmi les produits et catégories CYNA
              </p>
            </div>
          )}
        </div>
      </CommandDialog>
    </div>
  )
}
