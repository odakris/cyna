import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

import { ShoppingCart } from 'lucide-react'

export function SideBasket() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <ShoppingCart />
        </Button>
      </SheetTrigger>

      <SheetContent className="bg-slate-200">
        <SheetHeader>
          <SheetTitle>Panier</SheetTitle>
          <SheetDescription>
            Articles actuellement dans votre panier
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Acticle 2
            </Label>
            {/* <Input id="name" value="Pedro Duarte" className="col-span-3" /> */}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Article 2
            </Label>
            {/* <Input id="username" value="@peduarte" className="col-span-3" /> */}
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" variant={'destructive'} size={'lg'}>
              Paiement
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
