import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema({
  name: { type: String, required: true },
});

export default models.Product || model("Product", ProductSchema);
