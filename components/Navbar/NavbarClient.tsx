"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, Search, X, Home, ShoppingCart, Shield, Tag } from "lucide-react"
import { AvatarDemo } from "@/components/Avatar/Avatar"
import { Input } from "@/components/ui/input"
import { SideBasket } from "@/components/SideBasket/SideBasket"
import { Button } from "@/components/ui/button"
import { Category } from "@prisma/client"
import {
  NavigationMenu,
  NavigationMenuItem,
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
      icon: <Tag className="h-4 w-4 mr-2" />,
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
    <header className="w-full fixed top-0 left-0 z-50 bg-[#302082] shadow-lg">
      {/* MOBILE NAVIGATION avec barre de recherche */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        {/* Menu Drawer pour mobile */}
        <Sheet>
          <SheetTrigger className="relative p-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-1 focus:ring-offset-[#302082] group">
            <Menu className="text-white h-5 w-5 group-hover:scale-105 transition-transform" />
            <span className="sr-only">Menu</span>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex flex-col overflow-y-auto max-h-screen p-0 border-r-[#302082]/30"
          >
            <SheetHeader className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-[#302082] to-[#231968]">
              <SheetTitle className="text-lg font-semibold text-white">
                Menu CYNA
              </SheetTitle>
            </SheetHeader>

            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#302082]/90 to-[#231968]/90">
              <SheetClose asChild>
                <Link href="/" className="flex justify-center">
                  <Image
                    src="/assets/FULL-LOGO/cyna-fulllogo-white.png"
                    alt="CYNA LOGO"
                    width={160}
                    height={35}
                    className="cursor-pointer hover:scale-105 transition-transform duration-300"
                  />
                </Link>
              </SheetClose>
            </div>

            <div className="flex flex-col py-4 font-medium">
              {navLinks.map(item =>
                item.name === "Categories" ? (
                  <div key={item.name} className="mb-4">
                    <div className="px-4 py-2 font-semibold border-b border-[#302082]/20 mb-2 text-[#302082] flex items-center">
                      {item.icon}
                      {item.name}
                    </div>
                    <div className="pl-4 space-y-1">
                      {categories.map(category => (
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

            <SheetFooter className="px-4 py-4 mt-auto border-t border-[#302082]/10 bg-[#302082]/5">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  className="w-full border-[#302082]/40 text-[#302082] hover:bg-[#302082]/10"
                >
                  <X className="mr-2 h-4 w-4" />
                  Fermer le menu
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Logo centré sur mobile */}
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/assets/FULL-LOGO/cyna-fulllogo-white.png"
            alt="CYNA LOGO"
            width={100}
            height={30}
            className="cursor-pointer"
          />
        </Link>

        {/* SideBasket & Avatar */}
        <div className="flex items-center space-x-1.5">
          <SideBasket />
          <AvatarDemo />
        </div>
      </div>

      {/* Barre de recherche sur mobile - pleine largeur */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative w-full">
          <Input
            placeholder="Rechercher..."
            className="w-full h-9 pr-10 pl-3 text-sm bg-white/10 text-white border-white/20 focus:bg-white/20 focus:border-white/40 rounded-md placeholder:text-white/60"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
        </div>
      </div>

      {/* TABLET NAVIGATION */}
      <div className="hidden md:flex lg:hidden items-center justify-between px-6 py-3">
        <Link href="/" className="flex-shrink-0">
          <Image
            src="/assets/FULL-LOGO/cyna-fulllogo-white.png"
            alt="CYNA LOGO"
            width={130}
            height={35}
            className="cursor-pointer hover:scale-105 transition-transform duration-300"
          />
        </Link>

        <div className="flex items-center gap-3">
          <div className="relative w-48">
            <Input
              placeholder="Rechercher..."
              className="h-9 pr-8 text-white bg-white/10 border-white/20 focus:bg-white/20 focus:border-white/40 placeholder:text-white/70"
            />
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
          </div>

          <Sheet>
            <SheetTrigger className="p-1.5 rounded-md hover:bg-white/20 active:bg-white/30 transition-colors">
              <Menu className="text-white h-5 w-5" />
            </SheetTrigger>
            <SheetContent className="flex flex-col overflow-y-auto max-h-screen border-l-[#302082]/30">
              <div className="flex items-center justify-between mb-6">
                <SheetTitle className="text-lg font-semibold">
                  Menu CYNA
                </SheetTitle>
                <SheetClose className="rounded-full p-1 hover:bg-gray-100 transition-colors">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Fermer</span>
                </SheetClose>
              </div>

              <div className="flex flex-col gap-4 font-medium">
                {navLinks.map(item =>
                  item.name === "Categories" ? (
                    <div key={item.name} className="space-y-3">
                      <div className="px-4 py-2 font-semibold border-b border-gray-200/20 flex items-center text-[#302082]">
                        {item.icon}
                        {item.name}
                      </div>
                      <div className="pl-4 space-y-2">
                        {categories.map(category => (
                          <SheetClose key={category.id_category} asChild>
                            <Link
                              href={`/categorie/${category.id_category}`}
                              className="block px-4 py-2 text-sm hover:bg-[#302082]/10 rounded-md transition-colors"
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
                        className="px-4 py-2 hover:bg-[#302082]/10 rounded-md transition-colors flex items-center text-[#302082]"
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
                  <Button
                    variant="outline"
                    className="w-full border-[#302082]/40 text-[#302082]"
                  >
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
      <nav className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo avec effet de survol */}
            <Link href="/" className="relative group transition-transform">
              <Image
                src="/assets/FULL-LOGO/cyna-fulllogo-white.png"
                alt="CYNA LOGO"
                width={150}
                height={38}
                className="cursor-pointer transform group-hover:scale-105 transition-transform duration-300"
                priority
              />
            </Link>

            {/* Menu de navigation principal */}
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-1">
                <NavigationMenuItem>
                  <Link
                    href="/"
                    className="flex items-center px-3 py-2 text-sm text-white rounded-md hover:bg-white/10 transition-colors duration-200"
                  >
                    <Home className="mr-1.5 h-4 w-4" />
                    Accueil
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="group flex items-center gap-1 px-3 py-2 text-sm text-white bg-transparent hover:bg-white/10 focus:bg-white/10 data-[state=open]:bg-white/15">
                    <Tag className="mr-1.5 h-4 w-4" />
                    <span>Catégories</span>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[500px] p-4 md:grid-cols-2 lg:grid-cols-2">
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map(category => (
                          <Link
                            key={category.id_category}
                            href={`/categorie/${category.id_category}`}
                            className="group flex flex-col gap-1 rounded-md p-3 hover:bg-[#302082]/5 transition-colors"
                          >
                            <div className="text-[#302082] font-medium text-sm group-hover:text-[#FF6B00] transition-colors group-hover:translate-x-0.5 duration-300">
                              {category.name}
                            </div>
                            <p className="text-xs text-gray-500 group-hover:text-gray-700 line-clamp-2 transition-colors">
                              {category.description &&
                              category.description.length > 70
                                ? `${category.description.substring(0, 70)}...`
                                : category.description ||
                                  "Découvrez nos solutions de sécurité dans cette catégorie."}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link
                    href="/recherche"
                    className="flex items-center px-3 py-2 text-sm text-white rounded-md hover:bg-white/10 transition-colors duration-200"
                  >
                    <Search className="mr-1.5 h-4 w-4" />
                    Recherche Avancée
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link
                    href="/panier"
                    className="flex items-center px-3 py-2 text-sm text-white rounded-md hover:bg-white/10 transition-colors duration-200"
                  >
                    <ShoppingCart className="mr-1.5 h-4 w-4" />
                    Panier
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Partie droite: recherche, panier, profil */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                placeholder="Rechercher un produit..."
                className="w-56 h-9 pr-8 pl-3 text-white bg-white/10 border-white/20 focus:border-white/30 focus:bg-white/15 transition-colors placeholder:text-white/60 rounded-md"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
            </div>

            <Button
              asChild
              className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white border-none transition-colors"
            >
              <Link href="/contact">
                <Shield className="mr-1.5 h-4 w-4" />
                Démo gratuite
              </Link>
            </Button>

            <SideBasket />
            <AvatarDemo />
          </div>
        </div>
      </nav>
    </header>
  )
}
