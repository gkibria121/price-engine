import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import ProductModel from "@/models/Product";

// Add Multiple Products
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { products } = await req.json();

    // Validate input
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { message: "Missing or invalid fields" },
        { status: 422 }
      );
    }

    // Insert products in bulk
    const newProducts = await ProductModel.insertMany(products);

    return NextResponse.json(
      { message: "Products added successfully", products: newProducts },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
