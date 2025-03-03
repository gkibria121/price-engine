import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import ProductModel from "@/models/Product";
import VendorProductModel from "@/models/VendorProduct";
// Update Product
// Update Product and Vendor Association
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const productId = params.id;
    const updateData = await req.json();

    // Validate product exists
    const existingProduct = await ProductModel.findById(productId);
    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // Update the product
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Update the vendor association with the product's vendorId
    const association = await VendorProductModel.findOneAndUpdate(
      { productId },
      { vendorId: updateData.vendorId },
      { new: true, upsert: true }
    );

    return NextResponse.json(
      {
        message: "Product updated successfully",
        product: updatedProduct,
        association: association,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error,
      },
      { status: 500 }
    );
  }
}
