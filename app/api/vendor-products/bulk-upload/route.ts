import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Add Product and Associate with Vendor
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { pricingRules, deliverySlots, quantityPricings } = await req.json();

    return NextResponse.json({
      pricingRules,
      deliverySlots,
      quantityPricings,
    });
  } catch (e) {
    console.log(e);
  }
}
