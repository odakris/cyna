import { prisma } from "@/lib/prisma";

export class OrderRepository {
    static async getOrdersByUserId(userId: string) {
        const orders = await prisma.order.findMany({
            where: { id_user: parseInt(userId) }, // Vérification que l'ID est bien un nombre
            include: {
                order_items: {
                    include: {
                        product: true, // Inclure les infos du produit pour récupérer le nom du service et le prix
                    },
                },
            },
        });

        // console.log("Orders fetched:", orders);
        return orders;
    }
}
