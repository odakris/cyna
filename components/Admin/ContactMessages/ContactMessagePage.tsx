"use client"

import { useState } from "react"
import { useContactMessagesData } from "@/hooks/contact-messages/use-contact-messages-data"
import { useContactMessagesTable } from "@/hooks/contact-messages/use-contact-messages-table"
import ContactMessageHeader from "@/components/Admin/ContactMessages/ContactMessageHeader"
import ContactMessageStats from "@/components/Admin/ContactMessages/ContactMessageStats"
import ContactMessageFilters from "@/components/Admin/ContactMessages/ContactMessageFilters"
import ContactMessageTable from "@/components/Admin/ContactMessages/ContactMessageTable"
import ContactMessageDeleteDialog from "@/components/Admin/ContactMessages/ContactMessageDeleteDialog"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { ContactMessageListSkeleton } from "@/components/Skeletons/ContactMessageSkeletons"

export default function ContactMessagePage() {
  // État et logique des données
  const {
    messages,
    loading,
    error,
    fetchMessages,
    fetchStats,
    deleteMessages,
    setActiveTab,
    activeTab,
    stats,
  } = useContactMessagesData()

  // État et logique de la table de données
  const { table, globalFilter, setGlobalFilter } = useContactMessagesTable(
    messages,
    activeTab
  )

  // État du dialog de suppression
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Gestionnaire de suppression
  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_message)

    if (selectedIds.length === 0) return

    try {
      await deleteMessages(selectedIds)
      setShowDeleteDialog(false)
      table.resetRowSelection()
    } catch (error) {
      // console.error("Erreur handleDelete:", error)
    }
  }

  if (loading) {
    return <ContactMessageListSkeleton />
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-lg mt-8 border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Erreur</CardTitle>
          </div>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={fetchMessages}>Réessayer</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* En-tête avec titre et actions */}
      <ContactMessageHeader
        messagesCount={messages.length}
        selectedCount={table.getFilteredSelectedRowModel().rows.length}
        setShowDeleteDialog={setShowDeleteDialog}
      />

      {/* Statistiques des messages */}
      <ContactMessageStats stats={stats} />

      {/* Filtres et tableau */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader className="pb-3">
          {/* Version desktop des onglets - inchangée */}
          <div className="hidden md:block">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="tous" className="flex-1 sm:flex-initial">
                  Tous
                  <Badge variant="secondary" className="ml-2">
                    {stats.total}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="non-lus" className="flex-1 sm:flex-initial">
                  Non lus
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-100 text-blue-800"
                  >
                    {stats.unread}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="lus" className="flex-1 sm:flex-initial">
                  Lus
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-gray-100 text-gray-800"
                  >
                    {stats.total - stats.unread}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="repondus"
                  className="flex-1 sm:flex-initial"
                >
                  Répondus
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-green-100 text-green-800"
                  >
                    {stats.total - stats.unanswered}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-6">
          {/* Filtres et options de recherche */}
          <ContactMessageFilters
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            fetchMessages={fetchMessages}
            fetchStats={fetchStats}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            stats={stats}
          />

          {/* Tableau des messages */}
          <ContactMessageTable table={table} />
        </CardContent>

        <CardFooter className="bg-muted/50 py-3 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left mb-2 sm:mb-0">
            Total des messages: <strong>{stats.total}</strong> | Non lus:{" "}
            <strong className="text-blue-600">{stats.unread}</strong> | Sans
            réponse:{" "}
            <strong className="text-amber-600">{stats.unanswered}</strong>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMessages}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Actualiser
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <ContactMessageDeleteDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        selectedCount={Object.keys(table.getState().rowSelection).length}
        onConfirm={handleDelete}
      />
    </div>
  )
}
