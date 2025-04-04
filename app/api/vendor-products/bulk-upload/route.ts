import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Vendor from "@/models/Vendor";
import VendorProduct from "@/models/VendorProduct";
import PricingRuleModel from "@/models/PriceRule";
import DeliverySlotModel from "@/models/DeliverySlot";
import QuantityPricingModel from "@/models/QuantityPricing";
import { NextRequest, NextResponse } from "next/server";
type ProductNameWithVendorMail = { product_name: string; vendor_email: string };

// Add Product and Associate with Vendor
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { pricingRules, deliverySlots, quantityPricings } = await req.json();

    const vendorProductIdentifiers = []
      .concat(pricingRules, deliverySlots, quantityPricings)
      .map((id: ProductNameWithVendorMail) => ({
        product_name: id.product_name,
        vendor_email: id.vendor_email,
      }))
      .reduce(
        (acc: ProductNameWithVendorMail[], curr: ProductNameWithVendorMail) => {
          if (
            !acc.some(
              (el) =>
                el.vendor_email === curr.vendor_email &&
                el.product_name === curr.product_name
            )
          ) {
            acc.push(curr);
          }
          return acc;
        },
        []
      );

    const results = [];

    // Process each vendor product one by one to handle nested async operations
    for (const id of vendorProductIdentifiers) {
      const product = await Product.findOne({ name: id.product_name });
      const vendor = await Vendor.findOne({ email: id.vendor_email });

      // Filter the rules for this product and vendor
      const productPricingRules = pricingRules.filter(
        (rule) =>
          rule.product_name === id.product_name &&
          id.vendor_email === rule.vendor_email
      );

      const productDeliverySlots = deliverySlots.filter(
        (slot) =>
          slot.product_name === id.product_name &&
          id.vendor_email === slot.vendor_email
      );

      const productQuantityPricings = quantityPricings.filter(
        (pricing) =>
          pricing.product_name === id.product_name &&
          id.vendor_email === pricing.vendor_email
      );

      // Create related documents and get their _ids
      const pricingRuleIds = await Promise.all(
        productPricingRules.map((rule) => PricingRuleModel.create(rule))
      );

      const deliverySlotIds = await Promise.all(
        productDeliverySlots.map((slot) => DeliverySlotModel.create(slot))
      );

      const quantityPricingIds = await Promise.all(
        productQuantityPricings.map((pricing) =>
          QuantityPricingModel.create(pricing)
        )
      );

      // Create the vendor product with references
      const vendorProduct = await VendorProduct.create({
        product: product._id,
        vendor: vendor._id,
        pricingRules: pricingRuleIds.map((doc) => doc._id),
        deliverySlots: deliverySlotIds.map((doc) => doc._id),
        quantityPricings: quantityPricingIds.map((doc) => doc._id),
      });

      results.push(vendorProduct);
    }

    return NextResponse.json({
      results,
    });
  } catch (e: unknown) {
    console.log(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
