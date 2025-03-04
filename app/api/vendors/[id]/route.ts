import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import VendorModel from "@/models/Vendor";
import VendorProductModel from "@/models/VendorProduct";
export async function DELETE(request: NextRequest, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const vendor = await VendorModel.findById(id);
    if (!vendor) {
      return NextResponse.json({ message: "Vendor not found!" }, { status: 404 });
    }

    // Delete vendor and related products
    await VendorProductModel.deleteMany({ vendorId: id });
    await VendorModel.findByIdAndDelete(id);

    return NextResponse.json({ message: "Vendor deleted successfully" }, { status: 200 });
  } catch (error: unknown) {
    console.error("❌ Error:", error);
    return NextResponse.json({ message: "Internal server error", error: error }, { status: 500 });
  }
}
