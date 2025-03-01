import { NextRequest, NextResponse } from "next/server";
import dotenv from "dotenv";
import ProductModel from "@/models/Product";
import VendorModel from "@/models/Vendor";
import VendorProductModel from "@/models/VendorProduct";
import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@lib/db";
dotenv.config();
type ResponseData = {
  message: string;
};
const mongoUri = process.env.MONGO_URI as string;
export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  console.log("you where here");
  res.status(200).json({ message: "Hello from Next.js!" });
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

// Get All Products with Vendors
export async function GET() {
  try {
    await connectDB();

    // Retrieve product associations and populate vendor details
    const vendorProducts = await VendorProductModel.find()
      .populate("vendorId")
      .populate("productId");

    const products = vendorProducts.map((vp) => {
      return {
        ...vp.productId.toObject(),
        vendor: vp.vendorId,
      };
    });

    return NextResponse.json(products);
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
