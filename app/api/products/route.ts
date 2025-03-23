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
    const { vendorId, name, pricingRules, deliveryRules, quantityPricing } =
      await req.json();

    if (!vendorId) {
      return NextResponse.json(
        { message: "Vendor ID is required" },
        { status: 400 }
      );
    }

    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found" },
        { status: 404 }
      );
    }

    const newProduct = await ProductModel.create({ name });
    const newPricingRules = await PricingRuleModel.insertMany(pricingRules);
    const newDeliverySlots = await DeliverySlotModel.insertMany(deliveryRules);
    const newQuantityPricing = await QuantityPricingModel.insertMany(
      quantityPricing
    );
    console.log(newDeliverySlots);
    const newAssociation = new VendorProductModel({
      vendor,
      product: newProduct,
      pricingRules: newPricingRules,
      deliverySlots: newDeliverySlots,
      quantityPricing: newQuantityPricing,
    });
    await newAssociation.save();

    return NextResponse.json(
      { product: newProduct, association: newAssociation },
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

    const vendorProducts = await VendorProductModel.find()
      .populate("vendorId")
      .populate("productId");

    const products = vendorProducts.map((vp) => ({
      ...vp.productId.toObject(),
      vendor: vp.vendorId,
      pricingRules: vp.pricingRules,
      deliveryRules: vp.deliveryRules,
      quantityPricing: vp.quantityPricing,
    }));

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error },
      { status: 500 }
    );
  }
}
