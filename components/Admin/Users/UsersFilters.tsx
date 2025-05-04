import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Search, RefreshCw, Columns, ChevronDown, Shield } from "lucide-react"
import { User, Role } from "@prisma/client"
import { usersColumnNamesInFrench } from "@/components/Admin/Users/UsersColumns"

interface UsersFiltersProps {
  table: Table<User>
  globalFilter: string
  setGlobalFilter: (value: string) => void
  fetchUsers: () => Promise<void>
  activeTab?: string
  setActiveTab?: (tab: string) => void
  stats?: {
    total: number
    verified: number
    unverified: number
    adminCount: number
  }
}

export default function UsersFilters({
  table,
  globalFilter,
  setGlobalFilter,
  fetchUsers,
  activeTab,
  setActiveTab,
  stats,
}: UsersFiltersProps) {
  // Options de rôle avec couleurs et descriptions
  const roleOptions = [
    {
      value: "all",
      label: "Tous les rôles",
      color: "bg-gray-100 text-gray-800",
      description: "Tous les utilisateurs",
    },
    {
      value: Role.SUPER_ADMIN,
      label: "Super Admin",
      color: "bg-purple-100 text-purple-800",
      description: "Contrôle total du système",
    },
    {
      value: Role.ADMIN,
      label: "Admin",
      color: "bg-red-100 text-red-800",
      description: "Accès complet à l'administration",
    },
    {
      value: Role.MANAGER,
      label: "Manager",
      color: "bg-blue-100 text-blue-800",
      description: "Gestion des contenus et des clients",
    },
    {
      value: Role.CUSTOMER,
      label: "Client",
      color: "bg-green-100 text-green-800",
      description: "Accès limité aux fonctionnalités de base",
    },
  ]

  // Obtenir l'option actuelle sélectionnée
  const currentRoleValue =
    (table.getColumn("role")?.getFilterValue() as string) ?? "all"

  // Trouver l'option correspondante
  const currentRoleOption = roleOptions.find(
    option => option.value === currentRoleValue
  )

  return (
    <div className="space-y-4 mb-6">
      {/* Version mobile des onglets - uniquement si les props sont fournies */}
      {activeTab && setActiveTab && stats && (
        <div className="md:hidden space-y-3">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={globalFilter ?? ""}
              onChange={event => setGlobalFilter(event.target.value)}
              className="pl-8 w-full"
            />
          </div>

          {/* Sélecteur Tous/Vérifiés/Non vérifiés */}
          <div className="flex space-x-2">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les utilisateurs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous ({stats.total})</SelectItem>
                <SelectItem value="verifies">
                  Vérifiés ({stats.verified})
                </SelectItem>
                <SelectItem value="non-verifies">
                  Non vérifiés ({stats.unverified})
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => fetchUsers()}
              className="shrink-0"
              title="Actualiser"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Filtre de rôle */}
          <Select
            value={currentRoleValue}
            onValueChange={value => {
              table
                .getColumn("role")
                ?.setFilterValue(value === "all" ? undefined : value)
            }}
          >
            <SelectTrigger>
              <SelectValue>
                {currentRoleValue !== "all" ? (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`${currentRoleOption?.color} capitalize`}
                    >
                      {currentRoleOption?.label}
                    </Badge>
                  </div>
                ) : (
                  "Filtrer par rôle"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {option.value !== "all" ? (
                      <Badge
                        variant="outline"
                        className={`${option.color} capitalize`}
                      >
                        {option.label}
                      </Badge>
                    ) : (
                      <span>{option.label}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Version desktop des filtres - inchangée */}
      <div className="hidden md:flex md:flex-row md:justify-between md:items-center md:gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, prénom, email..."
              value={globalFilter ?? ""}
              onChange={event => setGlobalFilter(event.target.value)}
              className="pl-8 w-full"
            />
          </div>

          {/* Filtre par rôle amélioré */}
          <Select
            value={currentRoleValue}
            onValueChange={value => {
              table
                .getColumn("role")
                ?.setFilterValue(value === "all" ? undefined : value)
            }}
          >
            <SelectTrigger className="w-full sm:w-52 flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <SelectValue>
                {currentRoleOption && (
                  <div className="flex items-center gap-2">
                    {currentRoleValue !== "all" && (
                      <Badge
                        variant="outline"
                        className={`${currentRoleOption.color} capitalize`}
                      >
                        {currentRoleOption.label}
                      </Badge>
                    )}
                    {currentRoleValue === "all" && "Filtrer par rôle"}
                  </div>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Rôles</SelectLabel>
                {roleOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.value !== "all" ? (
                        <Badge
                          variant="outline"
                          className={`${option.color} capitalize`}
                        >
                          {option.label}
                        </Badge>
                      ) : (
                        <span>{option.label}</span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchUsers()}
            title="Actualiser les données"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Columns className="mr-2 h-4 w-4" />
                Colonnes
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={value =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {usersColumnNamesInFrench[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
