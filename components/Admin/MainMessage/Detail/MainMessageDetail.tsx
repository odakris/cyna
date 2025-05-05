"use client"

import { useMainMessageDetail } from "@/hooks/main-message/use-main-message-detail"
import { MainMessageDetailSkeleton } from "@/components/Skeletons/MainMessageSkeletons"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MessageSquareText } from "lucide-react"
import MessageHeader from "./MessageHeader"
import MessagePreview from "./MessagePreview"
import GeneralInfo from "./GeneralInfo"
import AppearanceInfo from "./AppearanceInfo"
import DatesInfo from "./DatesInfo"
import ErrorMessage from "./ErrorMessage"
import DeleteDialog from "./DeleteDialog"
import { Role } from "@prisma/client"
import RoleGuard from "@/components/Auth/RoleGuard"
import AccessDenied from "@/components/Auth/AccessDenied"
import { useState } from "react"

interface MainMessageDetailProps {
  id: string
}

export default function MainMessageDetail({ id }: MainMessageDetailProps) {
  const {
    message,
    loading,
    error,
    showDeleteDialog,
    setShowDeleteDialog,
    isUpdating,
    handleDelete,
    toggleActiveStatus,
    toggleBackgroundStatus,
    handleEdit,
    formatDate,
  } = useMainMessageDetail(id)

  const [isDeleting, setIsDeleting] = useState(false)

  // Wrapper pour handleDelete pour gérer l'état de chargement
  const onConfirmDelete = async () => {
    setIsDeleting(true)
    await handleDelete()
    setIsDeleting(false)
  }

  if (loading) {
    return <MainMessageDetailSkeleton />
  }

  if (error || !message) {
    return <ErrorMessage error={error} />
  }

  return (
    <RoleGuard
      requiredRole={Role.ADMIN}
      fallback={
        <AccessDenied message="Vous n'avez pas la permission de voir les détails des messages." />
      }
    >
      <div className="mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8 animate-in fade-in duration-300">
        <MessageHeader
          message={message}
          setShowDeleteDialog={setShowDeleteDialog}
          handleEdit={handleEdit}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <MessageSquareText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Message Principal
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Détails complets du message principal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-8">
            <MessagePreview message={message} />

            <Separator />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <GeneralInfo
                message={message}
                toggleActiveStatus={toggleActiveStatus}
                isUpdating={isUpdating}
              />

              <AppearanceInfo
                message={message}
                toggleBackgroundStatus={toggleBackgroundStatus}
                isUpdating={isUpdating}
              />
            </div>

            <Separator />

            <DatesInfo message={message} formatDate={formatDate} />
          </CardContent>
        </Card>

        <DeleteDialog
          isOpen={showDeleteDialog}
          setIsOpen={setShowDeleteDialog}
          onConfirm={onConfirmDelete}
          isDeleting={isDeleting}
        />
      </div>
    </RoleGuard>
  )
}
