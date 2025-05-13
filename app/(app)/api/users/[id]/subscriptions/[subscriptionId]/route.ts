import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string; subscriptionId: string }> }
) {
  const params = await context.params;
  try {
    const userId = parseInt(params.id);
    const subscriptionId = parseInt(params.subscriptionId);
    if (isNaN(userId) || isNaN(subscriptionId)) {
      return NextResponse.json({ message: "Invalid IDs" }, { status: 400 });
    }

    const subscription = await prisma.orderItem.findUnique({
      where: { id_order_item: subscriptionId },
      include: {
        order: true,
        product: {
          select: {
            id_product: true,
            name: true,
            main_image: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
    }
    if (subscription.order.id_user !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json({
      id_order_item: subscription.id_order_item,
      service_name: subscription.product.name,
      subscription_type: subscription.subscription_type,
      unit_price: subscription.unit_price,
      quantity: subscription.quantity,
      renewal_date: subscription.renewal_date,
      subscription_status: subscription.subscription_status,
      id_product: subscription.product.id_product,
      imageUrl: subscription.product.main_image || undefined,
    });
  } catch (error) {
    // console.error("[SubscriptionsAPI] GET Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string; subscriptionId: string }> }
) {
  const params = await context.params;
  try {
    const userId = parseInt(params.id);
    const subscriptionId = parseInt(params.subscriptionId);
    if (isNaN(userId) || isNaN(subscriptionId)) {
      return NextResponse.json({ message: "Invalid IDs" }, { status: 400 });
    }

    const { subscription_status } = await req.json();
    if (!subscription_status) {
      return NextResponse.json({ message: "Subscription status is required" }, { status: 400 });
    }

    const validStatuses = ["CANCELLED", "SUSPENDED"];
    if (!validStatuses.includes(subscription_status)) {
      return NextResponse.json(
        { message: `Invalid subscription status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const subscription = await prisma.orderItem.findUnique({
      where: { id_order_item: subscriptionId },
      include: { order: true },
    });

    if (!subscription) {
      return NextResponse.json({ message: "Subscription not found" }, { status: 404 });
    }
    if (subscription.order.id_user !== userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }
    if (subscription.subscription_status === subscription_status) {
      return NextResponse.json(
        { message: `Subscription is already ${subscription_status.toLowerCase()}` },
        { status: 400 }
      );
    }
    if (["EXPIRED", "CANCELLED"].includes(subscription.subscription_status)) {
      return NextResponse.json(
        { message: `Cannot modify subscription in ${subscription.subscription_status.toLowerCase()} status` },
        { status: 400 }
      );
    }

    const updatedSubscription = await prisma.orderItem.update({
      where: { id_order_item: subscriptionId },
      data: { subscription_status },
    });

    return NextResponse.json({
      message: `Subscription ${subscription_status.toLowerCase()} successfully`,
      subscription: updatedSubscription,
    });
  } catch (error) {
    // console.error("[SubscriptionsAPI] PATCH Error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}