import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  name: { type: String, required: true },
  pricingRules: [{ attribute: String, value: String, price: Number }],
  deliveryRules: [{ method: String, price: Number }],
  quantityPricing: [{ minQty: Number, price: Number }],
});

export default models.Product || model("Product", ProductSchema);
