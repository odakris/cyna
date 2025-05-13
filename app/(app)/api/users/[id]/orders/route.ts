import { NextRequest, NextResponse } from "next/server";
import OrderController from "@/lib/controllers/order-controller";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        // Résoudre params avec await
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        return await OrderController.getUserOrderHistoryForDisplay(id);
    } catch (error) {
        // console.error("Error fetching order history in API route:", error || "Unknown error");
        return NextResponse.json({ error: "API Error fetching order history" }, { status: 500 });
    }
}