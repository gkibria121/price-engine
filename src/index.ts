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

// Express App
const app = express();
const port = 3000;

app.use(express.json());

// 📌 Add a Product (Save to MongoDB)
app.post("/api/products", async (req: Request, res: Response) => {
  try {
    const newProduct = new ProductModel(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
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
    const { productName, quantity, attributes, deliveryMethod } = req.body;

    const productData = await ProductModel.findOne({ name: productName }).sort({ _id: -1 });

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

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
