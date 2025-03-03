import { connectDB } from "@/lib/db";
import PriceCalculationRequest from "@/lib/PriceCalculationRequest";
import PricingEngine from "@/lib/PricingEngine";
import ProductModel from "@/models/Product";
import VendorProduct from "@/models/VendorProduct";
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
    const { productId, vendorId, quantity, attributes, deliveryMethod } = await req.json();

    if (!productId || !vendorId || !quantity) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const vendorProduct = await VendorProduct.findOne({ productId, vendorId }).populate(
      "productId"
    );

    if (!vendorProduct) {
      return NextResponse.json({ message: "Product not found for this vendor" }, { status: 404 });
    }

    const productData = await ProductModel.findById(productId);
    if (!productData) return NextResponse.json({ message: "Product not found" }, { status: 404 });

    const product = new Product(
      productData.name,
      productData.pricingRules.map(
        (rule: { attribute: string; value: string; price: number }) =>
          new PricingRule(rule.attribute, rule.value, rule.price)
      ),
      productData.deliveryRules.map(
        (rule: { method: string; price: number }) => new DeliveryRule(rule.method, rule.price)
      ),
      productData.quantityPricing.map(
        (qp: { minQty: number; price: number }) => new QuantityPricing(qp.minQty, qp.price)
      )
    );

    const pricingEngine = new PricingEngine(product);
    const priceRequest = new PriceCalculationRequest(
      productData.name,
      quantity,
      attributes.map(
        (attr: { name: string; value: string }) => new Attribute(attr.name, attr.value)
      ),
      deliveryMethod
    );

    const totalPrice = pricingEngine.calculatePrice(priceRequest);

    return NextResponse.json({ productName: productData.name, quantity, totalPrice });
  } catch (error: unknown) {
    console.error("❌ Error:", error);
    return NextResponse.json({ message: "Internal server error", error: error }, { status: 500 });
  }
}
