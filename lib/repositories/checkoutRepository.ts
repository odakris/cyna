import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface Transaction {
  id?: number;
  stripeCheckoutId: string;
  userId: string | null;
  amount: number;
  currency: string;
  status: string;
  cartItems: any;
  createdAt?: Date;
}

export class CheckoutRepository {
  async createTransaction(transaction: Omit<Transaction, "id" | "createdAt">): Promise<Transaction> {
    return prisma.transaction.create({
      data: {
        stripeCheckoutId: transaction.stripeCheckoutId,
        userId: transaction.userId,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        cartItems: transaction.cartItems,
      },
    });
  }

  async updateTransactionStatus(checkoutId: string, status: string): Promise<Transaction> {
    return prisma.transaction.update({
      where: { stripeCheckoutId: checkoutId },
      data: { status },
    });
  }

  async getTransactionByCheckoutId(checkoutId: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
      where: { stripeCheckoutId: checkoutId },
    });
  }
}