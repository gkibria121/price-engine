import express, { Request, Response } from "express";
import mongoose from "mongoose";
import Attribute from "./Attribute";
import DeliveryRule from "./DeliveryRule";
import PriceCalculationRequest from "./PriceCalculationRequest";
import PricingEngine from "./PricingEngine";
import PricingRule from "./PricingRule";
import Product from "./Product";
import QuantityPricing from "./QuantityPricing";

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/pricing-engine")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// MongoDB Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricingRules: [{ attribute: String, value: String, price: Number }],
  deliveryRules: [{ method: String, price: Number }],
  quantityPricing: [{ minQty: Number, price: Number }],
});

const ProductModel = mongoose.model("Product", productSchema);

// MongoDB Vendor Schema
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
});

const VendorModel = mongoose.model("Vendor", vendorSchema);

// MongoDB VendorProduct Schema (Relationship Table)
const vendorProductSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
});

const VendorProductModel = mongoose.model("VendorProduct", vendorProductSchema);

// Express App
const app = express();
const port = 3000;

app.use(express.json());

// 📌 Add a Product and Associate with Vendor
app.post("/api/products", async (req: Request, res: Response): Promise<any> => {
  try {
    const { vendorId, ...productData } = req.body;

    // Check if vendorId is provided
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    // Create the new product
    const newProduct = new ProductModel(productData);
    await newProduct.save();

    // Associate product with vendor
    const newAssociation = new VendorProductModel({
      vendorId,
      productId: newProduct._id,
    });

    await newAssociation.save();

    res.status(201).json({ product: newProduct, association: newAssociation });
  } catch (error) {
    res.status(500).json({ message: "Error saving product", error });
  }
});

// 📌 Get All Products
app.get("/api/products", async (req: Request, res: Response) => {
  try {
    const products = await ProductModel.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
});

// 📌 Get Product Info and Calculate Price
app.post("/api/calculate-price", async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, productId, vendorId, quantity, attributes, deliveryMethod } = req.body;

    const vendorProduct = await VendorProductModel.findOne({ productId, vendorId }).populate(
      "productId"
    );

    if (!vendorProduct) {
      res.status(404).json({ message: "Product not found for this vendor" });
      return;
    }

    const productData = await ProductModel.findOne({ _id: vendorProduct.productId }).sort({
      _id: -1,
    });
    if (!productData) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Initialize product using your custom class
    const product = new Product(
      productData.name,
      productData.pricingRules.map(
        (rule: any) => new PricingRule(rule.attribute, rule.value, rule.price)
      ),
      productData.deliveryRules.map((rule: any) => new DeliveryRule(rule.method, rule.price)),
      productData.quantityPricing.map((qp: any) => new QuantityPricing(qp.minQty, qp.price))
    );

    const pricingEngine = new PricingEngine(product);

    // Create the price calculation request
    const priceRequest = new PriceCalculationRequest(
      productName,
      quantity,
      attributes.map((attr: any) => new Attribute(attr.name, attr.value)),
      deliveryMethod
    );

    // Calculate the price
    const totalPrice = pricingEngine.calculatePrice(priceRequest);

    res.json({ productName, quantity, totalPrice });
  } catch (error) {
    res.status(500).json({ message: "Error calculating price", error });
  }
});

// 📌 Update a Product (PUT)
app.put("/api/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get product ID from the URL parameter
    const updatedProductData = req.body; // Get updated product data from the request body

    // Find the product by ID and update it
    const updatedProduct = await ProductModel.findByIdAndUpdate(id, updatedProductData, {
      new: true, // Return the updated product
    });

    if (!updatedProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Return the updated product
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
});

// 📌 Add a Vendor (Save to MongoDB)
app.post("/api/vendors", async (req: Request, res: Response) => {
  try {
    const newVendor = new VendorModel(req.body);
    await newVendor.save();
    res.status(201).json(newVendor);
  } catch (error) {
    res.status(500).json({ message: "Error saving vendor", error });
  }
});
// 📌clear database
app.get("/api/clear", async (req: Request, res: Response) => {
  try {
    await VendorModel.deleteMany({});
    await ProductModel.deleteMany({});
    await VendorProductModel.deleteMany({});
    res.status(200).json({
      message: "Database cleared successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Error clearing database", error });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
