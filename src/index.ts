import express, { Request, Response, NextFunction } from "express";
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

// Global Error Handler
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Error:", err);
  res.status(500).json({ message: "Internal server error", error: err.message });
};

// 📌 Add a Product and Associate with Vendor
app.post("/api/products", async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const { vendorId, ...productData } = req.body;
    if (!vendorId) return res.status(400).json({ message: "Vendor ID is required" });

    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const newProduct = new ProductModel(productData);
    await newProduct.save();

    const newAssociation = new VendorProductModel({ vendorId, productId: newProduct._id });
    await newAssociation.save();

    res.status(201).json({ product: newProduct, association: newAssociation });
  } catch (error) {
    next(error);
  }
});

// 📌 Get All Products
app.get("/api/products", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await ProductModel.find();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// 📌 Get Product Info and Calculate Price
app.post(
  "/api/calculate-price",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { productName, productId, vendorId, quantity, attributes, deliveryMethod } = req.body;

      if (!productId || !vendorId || !quantity) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const vendorProduct = await VendorProductModel.findOne({ productId, vendorId }).populate(
        "productId"
      );
      if (!vendorProduct)
        return res.status(404).json({ message: "Product not found for this vendor" });

      const productData = await ProductModel.findById(productId);
      if (!productData) return res.status(404).json({ message: "Product not found" });

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
      res.json({ productName: productData.name, quantity, totalPrice });
    } catch (error) {
      next(error);
    }
  }
);

// 📌 Update a Product (PUT)
app.put(
  "/api/products/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { id } = req.params;
      const updatedProductData = req.body;

      const updatedProduct = await ProductModel.findByIdAndUpdate(id, updatedProductData, {
        new: true,
      });
      if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

      res.json(updatedProduct);
    } catch (error) {
      next(error);
    }
  }
);

// 📌 Add a Vendor
app.post("/api/vendors", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newVendor = new VendorModel(req.body);
    await newVendor.save();
    res.status(201).json(newVendor);
  } catch (error) {
    next(error);
  }
});

// 📌 Clear Database
app.get("/api/clear", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await VendorModel.deleteMany({});
    await ProductModel.deleteMany({});
    await VendorProductModel.deleteMany({});
    res.status(200).json({ message: "Database cleared successfully" });
  } catch (error) {
    next(error);
  }
});

// Use the Global Error Handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
