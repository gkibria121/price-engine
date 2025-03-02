import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dotenv from "dotenv";
import ProductModel from "@/models/Product";
import VendorModel from "@/models/Vendor";
import VendorProductModel from "@/models/VendorProduct";
import PricingEngine from "@/lib/PricingEngine";
import PriceCalculationRequest from "@/lib/PriceCalculationRequest";
import Attribute from "@/utils/Attribute";
import DeliveryRule from "@/utils/DeliveryRule";
import PricingRule from "@/utils/PricingRule";
import QuantityPricing from "@/utils/QuantityPricing";
import Product from "@/utils/Product";
import { NextApiRequest, NextApiResponse } from "next";

dotenv.config();
type ResponseData = {
  message: string;
};
const mongoUri = process.env.MONGO_URI as string;
export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  console.log("you where here");
  res.status(200).json({ message: "Hello from Next.js!" });
}
// Ensure MongoDB connection
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(`${mongoUri}/pricing-engine`);
    console.log("✅ Connected to MongoDB");
  }
}

// Add Product and Associate with Vendor
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { vendorId, ...productData } = await req.json();

    if (!vendorId) return NextResponse.json({ message: "Vendor ID is required" }, { status: 400 });

    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) return NextResponse.json({ message: "Vendor not found" }, { status: 404 });

    const newProduct = new ProductModel(productData);
    await newProduct.save();

    const newAssociation = new VendorProductModel({ vendorId, productId: newProduct._id });
    await newAssociation.save();

    return NextResponse.json({ product: newProduct, association: newAssociation }, { status: 201 });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Get All Products
export async function GET() {
  try {
    await connectDB();
    const products = await ProductModel.find();
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Calculate Product Price
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const { productId, vendorId, quantity, attributes, deliveryMethod } = await req.json();

    if (!productId || !vendorId || !quantity) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const vendorProduct = await VendorProductModel.findOne({ productId, vendorId }).populate(
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
        (rule: any) => new PricingRule(rule.attribute, rule.value, rule.price)
      ),
      productData.deliveryRules.map((rule: any) => new DeliveryRule(rule.method, rule.price)),
      productData.quantityPricing.map((qp: any) => new QuantityPricing(qp.minQty, qp.price))
    );

    const pricingEngine = new PricingEngine(product);
    const priceRequest = new PriceCalculationRequest(
      productData.name,
      quantity,
      attributes.map((attr: any) => new Attribute(attr.name, attr.value)),
      deliveryMethod
    );

    const totalPrice = pricingEngine.calculatePrice(priceRequest);

    return NextResponse.json({ productName: productData.name, quantity, totalPrice });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

// Clear Database
export async function DELETE() {
  try {
    await connectDB();
    await VendorModel.deleteMany({});
    await ProductModel.deleteMany({});
    await VendorProductModel.deleteMany({});

    return NextResponse.json({ message: "Database cleared successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
