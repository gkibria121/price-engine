import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import VendorProductModel from "@/models/VendorProduct";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const productId = (await params).id;
    // Fetch product by ID
    const products = await VendorProductModel.find({
      product: productId,
    }).populate(["pricingRules", "deliverySlots", "quantityPricings"]);
    if (!products) {
      return NextResponse.json(
        { message: "No vendor Products found" },
        { status: 404 }
      );
    }

    return NextResponse.json([...products], { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}
