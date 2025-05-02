import { NextRequest } from 'next/server';
import orderController from '@/lib/controllers/order-controller';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return await orderController.getUserOrderHistoryForDisplay(id, req);
}