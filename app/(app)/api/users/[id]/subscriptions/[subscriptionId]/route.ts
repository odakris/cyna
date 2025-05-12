import { NextResponse } from "next/server"
import { addMonths, addYears } from "date-fns"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; subscriptionId: string }> }
) {
  const params = await context.params
  console.log("[SubscriptionsAPI] GET request for subscription:", {
    userId: params.id, // Note : On garde "userId" dans le log pour clarté, mais c'est params.id
    subscriptionId: params.subscriptionId,
    url: req.url,
  })

  try {
    // Vérifier si les paramètres sont définis
    if (!params.id || !params.subscriptionId) {
      console.warn("[SubscriptionsAPI] Missing parameters:", {
        userId: params.id,
        subscriptionId: params.subscriptionId,
        url: req.url,
      })
      return NextResponse.json(
        { message: "User ID or subscription ID is missing" },
        { status: 400 }
      )
    }

    // Valider les paramètres
    const userId = parseInt(params.id)
    const subscriptionId = parseInt(params.subscriptionId)
    if (isNaN(userId) || isNaN(subscriptionId)) {
      console.warn("[SubscriptionsAPI] Invalid parameters:", {
        userId: params.id,
        subscriptionId: params.subscriptionId,
        url: req.url,
      })
      return NextResponse.json(
        { message: "Invalid user ID or subscription ID" },
        { status: 400 }
      )
    }

    const subscription = await prisma.orderItem.findUnique({
      where: { id_order_item: subscriptionId },
      include: { order: true },
    })

    if (!subscription) {
      console.warn("[SubscriptionsAPI] Subscription not found:", {
        subscriptionId,
        url: req.url,
      })
      return NextResponse.json(
        { message: `Subscription with ID ${subscriptionId} not found` },
        { status: 404 }
      )
    }

    if (subscription.order.id_user !== userId) {
      console.warn("[SubscriptionsAPI] User mismatch:", {
        subscriptionId,
        userId,
        orderUserId: subscription.order.id_user,
        url: req.url,
      })
      return NextResponse.json(
        { message: "Subscription does not belong to this user" },
        { status: 403 }
      )
    }

    console.log("[SubscriptionsAPI] Subscription fetched successfully:", subscription.id_order_item)
    return NextResponse.json({
      id_order_item: subscription.id_order_item,
      service_name: subscription.id_product,
      subscription_type: subscription.subscription_type,
      unit_price: subscription.unit_price,
      quantity: subscription.quantity,
      renewal_date: subscription.renewal_date,
      subscription_status: subscription.subscription_status,
    })
  } catch (error) {
    console.error("[SubscriptionsAPI] Error in GET:", error)
    return NextResponse.json(
      { message: "Server error while fetching subscription" },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  console.log("[SubscriptionsAPI] POST request for new subscription, userId:", params.id)

  try {
    if (!params.id) {
      console.warn("[SubscriptionsAPI] Missing user ID:", params.id)
      return NextResponse.json(
        { message: "User ID is missing" },
        { status: 400 }
      )
    }

    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      console.warn("[SubscriptionsAPI] Invalid user ID:", params.id)
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const {
      service_name,
      subscription_type,
      unit_price,
      previous_subscription_id,
    } = body

    console.log("[SubscriptionsAPI] Request body:", {
      service_name,
      subscription_type,
      unit_price,
      previous_subscription_id,
    })

    const previousSubscription = await prisma.orderItem.findUnique({
      where: { id_order_item: previous_subscription_id },
      include: { order: true },
    })

    if (
      !previousSubscription ||
      previousSubscription.order.id_user !== userId
    ) {
      console.warn("[SubscriptionsAPI] Previous subscription not found or user mismatch:", {
        previous_subscription_id,
        userId,
      })
      return NextResponse.json(
        { message: "Previous subscription not found or does not belong to user" },
        { status: 404 }
      )
    }

    const startDate = new Date(previousSubscription.renewal_date)
    const renewalDate =
      subscription_type === "MONTHLY"
        ? addMonths(startDate, 1)
        : addYears(startDate, 1)

    console.log("[SubscriptionsAPI] Calculated renewal date:", renewalDate)

    const order = await prisma.order.create({
      data: {
        id_user: userId,
        total_amount: unit_price,
        order_status: "CONFIRMED",
        order_date: new Date(),
        items: {
          create: {
            service_name,
            subscription_type,
            unit_price,
            quantity: 1,
            subscription_status: "PENDING",
            renewal_date: renewalDate,
          },
        },
      },
    })

    console.log("[SubscriptionsAPI] New order created:", order.id_order)

    await prisma.orderItem.update({
      where: { id_order_item: previous_subscription_id },
      data: { subscription_status: "CANCELLED" },
    })

    console.log("[SubscriptionsAPI] Previous subscription cancelled:", previous_subscription_id)

    return NextResponse.json(
      { message: "New subscription created successfully", order },
      { status: 201 }
    )
  } catch (error) {
    console.error("[SubscriptionsAPI] Error in POST:", error)
    return NextResponse.json(
      { message: "Error creating subscription" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string; subscriptionId: string }> }
) {
  const params = await context.params
  console.log("[SubscriptionsAPI] PATCH request for subscription:", {
    userId: params.id,
    subscriptionId: params.subscriptionId,
    url: req.url,
  })

  try {
    if (!params.id || !params.subscriptionId) {
      console.warn("[SubscriptionsAPI] Missing parameters:", {
        userId: params.id,
        subscriptionId: params.subscriptionId,
        url: req.url,
      })
      return NextResponse.json(
        { message: "User ID or subscription ID is missing" },
        { status: 400 }
      )
    }

    const userId = parseInt(params.id)
    const subscriptionId = parseInt(params.subscriptionId)
    if (isNaN(userId) || isNaN(subscriptionId)) {
      console.warn("[SubscriptionsAPI] Invalid parameters:", {
        userId: params.id,
        subscriptionId: params.subscriptionId,
        url: req.url,
      })
      return NextResponse.json(
        { message: "Invalid user ID or subscription ID" },
        { status: 400 }
      )
    }

    const body = await req.json()
    const { subscription_type, quantity } = body

    console.log("[SubscriptionsAPI] Request body:", { subscription_type, quantity })

    const subscription = await prisma.orderItem.findUnique({
      where: { id_order_item: subscriptionId },
      include: { order: true },
    })

    if (!subscription) {
      console.warn("[SubscriptionsAPI] Subscription not found:", {
        subscriptionId,
        url: req.url,
      })
      return NextResponse.json(
        { message: `Subscription with ID ${subscriptionId} not found` },
        { status: 404 }
      )
    }

    if (subscription.order.id_user !== userId) {
      console.warn("[SubscriptionsAPI] User mismatch:", {
        subscriptionId,
        userId,
        orderUserId: subscription.order.id_user,
        url: req.url,
      })
      return NextResponse.json(
        { message: "Subscription does not belong to this user" },
        { status: 403 }
      )
    }

    if (!["MONTHLY", "YEARLY", "PER_USER", "PER_MACHINE"].includes(subscription_type)) {
      console.warn("[SubscriptionsAPI] Invalid subscription type:", subscription_type)
      return NextResponse.json(
        { message: "Invalid subscription type" },
        { status: 400 }
      )
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      console.warn("[SubscriptionsAPI] Invalid quantity:", quantity)
      return NextResponse.json(
        { message: "Quantity must be a positive integer" },
        { status: 400 }
      )
    }

    const updatedSubscription = await prisma.orderItem.update({
      where: { id_order_item: subscriptionId },
      data: {
        subscription_type,
        quantity,
        order: {
          update: {
            total_amount: subscription.unit_price * quantity,
          },
        },
      },
    })

    console.log("[SubscriptionsAPI] Subscription updated successfully:", updatedSubscription.id_order_item)
    return NextResponse.json(
      { message: "Subscription updated successfully", subscription: updatedSubscription },
      { status: 200 }
    )
  } catch (error) {
    console.error("[SubscriptionsAPI] Error in PATCH:", error)
    return NextResponse.json(
      { message: "Error updating subscription" },
      { status: 500 }
    )
  }
}