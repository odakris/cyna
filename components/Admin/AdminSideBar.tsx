import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu"
import DisconnectButton from "../DisconnectButton/DisconnectButton"

export default function AdminSideBar() {
  const navLinks = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Produits", href: "/dashboard/products" },
    { name: "Categories", href: "/dashboard/categories" },
    { name: "Utilisateurs", href: "/dashboard/users" },
    { name: "Commandes", href: "/dashboard/orders" },
  ]

  return (
    <aside className=" bg-gray-800 text-white p-4">
      <h2 className="text-xl font-bold mb-4 text-center">Back-Office</h2>

      <NavigationMenu orientation="vertical">
        <NavigationMenuList className="flex flex-col gap-2">
          <NavigationMenuItem>
            {navLinks.map(item => (
              <NavigationMenuLink
                key={item.name}
                href={item.href}
                className="block p-2 hover:bg-gray-700 rounded-md"
              >
                {item.name}
              </NavigationMenuLink>
            ))}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <DisconnectButton />
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </aside>
  )
}
