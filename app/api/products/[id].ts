import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET({ params }: { params: { id: string } }) {
  try {
    await connectDB();
    console.log(params);
    return NextResponse.json({ message: "Updated" }, { status: 200 });
  } catch (error: any) {
    console.log(error);
  }
}
