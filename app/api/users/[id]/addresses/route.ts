import { NextRequest, NextResponse } from "next/server";
import { AddressController } from "@/lib/controllers/AddressController";

export async function GET(req: NextRequest, context: { params: { id: string } }) {
    try {
        const { id } = await context.params;
        if (!id) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }
        return await AddressController.getUserAddresses(id);
    } catch (error) {
        console.error("Error fetching addresses in API route:", error);
        return NextResponse.json({ error: "API Error fetching addresses" }, { status: 500 });
    }
}
