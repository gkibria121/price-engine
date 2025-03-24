import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";
import ProductModel from "@/models/Product";
import PricingRuleModel from "@/models/PriceRule";
import DeliverySlotModel from "@/models/DeliverySlot";
import QuantityPricingModel from "@/models/QuantityPricing";
import VendorModel from "@/models/Vendor";
import VendorProductModel from "@/models/VendorProduct";
import { connectDB } from "@lib/db";

dotenv.config();

// Add Product and Associate with Vendor
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const {
      vendorId,
      productId,
      pricingRules,
      deliverySlots,
      quantityPricing,
    } = await req.json();

    if (!vendorId) {
      return NextResponse.json(
        { message: "Vendor ID is required" },
        { status: 400 }
      );
    }
    const existingVendorProduct = await VendorProductModel.findOne({
      product: productId,
      vendor: vendorId,
    });
    if (existingVendorProduct) {
      return NextResponse.json(
        { message: "Vendor Product already exists" },
        { status: 422 }
      );
    }

    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    const product = await ProductModel.findOne({ _id: productId });
    const newPricingRules = await PricingRuleModel.insertMany(pricingRules);
    const newDeliverySlots = await DeliverySlotModel.insertMany(deliverySlots);
    const newQuantityPricing = await QuantityPricingModel.insertMany(
      quantityPricing
    );
    const newAssociation = new VendorProductModel({
      vendor,
      product,
      pricingRules: newPricingRules,
      deliverySlots: newDeliverySlots,
      quantityPricing: newQuantityPricing,
    });
    await newAssociation.save();

    return NextResponse.json(
      { product, association: newAssociation },
      { status: 201 }
    );
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

    const vendorProducts = await VendorProductModel.find().populate([
      "product",
      "vendor",
      "pricingRules",
      "deliverySlots",
      "quantityPricing",
    ]);

    return NextResponse.json(vendorProducts, { status: 200 });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error },
      { status: 500 }
    );
  }
}
