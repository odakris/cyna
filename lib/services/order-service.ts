import { endOfDay, endOfMonth, endOfYear, parseISO, startOfDay, startOfMonth, startOfYear } from "date-fns"
import { prisma } from "../prisma"
import orderRepository from "../repositories/order-repository"
import { OrderInputValues, orderFormSchema } from "../validations/order-schema"
import { Order, OrderStatus, Prisma } from "@prisma/client"
import { ZodError } from "zod"

// Définir un type pour Order avec les relations incluses
type OrderWithRelations = Prisma.OrderGetPayload<{
    include: {
        order_items: {
            include: {
                product: {
                    select: {
                        id_category: true;
                        name: true;
                    };
                };
            };
        };
        address: true;
    };
}>;

type OrderForInvoice = {
    id_order: number;
    id_user: number; // Ajout pour vérifier l'appartenance
    order_date: string;
    total_amount: number;
    subtotal: number;
    order_status: string;
    payment_method: string;
    last_card_digits: string;
    invoice_number: string;
    invoice_pdf_url: string | null;
    billing_address?: {
        address1: string;
        address2: string | null;
        city: string;
        postal_code: string;
        country: string;
    };
    subscriptions: {
        id_order_item: number;
        id_product: number;
        id_category: number | null;
        service_name: string;
        subscription_type: string;
        subscription_status: string;
        subscription_duration: number;
        renewal_date: string | null;
        quantity: number;
        unit_price: number;
    }[];
};

/**
 * Récupère la liste complète des commandes depuis le dépôt de données.
 * @returns {Promise<Order[]>} Liste des commandes.
 * @throws {Error} En cas d'erreur lors de la récupération des données.
 */
export const getAllOrders = async (): Promise<Order[]> => {
    try {
        const orders = await orderRepository.findAll()
        return orders
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error)
        // Propager l'erreur originale si elle existe
        if (error instanceof Error) {
            throw error
        }
        throw new Error("Erreur lors de la récupération des commandes")
    }
}

/**
 * Récupère une commande spécifique en fonction de son identifiant.
 * @param {number} id - Identifiant unique de la commande.
 * @returns {Promise<Order>} La commande correspondante.
 * @throws {Error} Si la commande n'existe pas ou en cas d'erreur.
 */
export const getOrderById = async (id: number): Promise<Order> => {
    if (!id || isNaN(Number(id)) || id <= 0) {
        throw new Error("ID de commande invalide")
    }

    try {
        const order = await orderRepository.findById(id)

        if (!order) {
            throw new Error(`Commande avec l'ID ${id} non trouvée`)
        }

        return order
    } catch (error) {
        console.error(
            `Erreur lors de la récupération de la commande ID ${id} :`,
            error
        )
        // Propager l'erreur originale si c'est notre erreur personnalisée
        if (error instanceof Error && error.message.includes("non trouvée")) {
            throw error
        }
        throw new Error(`Erreur lors de la récupération de la commande ID ${id}`)
    }
}

/**
 * Crée une nouvelle commande en base de données.
 * @param {OrderInputValues} data - Données de la commande à enregistrer.
 * @returns {Promise<Order>} La commande nouvellement créée.
 * @throws {Error} En cas d'erreur de validation ou de création.
 */
export const createOrder = async (data: OrderInputValues): Promise<Order> => {
    try {
        // Valider et transformer les données d'entrée
        const processedData = orderFormSchema.parse(data)

        // Créer la commande avec les données transformées
        const newOrder = await orderRepository.create(processedData)
        return newOrder
    } catch (error) {
        console.error("Erreur lors de la création de la commande :", error)

        // Erreurs de validation Zod
        if (error instanceof ZodError) {
            const validationErrors = error.errors
                .map(e => `${e.path.join(".")}: ${e.message}`)
                .join(", ")
            throw new Error(`Validation échouée: ${validationErrors}`)
        }

        // Autres types d'erreurs
        if (error instanceof Error) {
            // Préserver les erreurs de contraintes (comme utilisateur ou produit non trouvé)
            if (
                error.message.startsWith("Stock insuffisant") ||
                error.message.includes("n'existe pas") ||
                error.message.includes("non trouvée")
            ) {
                throw error
            }
            throw new Error(
                `Erreur lors de la création de la commande: ${error.message}`
            )
        }

        throw new Error("Erreur inconnue lors de la création de la commande")
    }
}

/**
 * Met à jour une commande existante avec de nouvelles informations.
 * @param {number} id - Identifiant de la commande à mettre à jour.
 * @param {OrderInputValues} data - Nouvelles données de la commande.
 * @returns {Promise<Order>} La commande mise à jour.
 * @throws {Error} Si la commande n'existe pas ou en cas d'erreur de validation.
 */
export const updateOrder = async (
    id: number,
    data: OrderInputValues
): Promise<Order> => {
    if (!id || isNaN(Number(id)) || id <= 0) {
        throw new Error("ID de commande invalide")
    }

    try {
        // Vérifier si la commande existe
        const exists = await orderRepository.exists(id)
        if (!exists) {
            throw new Error(`Commande avec l'ID ${id} non trouvée`)
        }

        // Obtenir la commande existante pour préserver certains champs
        const existingOrder = await orderRepository.findById(id)
        if (!existingOrder) {
            throw new Error(`Commande avec l'ID ${id} non trouvée`)
        }

        // Fusionner les données et conserver le numéro de facture
        const mergedData = {
            ...data,
            invoice_number: existingOrder.invoice_number,
        }

        // Transformer et valider les données
        const processedData = orderFormSchema.parse(mergedData)

        // Mettre à jour la commande
        const updatedOrder = await orderRepository.update(id, processedData)
        return updatedOrder
    } catch (error) {
        console.error(
            `Erreur lors de la mise à jour de la commande ID ${id} :`,
            error
        )

        // Erreurs de validation Zod
        if (error instanceof ZodError) {
            const validationErrors = error.errors
                .map(e => `${e.path.join(".")}: ${e.message}`)
                .join(", ")
            throw new Error(`Validation échouée: ${validationErrors}`)
        }

        // Préserver les erreurs personnalisées
        if (
            error instanceof Error &&
            (error.message.includes("non trouvée") ||
                error.message.startsWith("Stock insuffisant"))
        ) {
            throw error
        }

        throw new Error(`Erreur lors de la mise à jour de la commande ID ${id}`)
    }
}

/**
 * Met à jour le statut d'une commande existante.
 * @param {number} id - Identifiant de la commande à mettre à jour.
 * @param {OrderStatus} status - Nouveau statut de la commande.
 * @returns {Promise<Order>} La commande mise à jour.
 * @throws {Error} Si la commande n'existe pas.
 */
export const updateOrderStatus = async (
    id: number,
    status: OrderStatus
): Promise<Order> => {
    if (!id || isNaN(Number(id)) || id <= 0) {
        throw new Error("ID de commande invalide")
    }

    try {
        // Vérifier si la commande existe
        const exists = await orderRepository.exists(id)
        if (!exists) {
            throw new Error(`Commande avec l'ID ${id} non trouvée`)
        }

        // Mettre à jour le statut
        const updatedOrder = await orderRepository.updateStatus(id, status)
        return updatedOrder
    } catch (error) {
        console.error(
            `Erreur lors de la mise à jour du statut de la commande ID ${id} :`,
            error
        )
        throw error instanceof Error
            ? error
            : new Error(
                `Erreur lors de la mise à jour du statut de la commande ID ${id}`
            )
    }
}

/**
 * Supprime une commande de la base de données.
 * @param {number} id - Identifiant de la commande à supprimer.
 * @returns {Promise<object>} Message de confirmation de suppression.
 * @throws {Error} Si la commande n'existe pas ou ne peut pas être supprimée.
 */
export const deleteOrder = async (id: number): Promise<object> => {
    if (!id || isNaN(Number(id)) || id <= 0) {
        throw new Error("ID de commande invalide")
    }

    try {
        // Vérifier si la commande existe
        const exists = await orderRepository.exists(id)
        if (!exists) {
            throw new Error(`Commande avec l'ID ${id} non trouvée`)
        }

        // Supprimer la commande
        await orderRepository.remove(id)
        return { success: true, message: `Commande ${id} supprimée avec succès` }
    } catch (error) {
        console.error(
            `Erreur lors de la suppression de la commande ID ${id} :`,
            error
        )

        // Préserver les erreurs personnalisées
        if (error instanceof Error && error.message.includes("non trouvée")) {
            throw error
        }

        // Erreurs potentielles de contrainte d'intégrité
        if (
            error instanceof Error &&
            (error.message.includes("constraint") ||
                error.message.includes("foreign key"))
        ) {
            throw new Error(
                `Impossible de supprimer la commande ID ${id} car elle est référencée par d'autres entités`
            )
        }

        throw new Error(`Erreur lors de la suppression de la commande ID ${id}`)
    }
}

export const getUserOrders = async (userId: string): Promise<object[]> => {
    const orders: OrderWithRelations[] = await orderRepository.getOrdersByUserId(userId);

    if (!orders || orders.length === 0) {
        return [];
    }

    return orders.map(order => ({
        id: order.id_order,
        subscriptions: order.order_items.map(item => ({
            id_order_item: item.id_order_item,
            service_name: item.product?.name || "Nom de service indisponible",
            subscription_type: item.subscription_type,
            unit_price: item.unit_price,
            renewal_date: item.renewal_date?.toISOString() || null,
            subscription_status: item.subscription_status,
        })),
    }));
};

export const getUserOrderHistory = async (
    userId: string,
    filters?: {
        year?: string;
        categoryIds?: string;
        orderStatus?: string;
        search?: string;
        orderDate?: string;
    }
): Promise<object[]> => {
    try {
        const parsedUserId = parseInt(userId);
        if (isNaN(parsedUserId) || parsedUserId <= 0) {
            throw new Error("User ID must be a valid positive number");
        }

        // Valider et convertir categoryIds
        let categoryIdFilter: number | { in: number[] } | undefined;
        if (filters?.categoryIds) {
            const ids = filters.categoryIds.split(",").map(id => parseInt(id));
            const validIds = ids.filter(id => !isNaN(id) && id > 0);

            if (validIds.length === 0) {
                throw new Error("Invalid category IDs provided");
            }

            categoryIdFilter =
                validIds.length === 1
                    ? validIds[0]
                    : { in: validIds };
        }

        // Valider et convertir orderStatus
        let orderStatusFilter: OrderStatus | { in: OrderStatus[] } | undefined;
        if (filters?.orderStatus) {
            const statuses = filters.orderStatus.split(",") as OrderStatus[];
            const validStatuses = Object.values(OrderStatus);
            const filteredStatuses = statuses.filter((status) =>
                validStatuses.includes(status)
            );

            if (filteredStatuses.length === 0) {
                throw new Error("Invalid order status provided");
            }

            orderStatusFilter =
                filteredStatuses.length === 1
                    ? filteredStatuses[0]
                    : { in: filteredStatuses };
        }

        // Gérer le filtre par date (orderDate)
        let dateFilter: { gte?: Date; lte?: Date } | undefined;
        if (filters?.orderDate) {
            const parsedDate = parseISO(filters.orderDate);
            if (isNaN(parsedDate.getTime())) {
                throw new Error("Invalid date format for order_date. Expected format: YYYY-MM-DD");
            }

            const dateStr = filters.orderDate;
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                dateFilter = {
                    gte: startOfDay(parsedDate),
                    lte: endOfDay(parsedDate),
                };
            } else if (dateStr.match(/^\d{4}-\d{2}$/)) {
                dateFilter = {
                    gte: startOfMonth(parsedDate),
                    lte: endOfMonth(parsedDate),
                };
            } else if (dateStr.match(/^\d{4}$/)) {
                dateFilter = {
                    gte: startOfYear(parsedDate),
                    lte: endOfYear(parsedDate),
                };
            } else {
                throw new Error("Unsupported date format for order_date. Use YYYY-MM-DD, YYYY-MM, or YYYY");
            }
        }

        // Combiner les filtres de date (orderDate et year)
        let combinedDateFilter: { gte?: Date; lte?: Date } | undefined;
        if (filters?.year && dateFilter) {
            combinedDateFilter = dateFilter;
        } else if (filters?.year) {
            combinedDateFilter = {
                gte: new Date(`${filters.year}-01-01`),
                lte: new Date(`${filters.year}-12-31`),
            };
        } else if (dateFilter) {
            combinedDateFilter = dateFilter;
        }

        // Construire les conditions pour la recherche par nom de service
        let searchFilter = {};
        if (filters?.search) {
            searchFilter = {
                order_items: {
                    some: {
                        product: {
                            name: {
                                contains: filters.search,
                                mode: "insensitive",
                            },
                            isNot: null, // S'assurer que product n'est pas null
                        },
                    },
                },
            };
        }

        // Construire les conditions de filtrage
        const whereClause: Prisma.OrderWhereInput = {
            id_user: parsedUserId,
            order_date: combinedDateFilter,
            order_status: orderStatusFilter,
            order_items: {
                some: {
                    product: {
                        id_category: categoryIdFilter,
                    },
                },
            },
            ...(filters?.search ? searchFilter : {}),
        };

        const orders: OrderWithRelations[] = await prisma.order.findMany({
            where: whereClause,
            include: {
                order_items: {
                    include: {
                        product: true, // Inclure toutes les propriétés de product
                    },
                },
                address: true,
            },
        });

        if (!orders || orders.length === 0) {
            return [];
        }

        return orders.map((order) => ({
            id_order: order.id_order,
            order_date: order.order_date.toISOString(),
            total_amount: order.total_amount,
            subtotal: order.subtotal,
            order_status: order.order_status,
            payment_method: order.payment_method,
            last_card_digits: order.last_card_digits || "",
            invoice_number: order.invoice_number,
            invoice_pdf_url: order.invoice_pdf_url,
            billing_address: order.address
                ? {
                    address1: order.address.address1,
                    address2: order.address.address2,
                    city: order.address.city,
                    postal_code: order.address.postal_code,
                    country: order.address.country,
                }
                : undefined,
            subscriptions: order.order_items.map((item) => ({
                id_order_item: item.id_order_item,
                id_product: item.id_product,
                id_category: item.product?.id_category ?? null,
                service_name: item.product?.name || "Nom de service indisponible",
                subscription_type: item.subscription_type,
                subscription_status: item.subscription_status,
                subscription_duration: item.subscription_duration,
                renewal_date: item.renewal_date?.toISOString() || null,
                quantity: item.quantity,
                unit_price: item.unit_price,
            })),
        }));
    } catch (error) {
        console.error(
            "Erreur lors de la récupération de l'historique des commandes",
            error || "Unknown error"
        );
        throw new Error(
            error instanceof Error
                ? `Erreur lors de la récupération des données: ${error.message}`
                : "Erreur lors de la récupération des données"
        );
    }
};

export const getOrderByIdForInvoice = async (
    orderId: number,
    userId?: string
): Promise<OrderForInvoice> => {
    if (!orderId || isNaN(orderId) || orderId <= 0) {
        throw new Error("Invalid order ID");
    }

    try {
        const order = await prisma.order.findUnique({
            where: { id_order: orderId },
            include: {
                order_items: {
                    include: {
                        product: true,
                    },
                },
                address: true,
            },
        });

        if (!order) {
            throw new Error("Order not found");
        }

        // Vérifier que la commande appartient à l'utilisateur si userId est fourni
        if (userId) {
            const parsedUserId = parseInt(userId);
            if (isNaN(parsedUserId) || parsedUserId <= 0) {
                throw new Error("Invalid user ID");
            }
            if (order.id_user !== parsedUserId) {
                throw new Error("Unauthorized access to this order");
            }
        }

        return {
            id_order: order.id_order,
            id_user: order.id_user, // Ajout pour vérification
            order_date: order.order_date.toISOString(),
            total_amount: order.total_amount,
            subtotal: order.subtotal,
            order_status: order.order_status,
            payment_method: order.payment_method,
            last_card_digits: order.last_card_digits || "",
            invoice_number: order.invoice_number,
            invoice_pdf_url: order.invoice_pdf_url,
            billing_address: order.address
                ? {
                    address1: order.address.address1,
                    address2: order.address.address2,
                    city: order.address.city,
                    postal_code: order.address.postal_code,
                    country: order.address.country,
                }
                : undefined,
            subscriptions: order.order_items.map((item) => ({
                id_order_item: item.id_order_item,
                id_product: item.id_product,
                id_category: item.product?.id_category ?? null,
                service_name: item.product?.name || "Nom de service indisponible",
                subscription_type: item.subscription_type,
                subscription_status: item.subscription_status,
                subscription_duration: item.subscription_duration,
                renewal_date: item.renewal_date?.toISOString() || null,
                quantity: item.quantity,
                unit_price: item.unit_price,
            })),
        };
    } catch (error) {
        console.error("Error fetching order for invoice:", error);
        throw error instanceof Error ? error : new Error("Failed to fetch order");
    }
};


const orderService = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    getUserOrders,
    getUserOrderHistory,
    getOrderByIdForInvoice
};

export default orderService;