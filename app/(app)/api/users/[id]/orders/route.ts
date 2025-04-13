import { NextRequest, NextResponse } from "next/server";
import OrderController from "@/lib/controllers/order-controller";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        return await OrderController.getUserOrders(id);
    } catch (error) {
        console.error("Error fetching orders in API route:", error);
        return NextResponse.json({ error: "API Error fetching orders" }, { status: 500 });
    }
}
