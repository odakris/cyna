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
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

export function Navbar() {
  const navLinks = ["Acceuil", "Categories", "Recherche Avancée"]

  return (
    <header className="w-full p-4 lg:p-3 cyna-bg-primary-color">
      {/* MOBILE NAVIGATION */}
      <div className="lg:hidden flex items-center justify-between w-full">
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
                  key={item}
                  href="/"
                  className={cn(navigationMenuTriggerStyle(), "w-full")}
                >
                  {item}
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
      <nav className="hidden lg:flex items-center justify-between w-[90%] mx-auto">
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
              {navLinks.map(item => (
                <NavigationMenuItem key={item}>
                  <NavigationMenuLink
                    href="/"
                    className={cn(
                      navigationMenuTriggerStyle(),
                      "cyna-bg-primary-color cyna-text-color hover:bg-opacity-80 transition"
                    )}
                  >
                    {item}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
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
