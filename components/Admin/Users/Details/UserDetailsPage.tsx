"use client"

import { useUserDetails } from "@/hooks/user/use-user-details"
import { UserDetailSkeleton } from "@/components/Skeletons/UserSkeletons"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Composants factorisés
import UserHeader from "@/components/Admin/Users/Details/UserHeader"
import UserProfile from "@/components/Admin/Users/Details/UserProfile"
import UserInfo from "@/components/Admin/Users/Details/UserInfo"
import UserDeleteDialog from "@/components/Admin/Users/Details/UserDeleteDialog"
import ErrorDisplay from "@/components/Admin/Users/Details/ErrorDisplay"
import { Separator } from "@/components/ui/separator"
import UserActiveSwitch from "@/components/Admin/Users/UserActiveSwitch"
import { ResendVerificationButton } from "@/components/Admin/Users/Details/ResendVerificationButton"
import { SendPasswordResetButton } from "@/components/Admin/Users/Details/SendPasswordResetButton"

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
    <div className="max-w-5xl mx-auto p-2 sm:p-6 space-y-4 sm:space-y-8 animate-in fade-in duration-300">
      {/* En-tête avec titre et actions */}
      <UserHeader
        user={user}
        handleEdit={handleEdit}
        setIsDeleteDialogOpen={setIsDeleteDialogOpen}
        getRoleBadgeColor={getRoleBadgeColor}
      />

      <Card className="overflow-hidden border-border/40 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start p-3 sm:p-6 pb-0 bg-muted/20">
          <div>
            <div className="space-y-1">
              <CardTitle className="text-xl sm:text-2xl">
                {user.first_name} {user.last_name}
              </CardTitle>
              <CardDescription className="text-sm sm:text-md break-all">
                {user.email}
              </CardDescription>
            </div>
            <Badge
              className={`px-2 sm:px-3 py-0.5 sm:py-1 my-2 sm:my-3 text-xs sm:text-sm ${getRoleBadgeColor(user.role)}`}
            >
              {user.role}
            </Badge>
          </div>

          <div className="text-right mt-3 sm:mt-0">
            <p className="text-lg sm:text-xl text-muted-foreground">Statut</p>
            <Badge
              variant={user.email_verified ? "default" : "destructive"}
              className="py-0.5 px-2 sm:py-1 sm:px-3 text-xs sm:text-sm"
            >
              {user.email_verified ? "Vérifié" : "Non vérifié"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-3 sm:p-6 pt-4 sm:pt-6">
          {/* Profil utilisateur */}
          <UserProfile
            user={user}
            getUserInitials={getUserInitials}
            getRoleBadgeColor={getRoleBadgeColor}
          />

          {/* Informations utilisateur */}
          <UserInfo user={user} formatDate={formatDate} />

          <div className="md:col-span-2">
            <Separator className="my-2 sm:my-4" />
          </div>

          {/* Statut utilisateur */}
          <div className="flex items-center justify-between md:col-span-2">
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
          <div className="md:col-span-2 space-y-4 sm:space-y-6 mt-2 sm:mt-4">
            <div className="flex justify-between items-start flex-wrap gap-3">
              <h3 className="text-base sm:text-lg font-semibold">
                Accès et sécurité
              </h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <ResendVerificationButton
                  email={user.email}
                  userId={user.id_user}
                />
                <SendPasswordResetButton
                  email={user.email}
                  userId={user.id_user}
                />
              </div>
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
