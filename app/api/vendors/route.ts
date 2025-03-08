import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Vendor from "@/models/Vendor";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, address } = await req.json();

    if (!name || !email || !address) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const newVendor = await Vendor.create({ name, email, address });

    return NextResponse.json({ vendor: newVendor }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const vendors = await Vendor.find();

    return NextResponse.json({ vendors: vendors }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
