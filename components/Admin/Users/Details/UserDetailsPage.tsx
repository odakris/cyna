"use client"

import { useUserDetails } from "@/hooks/use-user-details"
import { UserDetailSkeleton } from "@/components/Skeletons/UserSkeletons"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Key } from "lucide-react"

// Composants factorisés
import UserHeader from "@/components/Admin/Users/Details/UserHeader"
import UserProfile from "@/components/Admin/Users/Details/UserProfile"
import UserInfo from "@/components/Admin/Users/Details/UserInfo"
import UserDeleteDialog from "@/components/Admin/Users/Details/UserDeleteDialog"
import ErrorDisplay from "@/components/Admin/Users/Details/ErrorDisplay"
import { Separator } from "@/components/ui/separator"
import UserActiveSwitch from "@/components/Admin/Users/UserActiveSwitch"

export default function UserDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const {
    user,
    loading,
    errorMessage,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleDelete,
    getUserInitials,
    formatDate,
    getRoleBadgeColor,
    handleStatusChange,
  } = useUserDetails(params.id)

  if (loading) {
    return <UserDetailSkeleton />
  }

  if (errorMessage || !user) {
    return <ErrorDisplay errorMessage={errorMessage} />
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      {/* En-tête avec titre et actions */}
      <UserHeader
        user={user}
        handleEdit={handleEdit}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        getRoleBadgeColor={getRoleBadgeColor}
      />

      <Card className="overflow-hidden border-border/40 shadow-lg">
        <CardHeader className="flex flex-row justify-between items-start p-6 pb-0 bg-muted/20">
          <div>
            <div className="space-y-1">
              <CardTitle className="text-2xl">
                {user.first_name} {user.last_name}
              </CardTitle>
              <CardDescription className="text-md">
                {user.email}
              </CardDescription>
            </div>
            <Badge className={`px-3 py-1 my-3 ${getRoleBadgeColor(user.role)}`}>
              {user.role}
            </Badge>
          </div>

          <div className="text-right">
            <p className="text-xl text-muted-foreground">Statut</p>
            <Badge
              variant={user.email_verified ? "default" : "destructive"}
              className="py-1 px-3"
            >
              {user.email_verified ? "Vérifié" : "Non vérifié"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 pt-6">
          {/* Profil utilisateur */}
          <UserProfile
            user={user}
            getUserInitials={getUserInitials}
            getRoleBadgeColor={getRoleBadgeColor}
          />

          {/* Informations utilisateur */}
          <UserInfo user={user} formatDate={formatDate} />

          <Separator />

          {/* Statut utilisateur */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1">
                Statut de l&apos;utilisateur
              </p>
              <Badge
                variant={user.active ? "default" : "outline"}
                className={
                  user.active
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }
              >
                {user.active ? "Actif" : "Inactif"}
              </Badge>
            </div>
            <UserActiveSwitch
              userId={user.id_user}
              initialActive={user.active}
              onStatusChange={handleStatusChange}
            />
          </div>

          {/* Accès et Sécurité */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Accès et sécurité</h3>
              <Button variant="outline" size="sm">
                <Key className="mr-2 h-4 w-4" />
                Réinitialiser le mot de passe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <UserDeleteDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        userName={`${user.first_name} ${user.last_name}`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
