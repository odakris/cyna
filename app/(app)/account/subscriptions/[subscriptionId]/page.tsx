"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CartItemCard from "@/components/Cart/CartItemCard"
import { toast } from "react-hot-toast"

interface Subscription {
  id_order_item: number
  service_name: string
  subscription_type: string
  unit_price: number
  quantity: number
  renewal_date: string
  subscription_status: string
  imageUrl?: string
}

export default function EditSubscriptionPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { subscriptionId } = useParams()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [updatedSubscription, setUpdatedSubscription] = useState<{
    subscription_type: string
    quantity: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Récupérer les détails de l'abonnement
  useEffect(() => {
    console.log("[EditSubscription] Session status:", status)
    console.log("[EditSubscription] Session data:", session)

    if (status === "loading") {
      console.log("[EditSubscription] Session still loading")
      return
    }

    if (!session?.user?.id_user || !subscriptionId) {
      console.warn(
        "[EditSubscription] Missing user session or subscription ID:",
        {
          userId: session?.user?.id_user,
          subscriptionId,
        }
      )
      setError("User session or subscription ID is missing.")
      setLoading(false)
      return
    }

    console.log(
      "[EditSubscription] Fetching subscription details for ID:",
      subscriptionId
    )
    console.log("[EditSubscription] User session:", {
      userId: session.user.id_user,
    })

    const fetchSubscription = async () => {
      try {
        console.time("[EditSubscription] fetchSubscription")
        const apiUrl = `/api/users/${session.user.id_user}/subscriptions/${subscriptionId}`
        console.log("[EditSubscription] Fetching from URL:", apiUrl)
        const response = await fetch(apiUrl, { credentials: "include" })
        console.log(
          `[EditSubscription] API response: ${response.status} ${response.statusText}`
        )

        if (!response.ok) {
          let errorData
          try {
            errorData = await response.json()
          } catch {
            errorData = { message: "No error details provided by server" }
          }
          console.error("[EditSubscription] API error:", {
            status: response.status,
            statusText: response.statusText,
            errorData,
          })
          if (response.status === 404) {
            throw new Error(
              "Subscription not found or does not belong to this user."
            )
          } else if (response.status === 403) {
            throw new Error(
              "You are not authorized to access this subscription."
            )
          } else if (response.status === 400) {
            throw new Error(errorData.message || "Invalid request parameters.")
          } else {
            throw new Error(
              errorData.message ||
                `Failed to fetch subscription (HTTP ${response.status})`
            )
          }
        }

        const data = await response.json()
        console.log("[EditSubscription] Subscription data fetched:", data)
        setSubscription(data)
        setUpdatedSubscription({
          subscription_type: data.subscription_type,
          quantity: data.quantity,
        })
      } catch (err: any) {
        console.error("[EditSubscription] Fetch error:", err)
        setError(err.message || "Unable to load subscription details.")
      } finally {
        console.timeEnd("[EditSubscription] fetchSubscription")
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [session, status, subscriptionId])

  // Gérer la mise à jour du type d'abonnement ou de la quantité
  const handleUpdateSubscription = (changes: {
    subscription?: string
    quantity?: number
  }) => {
    if (!updatedSubscription) return
    setUpdatedSubscription({
      ...updatedSubscription,
      subscription_type:
        changes.subscription ?? updatedSubscription.subscription_type,
      quantity: changes.quantity ?? updatedSubscription.quantity,
    })
    console.log("[EditSubscription] Subscription updated locally:", changes)
  }

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log(
      "[EditSubscription] Form submitted with changes:",
      updatedSubscription
    )

    if (!session?.user?.id_user || !subscription || !updatedSubscription) {
      console.warn(
        "[EditSubscription] Missing user session or subscription data"
      )
      setError("User session or subscription data missing.")
      return
    }

    try {
      if (
        updatedSubscription.subscription_type ===
          subscription.subscription_type &&
        updatedSubscription.quantity === subscription.quantity
      ) {
        console.log("[EditSubscription] No changes detected")
        toast({
          title: "No Changes",
          description: "Please modify the subscription type or quantity.",
          variant: "default",
        })
        return
      }

      console.log(
        "[EditSubscription] Sending update to API:",
        updatedSubscription
      )
      const apiUrl = `/api/users/${session.user.id_user}/subscriptions/${subscriptionId}`
      console.log("[EditSubscription] Updating with URL:", apiUrl)
      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_type: updatedSubscription.subscription_type,
          quantity: updatedSubscription.quantity,
        }),
        credentials: "include",
      })

      console.log(
        `[EditSubscription] Update API response: ${response.status} ${response.statusText}`
      )
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: "No error details provided by server" }
        }
        console.error("[EditSubscription] Update error:", {
          status: response.status,
          statusText: response.statusText,
          errorData,
        })
        throw new Error(
          errorData.message ||
            `Failed to update subscription (HTTP ${response.status})`
        )
      }

      console.log("[EditSubscription] Subscription updated successfully")
      toast({
        title: "Success",
        description: "Your subscription has been updated.",
      })
      router.push("/account/settings")
    } catch (err: any) {
      console.error("[EditSubscription] Error during submission:", err)
      setError(
        err.message || "An error occurred while updating the subscription."
      )
    }
  }

  if (loading) {
    console.log("[EditSubscription] Page loading")
    return <div>Loading...</div>
  }

  if (!subscription || error) {
    console.warn("[EditSubscription] Rendering error state:", { error })
    return (
      <div className="p-6 container mx-auto">
        <h1 className="text-3xl font-bold text-[#302082] relative pb-2 inline-block mb-8">
          Modifier l&apos;abonnement
          <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
        </h1>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg">
          {error || "Subscription not found."}
        </div>
        <Button
          variant="outline"
          onClick={() => {
            console.log("[EditSubscription] Navigating back to settings")
            router.push("/account/settings")
          }}
        >
          Retour aux paramètres
        </Button>
      </div>
    )
  }

  console.log(
    "[EditSubscription] Rendering page for subscription:",
    subscription.id_order_item
  )
  return (
    <div className="p-6 container mx-auto">
      <h1 className="text-3xl font-bold text-[#302082] relative pb-2 inline-block mb-8">
        Modifier l&apos;abonnement
        <span className="absolute bottom-0 left-0 w-full h-1 bg-[#302082] rounded"></span>
      </h1>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-6 rounded-lg">
          {error}
        </div>
      )}
      <Card className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <CartItemCard
            item={{
              uniqueId: subscription.id_order_item.toString(),
              name: subscription.service_name,
              price: subscription.unit_price,
              subscription: updatedSubscription?.subscription_type || "MONTHLY",
              quantity: updatedSubscription?.quantity || 1,
              imageUrl: subscription.imageUrl,
            }}
            onUpdate={handleUpdateSubscription}
            onRemove={() => {}}
            disableRemove
          />
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                console.log(
                  "[EditSubscription] Cancelling update, navigating to settings"
                )
                router.push("/account/settings")
              }}
            >
              Annuler
            </Button>
            <Button type="submit">Confirmer</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
