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
    const vendorProductId = (await params).id;
    // Fetch product by ID
    const productVendor = await VendorProductModel.findOne({
      _id: vendorProductId,
    }).populate([
      "product",
      "vendor",
      "pricingRules",
      "quantityPricing",
      "deliverySlots",
    ]);

    if (!productVendor) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        _id: productVendor._id,
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
    const vendorProductId = (await params).id;
    const { pricingRules, deliverySlots, quantityPricing } = await req.json();
    console.log(vendorProductId);
    // Validate product exists
    const vendorProduct = await VendorProductModel.findById(vendorProductId);
    if (!vendorProduct) {
      return NextResponse.json(
        { message: "Vendor Product not found" },
        { status: 404 }
      );
    }

    // Remove previous values
    await PricingRuleModel.deleteMany({
      _id: { $in: vendorProduct.pricingRules },
    });
    await DeliverySlotModel.deleteMany({
      _id: { $in: vendorProduct.deliverySlots },
    });
    await QuantityPricingModel.deleteMany({
      _id: { $in: vendorProduct.quantityPricing },
    });

    // Insert new values
    const updatedPricingRules = await PricingRuleModel.insertMany(pricingRules);
    const updatedDeliverySlots = await DeliverySlotModel.insertMany(
      deliverySlots
    );
    const updatedQuantityPricing = await QuantityPricingModel.insertMany(
      quantityPricing
    );

    // Update vendorProduct with new associations
    const updatedVendorProduct = await VendorProductModel.findByIdAndUpdate(
      vendorProductId,
      {
        pricingRules: updatedPricingRules.map((rule) => rule._id),
        deliverySlots: updatedDeliverySlots.map((slot) => slot._id),
        quantityPricing: updatedQuantityPricing.map((price) => price._id),
      },
      { new: true }
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
        vendorProduct: updatedVendorProduct,
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
