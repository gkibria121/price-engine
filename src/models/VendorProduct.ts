import { Schema, model, models } from "mongoose";

const VendorProductSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  pricingRules: [{ attribute: String, value: String, price: Number }],
  deliveryRules: [{ method: String, price: Number }],
  quantityPricing: [{ minQty: Number, price: Number }],
});

export default models.VendorProduct ||
  model("VendorProduct", VendorProductSchema);
