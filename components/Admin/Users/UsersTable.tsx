import { Table as TableType } from "@tanstack/react-table"
import { User } from "@prisma/client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react"
import { flexRender } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ActionsCell from "@/components/Admin/ActionCell"
import UserActiveSwitch from "@/components/Admin/Users/UserActiveSwitch"
import Link from "next/link"

interface UsersTableProps {
  table: TableType<User>
}

export default function UsersTable({ table }: UsersTableProps) {
  // Fonction pour formater un badge de rôle
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "ADMIN":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "MANAGER":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "CUSTOMER":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Fonction pour obtenir les initiales d'un utilisateur
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()
  }

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  return (
    <div>
      {/* Tableau classique pour desktop - INCHANGÉ */}
      <div className="hidden md:block rounded-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="text-center px-3 font-semibold"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`group transition-colors ${row.getIsSelected() ? "bg-primary/5" : "hover:bg-muted/50"}`}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="text-center px-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={Object.keys(table.getVisibleLeafColumns()).length}
                  className="h-24 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Filter className="h-8 w-8 mb-2 opacity-50" />
                    <p>Aucun utilisateur trouvé.</p>
                    <p className="text-sm">Essayez de modifier vos filtres.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vue mobile en liste de cartes */}
      <div className="md:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map(row => {
            const user = row.original
            const firstName = user.first_name || ""
            const lastName = user.last_name || ""
            const initials = getUserInitials(firstName, lastName)
            const role = user.role
            const verified = user.email_verified

            return (
              <div
                key={row.id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                {/* En-tête de carte avec avatar et nom - partie cliquable */}
                <Link
                  href={`/dashboard/users/${user.id_user}`}
                  className="block"
                >
                  <div className="flex items-center gap-3 p-3 border-b bg-[#F2F2F2]">
                    <Avatar className="h-12 w-12 border-2 border-white">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-base truncate">
                        {firstName} {lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Corps de la carte avec détails et statuts */}
                <div className="p-3">
                  <div className="flex justify-between items-center mb-3">
                    <Badge
                      variant="outline"
                      className={`capitalize font-semibold px-2 py-1 ${getRoleBadgeClass(role)}`}
                    >
                      {role.toLowerCase().replace("_", " ")}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {verified ? (
                        <Badge className="bg-emerald-500 text-white border-emerald-600">
                          <CheckCircle2 className="mr-1 h-3 w-3" /> Vérifié
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 border-amber-200"
                        >
                          <XCircle className="mr-1 h-3 w-3" /> Non vérifié
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="flex justify-between items-center my-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {formatDate(user.created_at?.toString() || "")}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">Actif</span>
                      <UserActiveSwitch
                        userId={user.id_user}
                        initialActive={user.active}
                        onStatusChange={() => {}}
                      />
                    </div>
                  </div>

                  {/* Actions rapides */}
                  <div className="flex justify-end mt-3">
                    <ActionsCell
                      actions={[
                        { type: "view", tooltip: "Voir les détails" },
                        { type: "edit", tooltip: "Modifier l'utilisateur" },
                      ]}
                      basePath="/dashboard/users"
                      entityId={user.id_user}
                    />
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center p-8 border rounded-md">
            <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground">Aucun utilisateur trouvé.</p>
            <p className="text-sm text-muted-foreground">
              Essayez de modifier vos filtres.
            </p>
          </div>
        )}
      </div>

      {/* Pagination desktop - INCHANGÉE */}
      <div className="hidden md:flex md:flex-row md:justify-between md:space-y-0 py-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">
            {table.getFilteredSelectedRowModel().rows.length}
          </span>{" "}
          sur{" "}
          <span className="font-medium">
            {table.getFilteredRowModel().rows.length}
          </span>{" "}
          utilisateur(s) sélectionné(s)
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Par page</p>
            <select
              className="h-8 w-20 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
              value={table.getState().pagination.pageSize}
              onChange={e => {
                table.setPageSize(Number(e.target.value))
              }}
            >
              {[5, 10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} sur{" "}
            {table.getPageCount() || 1}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Première page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Page précédente</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Page suivante</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Dernière page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Pagination mobile - NOUVELLE */}
      <div className="flex flex-col items-center space-y-3 py-4 md:hidden">
        <div className="text-xs text-muted-foreground text-center">
          Page {table.getState().pagination.pageIndex + 1} sur{" "}
          {table.getPageCount() || 1}
        </div>

        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={value => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 50].map(pageSize => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
