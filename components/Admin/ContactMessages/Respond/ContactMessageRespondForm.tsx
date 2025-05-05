import { UseFormReturn } from "react-hook-form"
import { ContactMessageResponseValues } from "@/lib/validations/contact-message-schema"
import { ContactMessage } from "@/components/Admin/ContactMessages/ContactMessageColumns"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  RefreshCw,
  Reply,
  CheckCircle,
  MessageSquare,
  Mail,
  Clock,
  Send,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ContactMessageRespondFormProps {
  message: ContactMessage
  formatDate: (dateString: string | Date) => string
  form: UseFormReturn<ContactMessageResponseValues>
  onSubmit: (data: ContactMessageResponseValues) => Promise<void>
  isSubmitted: boolean
}

export default function ContactMessageRespondForm({
  message,
  formatDate,
  form,
  onSubmit,
  isSubmitted,
}: ContactMessageRespondFormProps) {
  // Fonction pour obtenir les initiales
  const getInitials = (firstname?: string, lastname?: string) => {
    if (firstname && lastname) {
      return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
    }
    return message.email.substring(0, 2).toUpperCase()
  }

  return (
    <Card className="max-w-5xl mx-auto border-border/40 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
          <div className="flex gap-3 sm:gap-4 items-start">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 mt-1">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(
                  message.user?.firstname ?? undefined,
                  message.user?.lastname ?? undefined
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg sm:text-xl mb-1">
                {message.subject}
              </CardTitle>
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <CardDescription className="text-sm">
                    {message.email}
                  </CardDescription>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDate(message.sent_date)}
            </span>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex items-start gap-2">
          <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary mt-1" />
          <div className="bg-muted/30 p-3 sm:p-4 rounded-lg w-full">
            <p className="whitespace-pre-wrap text-sm sm:text-base text-muted-foreground">
              {message.message}
            </p>
          </div>
        </div>

        <Separator className="my-4 sm:my-6" />

        {isSubmitted ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            <AlertTitle className="text-green-700 text-sm sm:text-base">
              Réponse envoyée
            </AlertTitle>
            <AlertDescription className="text-green-600 text-xs sm:text-sm">
              Votre réponse a été envoyée avec succès. Vous allez être redirigé
              dans quelques secondes.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 sm:space-y-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Reply className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h3 className="text-base sm:text-lg font-medium">
                  Votre réponse
                </h3>
              </div>

              <FormField
                control={form.control}
                name="response"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">
                      Rédigez votre message de réponse ci-dessous
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Bonjour, merci pour votre message. En réponse à votre demande..."
                        {...field}
                        rows={10}
                        className="resize-y focus-visible:ring-primary text-sm sm:text-base"
                        disabled={form.formState.isSubmitting}
                      />
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <div className="pt-2 w-full">
                <Button
                  type="submit"
                  className="px-4 sm:px-6 text-sm sm:text-base w-full"
                  variant={"cyna"}
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Envoyer la réponse
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>

      {!isSubmitted && (
        <CardFooter className="bg-muted/30 py-3 border-t text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
            <span>
              La réponse sera envoyée à l&apos;adresse email de
              l&apos;expéditeur.
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
