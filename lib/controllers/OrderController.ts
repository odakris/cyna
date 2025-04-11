import { NextResponse } from "next/server";
import { OrderService } from "../services/OrderService";

export class OrderController {
    static async getUserOrders(id: string) {
        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        try {
            const orders = await OrderService.getUserOrders(id);

            if (orders.length === 0) {
                return NextResponse.json({ error: "Aucune commande trouvée" }, { status: 404 });
            }

            return NextResponse.json(orders, { status: 200 });
        } catch (error) {
            console.error("OrderController Error fetching orders:", error);
            return NextResponse.json({ error: "Controller Error fetching orders" }, { status: 500 });
        }
    }
}
