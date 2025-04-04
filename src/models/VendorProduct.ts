import { Schema, model, models } from "mongoose";

const VendorProductSchema = new Schema({
  vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  pricingRules: [
    { type: Schema.Types.ObjectId, ref: "PricingRule", required: true },
  ],
  deliverySlots: [
    { type: Schema.Types.ObjectId, ref: "DeliverySlot", required: true },
  ],
  quantityPricings: [
    { type: Schema.Types.ObjectId, ref: "QuantityPricing", required: true },
  ],
});

export default models.VendorProduct ||
  model("VendorProduct", VendorProductSchema);
