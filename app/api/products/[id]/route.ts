import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import ProductModel from "@/models/Product";
import VendorProductModel from "@/models/VendorProduct";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const productId = (await params).id;
    // Fetch product by ID
    const productVendor = await VendorProductModel.findOne({
      productId,
    })
      .populate("productId")
      .populate("vendorId");
    if (!productVendor) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        _id: productVendor.productId._id,
        name: productVendor.productId.name,
        vendor: productVendor.vendorId,
        pricingRules: productVendor.pricingRules,
        deliveryRules: productVendor.deliveryRules,
        quantityPricing: productVendor.quantityPricing,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return NextResponse.json(
      { message: "Internal server error", error },
      { status: 500 }
    );
  }
}

// Update Product and Vendor Association
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const productId = (await params).id;
    const { name, vendorId, pricingRules, deliveryRules, quantityPricing } =
      await req.json();

    // Validate product exists
    const existingProduct = await ProductModel.findById(productId);
    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Update the product
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      productId,
      { $set: { name } },
      { new: true, runValidators: true }
    );

    // Update the vendor association with the product's vendorId
    const association = await VendorProductModel.findOneAndUpdate(
      { productId },
      { vendorId, pricingRules, deliveryRules, quantityPricing },
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

// Clear Database
export async function DELETE(request: NextRequest, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    // await VendorModel.deleteMany({});
    // await VendorProductModel.deleteMany({});
    await ProductModel.deleteOne({ _id: id });
    await VendorProductModel.deleteMany({ productId: id });

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error },
      { status: 500 }
    );
  }
}
