import { prisma } from "../prisma";
import { PaymentInfo, User } from "@prisma/client";

export const paymentRepository = {
    async getPaymentsByUserId(userId: number): Promise<PaymentInfo[]> {
        return await prisma.paymentInfo.findMany({
            where: { id_user: userId },
        });
    },

    async getPaymentById(userId: number, paymentId: number): Promise<PaymentInfo | null> {
        return await prisma.paymentInfo.findUnique({
            where: {
                id_payment_info: paymentId,
                id_user: userId,
            },
        });
    },

    async createPayment(userId: number, paymentData: any): Promise<PaymentInfo> {
        return await prisma.paymentInfo.create({
            data: {
                id_user: userId,
                ...paymentData,
            },
        });
    },

    async updatePaymentInDb(userId: number, paymentId: number, paymentData: any): Promise<PaymentInfo> {
        return await prisma.paymentInfo.update({
            where: { id_payment_info: paymentId },
            data: paymentData,
        });
    },

    async deletePaymentInDb(userId: number, paymentId: number): Promise<void> {
        await prisma.paymentInfo.delete({
            where: { id_payment_info: paymentId },
        });
    },

    async getUserById(userId: number): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id_user: userId },
        });
    },
};