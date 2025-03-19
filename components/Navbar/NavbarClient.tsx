"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"
import { AvatarDemo } from "@/components/Avatar/Avatar"
import { Input } from "@/components/ui/input"
import { SideBasket } from "@/components/SideBasket/SideBasket"
import { cn } from "@/lib/utils"

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { CategoryType } from "@/types/Types"

type NavbarProps = {
  categories: CategoryType[]
}

export default function NavbarClient({ categories }: NavbarProps) {
  const navLinks = [
    { name: "Accueil", href: "/" },
    { name: "Categories", href: "/categories" },
    { name: "Recherche Avancée", href: "/recherche" },
    { name: "Panier", href: "/panier" },
    { name: "Contact", href: "/contact" },
  ]

  return (
    <header className="w-full fixed top-0 left-0 z-50 cyna-bg-primary-color shadow-xl">
      {/* MOBILE NAVIGATION */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4">
        {/* Left: Menu Drawer */}
        <Sheet>
          <SheetTrigger className="mx-2">
            <Menu className="cyna-text-color" />
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col items-center">
            <SheetTitle className="text-lg font-semibold">
              Navigation
            </SheetTitle>
            <NavigationMenu className="flex flex-col justify-start mt-4 space-y-3 w-full">
              {navLinks.map(item => (
                <NavigationMenuLink
                  key={item.name}
                  href={item.href}
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "w-full cyna-subtitle"
                  )}
                >
                  {item.name}
                </NavigationMenuLink>
              ))}
            </NavigationMenu>
          </SheetContent>
        </Sheet>

        {/* Right: Search & Profile */}
        <div className="flex items-center space-x-4 w-full">
          <Input placeholder="Recherche..." className="w-full" />
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
              width={200}
              height={50}
              className="cursor-pointer"
            />
          </Link>

          <NavigationMenu>
            <NavigationMenuList className="flex space-x-6">
              {navLinks.map(item =>
                item.name === "Categories" ? (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuTrigger
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "cyna-bg-primary-color cyna-text-color hover:cyna-text-primary-color hover:bg-opacity-80 transition"
                      )}
                    >
                      {item.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="p-4 md:w-[200px] lg:w-[300px]">
                        {categories.map(category => (
                          <ListItem
                            key={category.id_category}
                            href={`/categorie/${category.id_category}`}
                            title={category.name}
                          >
                            {category.description}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ) : (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink
                      href={item.href}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        "cyna-bg-primary-color cyna-text-color hover:cyna-text-primary-color hover:bg-opacity-80 transition"
                      )}
                    >
                      {item.name}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right: Search, Basket & Avatar */}
        <div className="flex items-center space-x-4 w-[40%] justify-end">
          <Input placeholder="Recherche..." className="max-w-[250px] w-full" />
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
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
