import { connectDB } from "@/lib/db";
import PriceCalculationRequest from "@/lib/PriceCalculationRequest";
import PricingEngine from "@/lib/PricingEngine";
import ProductModel from "@/models/Product";
import VendorProduct from "@/models/VendorProduct";
import { getVendor } from "@/services/VendorService";
import Attribute from "@/utils/Attribute";
import DeliveryRule from "@/utils/DeliveryRule";
import PricingRule from "@/utils/PricingRule";
import Product from "@/utils/Product";
import QuantityPricing from "@/utils/QuantityPricing";

import { NextRequest, NextResponse } from "next/server";

// Calculate Product Price
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { productId, quantity, attributes, deliveryMethod, currentTime } =
      await req.json();
    console.log(productId, quantity, attributes, deliveryMethod, currentTime);
    if (!productId || !quantity) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const vendor = await getVendor(
      productId,
      attributes,
      deliveryMethod,
      currentTime
    );
    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found!" },
        { status: 404 }
      );
    }

    const vendorId = vendor._id;
    console.log(vendorId);
    const vendorProduct = await VendorProduct.findOne({
      product: productId,
      vendor: vendorId,
    })
      .populate("product")
      .populate("quantityPricing")
      .populate("pricingRules")
      .populate("deliverySlots");

    if (!vendorProduct) {
      return NextResponse.json(
        { message: "Product not found for this vendor" },
        { status: 404 }
      );
    }

    const productData = await ProductModel.findById(productId);
    if (!productData)
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );

    const product = new Product(
      productData.name,
      vendorProduct.pricingRules.map(
        (rule: { attribute: string; value: string; price: number }) =>
          new PricingRule(rule.attribute, rule.value, rule.price)
      ),
      vendorProduct.deliverySlots.map(
        (rule: { label: string; price: number }) =>
          new DeliveryRule(rule.label, rule.price)
      ),
      vendorProduct.quantityPricing.map(
        (qp: { quantity: number; price: number }) =>
          new QuantityPricing(qp.quantity, qp.price)
      )
    );

    const pricingEngine = new PricingEngine(product);
    const priceRequest = new PriceCalculationRequest(
      productData.name,
      quantity,
      attributes.map(
        (attr: { name: string; value: string }) =>
          new Attribute(attr.name, attr.value)
      ),
      deliveryMethod
    );

    const priceData = pricingEngine.calculatePrice(priceRequest);

    return NextResponse.json({
      productName: productData.name,
      quantity,
      ...priceData,
    });
  } catch (error: unknown) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error },
      { status: 500 }
    );
  }
}
