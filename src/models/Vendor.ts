import { Schema, model, models } from "mongoose";

const VendorSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
});

export default models.Vendor || model("Vendor", VendorSchema);
