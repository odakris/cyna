"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card"
import { MainMessageForm } from "@/components/Forms/MainMessageForm"
import { ArrowLeft } from "lucide-react"

export default function NewMainMessagePage() {
  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Link href="/dashboard/main-message">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Ajouter un Message</h1>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations du message</CardTitle>
          <CardDescription>
            Configurez le contenu et l&apos;apparence du message principal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MainMessageForm />
        </CardContent>
      </Card>
    </div>
  )
}
