import { OrderRepository } from "../repositories/OrderRepository";

export class OrderService {
    static async getUserOrders(userId: string) {
        const orders = await OrderRepository.getOrdersByUserId(userId);
        // console.log("Fetched orders:", orders);

        if (!orders || orders.length === 0) {
            return [];
        }

        // Transformer les données pour qu'elles correspondent au format attendu par le front
        return orders.map(order => ({
            id: order.id_order,
            subscriptions: order.order_items.map(item => ({
                id_order_item: item.id_order_item,
                service_name: item.product.name, // Récupérer le nom du service
                subscription_type: item.subscription_type,
                unit_price: item.unit_price,
                renewal_date: item.renewal_date,
                subscription_status: item.subscription_status
            }))
        }));
    }
}
