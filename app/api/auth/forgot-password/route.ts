import { NextRequest, NextResponse } from "next/server";
import passwordResetController from "@/lib/controllers/passwordResetController";

export async function POST(request: NextRequest): Promise<NextResponse> {
  return passwordResetController.requestPasswordReset(request);
}