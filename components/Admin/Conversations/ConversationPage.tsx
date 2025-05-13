"use client"

import { useConversationsData } from "@/hooks/chatbot/use-conversations-data"
import { useConversationsTable } from "@/hooks/chatbot/use-conversations-table"
import ConversationHeader from "@/components/Admin/Conversations/ConversationHeader"
import ConversationStats from "@/components/Admin/Conversations/ConversationStats"
import ConversationFilters from "@/components/Admin/Conversations/ConversationFilters"
import ConversationTable from "@/components/Admin/Conversations/ConversationTable"
import ConversationDeleteDialog from "@/components/Admin/Conversations/ConversationDeleteDialog"
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { CardTitle, CardDescription } from "@/components/ui/card"
import { ConversationsListSkeleton } from "@/components/Skeletons/ConversationSkeletons"

export default function ConversationPage() {
  // État et logique des données
  const {
    conversations,
    loading,
    error,
    fetchConversations,
    deleteConversations,
    // activeTab,
    // setActiveTab,
    stats,
    showDeleteDialog,
    setShowDeleteDialog,
  } = useConversationsData()

  // État et logique de la table de données
  const { table, globalFilter, setGlobalFilter } = useConversationsTable(
    conversations
    // activeTab
  )

  // Gestionnaire de suppression
  const handleDelete = async () => {
    const selectedIds = table
      .getSelectedRowModel()
      .rows.map(row => row.original.id_conversation)

    if (selectedIds.length === 0) return

    try {
      await deleteConversations(selectedIds)
      setShowDeleteDialog(false)
      table.resetRowSelection()
    } catch (error) {
      // console.error("Erreur handleDelete:", error)
    }
  }

  if (loading) {
    return <ConversationsListSkeleton />
  }

  if (error) {
    return (
      <Card className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
            <CardTitle className="text-red-500 text-base sm:text-lg">
              Erreur
            </CardTitle>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            {error}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={fetchConversations} className="text-xs sm:text-sm">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* En-tête avec titre et actions */}
      <ConversationHeader
        conversationsCount={conversations.length}
        selectedCount={table.getFilteredSelectedRowModel().rows.length}
        setShowDeleteDialog={setShowDeleteDialog}
      />

      {/* Statistiques des conversations */}
      <ConversationStats stats={stats} />

      {/* Filtres et tableau */}
      <Card className="border-border/40 shadow-sm">
        {/* <CardHeader className="pb-3">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="flex-1 sm:flex-initial">
                Toutes
                <Badge variant="secondary" className="ml-2">
                  {stats.total}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ACTIVE" className="flex-1 sm:flex-initial">
                Actives
                <Badge
                  variant="secondary"
                  className="ml-2 bg-green-100 text-green-800"
                >
                  {stats.active}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="PENDING_ADMIN"
                className="flex-1 sm:flex-initial"
              >
                En attente
                <Badge
                  variant="secondary"
                  className="ml-2 bg-amber-100 text-amber-800"
                >
                  {stats.pending}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="CLOSED" className="flex-1 sm:flex-initial">
                Fermées
                <Badge
                  variant="secondary"
                  className="ml-2 bg-slate-100 text-slate-800"
                >
                  {stats.closed}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader> */}

        <CardContent className="p-3 sm:p-6">
          {/* Filtres et options de recherche */}
          <ConversationFilters
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            fetchConversations={fetchConversations}
          />

          {/* Tableau des conversations */}
          <ConversationTable table={table} />
        </CardContent>

        <CardFooter className="bg-muted/50 py-3 border-t flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left mb-2 sm:mb-0">
            Total des conversations: <strong>{stats.total}</strong> | Actives:{" "}
            <strong className="text-green-600">{stats.active}</strong> | En
            attente: <strong className="text-amber-600">{stats.pending}</strong>{" "}
            | Fermées:{" "}
            <strong className="text-slate-600">{stats.closed}</strong>
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConversations}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="mr-2 h-3 w-3" />
            Actualiser
          </Button>
        </CardFooter>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <ConversationDeleteDialog
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        selectedCount={Object.keys(table.getState().rowSelection).length}
        onConfirm={handleDelete}
      />
    </div>
  )
}
