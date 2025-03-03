import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import VendorModel from "@/models/Vendor";
import VendorProductModel from "@/models/VendorProduct";
export async function DELETE(request: NextRequest, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    // await VendorModel.deleteMany({});
    // await VendorProductModel.deleteMany({});
    // await ProductModel.deleteOne({ _id: id });
    await VendorModel.deleteOne({ _id: id });
    await VendorProductModel.deleteOne({ productId: id });

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("❌ Error:", error);
    return NextResponse.json({ message: "Internal server error", error: error }, { status: 500 });
  }
}
