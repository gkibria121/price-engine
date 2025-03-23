import { Schema, model, models } from "mongoose";

const DeliverySlotSchema = new Schema({
  label: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  deliveryTimeStartDate: {
    type: Number,
    min: [0, "Delivery start date must be a valid future date"],
    required: [true, "Delivery start date is required"],
  },
  deliveryTimeStartTime: {
    type: Schema.Types.Date,
    required: true,
  },
  deliveryTimeEndDate: {
    type: Number,
    min: [0, "Delivery end date must be a valid future date"],
    required: [true, "Delivery start date is required"],
  },
  deliveryTimeEndTime: {
    type: Schema.Types.Date,
    required: true,
  },

  cutoffTime: {
    type: Schema.Types.Date,
    required: true,
  },
});

export default models.DeliverySlot || model("DeliverySlot", DeliverySlotSchema);
