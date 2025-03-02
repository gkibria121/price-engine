import { Schema, model, models } from "mongoose";

const VendorProductSchema = new Schema({
  vendorId: { type: Schema.Types.ObjectId, ref: "Vendor", required: true },
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
});

export default models.VendorProduct || model("VendorProduct", VendorProductSchema);
