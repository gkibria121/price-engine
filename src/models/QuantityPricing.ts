import { Schema, model, models } from "mongoose";

const QuantityPricingSchema = new Schema({
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

export default models.QuantityPricing ||
  model("QuantityPricings", QuantityPricingSchema);
