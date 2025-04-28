"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Search, X, Home, ShoppingCart, FileSearch } from "lucide-react"
import { AvatarDemo } from "@/components/Avatar/Avatar"
import { Input } from "@/components/ui/input"
import { SideBasket } from "@/components/SideBasket/SideBasket"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Category } from "@prisma/client"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
  SheetFooter,
} from "@/components/ui/sheet"

type NavbarProps = {
  categories: Category[]
}

export default function NavbarClient({ categories }: NavbarProps) {
  const navLinks = [
    { name: "Accueil", href: "/", icon: <Home className="h-4 w-4 mr-2" /> },
    {
      name: "Categories",
      href: "/categories",
      icon: <FileSearch className="h-4 w-4 mr-2" />,
    },
    {
      name: "Recherche Avancée",
      href: "/recherche",
      icon: <Search className="h-4 w-4 mr-2" />,
    },
    {
      name: "Panier",
      href: "/panier",
      icon: <ShoppingCart className="h-4 w-4 mr-2" />,
    },
  ]

  return (
    <header className="w-full fixed top-0 left-0 z-50 cyna-bg-primary-color shadow-md">
      {/* MOBILE NAVIGATION - Avec barre de recherche toujours visible */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        {/* Left: Menu Drawer avec design amélioré */}
        <Sheet>
          <SheetTrigger className="p-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-1 focus:ring-offset-[#302082]">
            <Menu className="cyna-text-color h-5 w-5" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex flex-col overflow-y-auto max-h-screen p-0"
          >
            <SheetHeader className="px-4 py-3 border-b border-white/10 bg-[#302082]/90">
              <SheetTitle className="text-lg font-semibold text-white">
                Menu
              </SheetTitle>
            </SheetHeader>

            <div className="p-4 border-b border-white/10 bg-[#302082]/80">
              {/* Fermeture du menu même lors du clic sur le logo */}
              <SheetClose asChild>
                <Link href="/" className="flex justify-center">
                  <Image
                    src="/assets/FULL-LOGO/cyna-fulllogo-white.png"
                    alt="CYNA LOGO"
                    width={180}
                    height={40}
                    className="cursor-pointer"
                  />
                </Link>
              </SheetClose>
            </div>

            {/* Menu items avec icônes */}
            <div className="flex flex-col py-4 font-medium">
              {navLinks.map(item =>
                item.name === "Categories" ? (
                  <div key={item.name} className="mb-4">
                    <div className="px-4 py-2 font-semibold border-b border-white/10 mb-2 text-[#302082] flex items-center">
                      {item.icon}
                      {item.name}
                    </div>
                    <div className="pl-4 space-y-1">
                      {categories.map(category => (
                        /* Chaque lien de catégorie ferme maintenant le menu au clic */
                        <SheetClose key={category.id_category} asChild>
                          <Link
                            href={`/categorie/${category.id_category}`}
                            className="px-6 py-2 text-sm hover:bg-[#302082]/10 rounded-md transition-colors flex items-center"
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-[#302082]/60 mr-2"></span>
                            {category.name}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Chaque lien de navigation ferme maintenant le menu au clic */
                  <SheetClose key={item.name} asChild>
                    <Link
                      href={item.href}
                      className="px-4 py-3 hover:bg-[#302082]/10 rounded-md transition-colors flex items-center mb-1 text-[#302082]"
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  </SheetClose>
                )
              )}
            </div>

            <SheetFooter className="px-4 py-4 mt-auto border-t border-white/10 bg-[#302082]/30">
              {/* Utilisation de asChild pour éviter l'erreur d'imbrication de boutons */}
              <SheetClose asChild>
                <Button variant="outline" className="w-full">
                  <X className="mr-2 h-4 w-4" />
                  Fermer le menu
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Center: Barre de recherche toujours visible */}
        <div className="flex-1 mx-3">
          <div className="relative w-full">
            <Input
              placeholder="Rechercher..."
              className="w-full h-9 pr-8 text-sm"
            />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Right: SideBasket & Avatar */}
        <div className="flex items-center space-x-1.5">
          <SideBasket />
          <AvatarDemo />
        </div>
      </div>

      {/* TABLET NAVIGATION */}
      <div className="hidden md:flex lg:hidden items-center justify-between px-6 py-3">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/assets/FULL-LOGO/cyna-fulllogo-white.png"
            alt="CYNA LOGO"
            width={150}
            height={35}
            className="cursor-pointer"
          />
        </Link>

        <div className="flex items-center gap-2">
          <div className="relative w-48">
            <Input placeholder="Rechercher..." className="pr-8 h-9" />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <Sheet>
            <SheetTrigger className="p-1.5 rounded-md hover:bg-white/10 transition-colors">
              <Menu className="cyna-text-color h-5 w-5" />
            </SheetTrigger>
            <SheetContent className="flex flex-col overflow-y-auto max-h-screen">
              <div className="flex items-center justify-between mb-6">
                <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
                <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fermer</span>
                </SheetClose>
              </div>

              <div className="flex flex-col gap-4 font-medium">
                {navLinks.map(item =>
                  item.name === "Categories" ? (
                    <div key={item.name} className="space-y-3">
                      <div className="px-4 py-2 font-semibold border-b border-gray-200/20 flex items-center">
                        {item.icon}
                        {item.name}
                      </div>
                      <div className="pl-4 space-y-2">
                        {categories.map(category => (
                          <SheetClose key={category.id_category} asChild>
                            <Link
                              href={`/categorie/${category.id_category}`}
                              className="block px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                            >
                              {category.name}
                            </Link>
                          </SheetClose>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <SheetClose key={item.name} asChild>
                      <Link
                        href={item.href}
                        className="px-4 py-2 hover:bg-accent rounded-md transition-colors flex items-center"
                      >
                        {item.icon}
                        {item.name}
                      </Link>
                    </SheetClose>
                  )
                )}
              </div>

              <div className="mt-auto pt-4 border-t">
                <SheetClose asChild>
                  <Button variant="outline" className="w-full">
                    <X className="mr-2 h-4 w-4" />
                    Fermer
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>

          <SideBasket />
          <AvatarDemo />
        </div>
      </div>

      {/* DESKTOP NAVIGATION */}
      <nav className="hidden lg:flex items-center justify-between max-w-7xl mx-auto px-6 py-3 w-full">
        {/* Left: Logo & Links */}
        <div className="flex items-center space-x-6">
          <Link href="/">
            <Image
              src="/assets/FULL-LOGO/cyna-fulllogo-white.png"
              alt="CYNA LOGO"
              width={180}
              height={45}
              className="cursor-pointer"
            />
          </Link>

          <NavigationMenu>
            <NavigationMenuList className="flex space-x-2">
              {navLinks.map(item =>
                item.name === "Categories" ? (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuTrigger
                      className={cn(
                        "cyna-bg-primary-color cyna-text-color hover:cyna-text-primary-color hover:bg-white/10 transition px-3 py-2 text-sm rounded-md font-medium"
                      )}
                    >
                      {item.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                        {categories.map(category => (
                          <ListItem
                            key={category.id_category}
                            href={`/categorie/${category.id_category}`}
                            title={category.name}
                          >
                            {category.description &&
                            category.description.length > 80
                              ? `${category.description.substring(0, 80)}...`
                              : category.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.name}>
                    <Link
                      href={item.href}
                      className="cyna-text-color hover:cyna-text-primary-color hover:bg-white/10 transition px-3 py-2 text-sm rounded-md font-medium block"
                    >
                      {item.name}
                    </Link>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right: Search, Basket & Avatar */}
        <div className="flex items-center space-x-3">
          <div className="relative w-64">
            <Input placeholder="Rechercher un produit..." className="pr-8" />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <SideBasket />
          <AvatarDemo />
        </div>
      </nav>
    </header>
  )
}

const ListItem = React.forwardRef<
  React.ComponentRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
