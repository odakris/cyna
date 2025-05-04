import { User, Mail, UserCog } from "lucide-react"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { UseFormReturn } from "react-hook-form"
import { UserFormValues } from "@/lib/validations/user-schema"

interface UserFormBasicInfoProps {
  form: UseFormReturn<UserFormValues>
  isSubmitting: boolean
}

export default function UserFormBasicInfo({
  form,
  isSubmitting,
}: UserFormBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          name="first_name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Prénom</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    disabled={isSubmitting}
                    className="pl-9 text-sm sm:text-base h-9 sm:h-10"
                    placeholder="Prénom de l'utilisateur"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />

        <FormField
          name="last_name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm sm:text-base">Nom</FormLabel>
              <FormControl>
                <div className="relative">
                  <UserCog className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    disabled={isSubmitting}
                    className="pl-9 text-sm sm:text-base h-9 sm:h-10"
                    placeholder="Nom de famille"
                  />
                </div>
              </FormControl>
              <FormMessage className="text-xs sm:text-sm" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        name="email"
        control={form.control}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm sm:text-base">Email</FormLabel>
            <FormControl>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  {...field}
                  disabled={isSubmitting}
                  className="pl-9 text-sm sm:text-base h-9 sm:h-10"
                  placeholder="adresse@exemple.com"
                  type="email"
                />
              </div>
            </FormControl>
            <FormMessage className="text-xs sm:text-sm" />
          </FormItem>
        )}
      />
    </div>
  )
}
