import { Schema, model, models } from "mongoose";

const PricingRuleSchema = new Schema({
  attribute: String,
  value: String,
  price: Number,
});

export default models.PricingRule || model("PricingRule", PricingRuleSchema);
