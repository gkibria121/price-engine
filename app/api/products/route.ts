import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";
import ProductModel from "@/models/Product";
import { connectDB } from "@lib/db";

dotenv.config();

// Add Product and Associate with Vendor
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Name is required" },
        { status: 422 }
      );
    }

    const newProduct = await ProductModel.create({ name });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error: unknown) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error },
      { status: 500 }
    );
  }
}

// Get All Products with Vendors
export async function GET() {
  try {
    await connectDB();

    const products = await ProductModel.find();

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error },
      { status: 500 }
    );
  }
}
