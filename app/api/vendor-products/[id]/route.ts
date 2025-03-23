import { connectDB } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import ProductModel from "@/models/Product";
import VendorProductModel from "@/models/VendorProduct";
import PricingRuleModel from "@/models/PriceRule";
import DeliverySlotModel from "@/models/DeliverySlot";
import QuantityPricingModel from "@/models/QuantityPricing";
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const productId = (await params).id;
    // Fetch product by ID
    const productVendor = await VendorProductModel.findOne({
      product: productId,
    })
      .populate("product")
      .populate("vendor");
    if (!productVendor) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        _id: productVendor.product._id,
        name: productVendor.product.name,
        vendor: productVendor.vendor,
        pricingRules: productVendor.pricingRules,
        deliverySlots: productVendor.deliverySlots,
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
    const product = (await params).id;
    const { name, vendor, pricingRules, deliveryRules, quantityPricing } =
      await req.json();

    // Validate product exists
    const existingProduct = await ProductModel.findById(product);
    if (!existingProduct) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }
    const updatedPricingRules = await PricingRuleModel.insertMany(pricingRules);
    const updatedDeliverySlots = await DeliverySlotModel.insertMany(
      deliveryRules
    );
    const updatedQuantityPricing = await QuantityPricingModel.insertMany(
      quantityPricing
    );

    // Update the product
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      product,
      { $set: { name } },
      { new: true, runValidators: true }
    );

    // Update the vendor association with the product's vendor
    const association = await VendorProductModel.findOneAndUpdate(
      { product },
      {
        vendor,
        pricingRules: updatedPricingRules,
        deliverySlots: updatedDeliverySlots,
        quantityPricing: updatedQuantityPricing,
      },
      { new: true, upsert: true }
    ).populate([
      "product",
      "vendor",
      "pricingRules",
      "deliverySlots",
      "quantityPricing",
    ]);

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
    await VendorProductModel.deleteMany({ product: id });

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
