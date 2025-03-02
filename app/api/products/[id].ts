import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    return NextResponse.json({ message: "Updated" }, { status: 200 });
  } catch (error: any) {}
}
