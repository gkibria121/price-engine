import { Schema, model, models, Document, Model } from "mongoose";
export interface IDeliverySlot extends Document {
  label: string;
  price: number;
  deliveryTimeStartDate: number;
  deliveryTimeStartTime: string;
  deliveryTimeEndDate: number;
  deliveryTimeEndTime: string;
  cutoffTime: string;
}
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
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{1,2}:\d{2}$/.test(v); // Ensures format is "HH:MM"
      },
      message: (props) => `${props.value} is not a valid time format (HH:MM)!`,
    },
  },
  deliveryTimeEndDate: {
    type: Number,
    min: [0, "Delivery end date must be a valid future date"],
    required: [true, "Delivery start date is required"],
  },
  deliveryTimeEndTime: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{1,2}:\d{2}$/.test(v); // Ensures format is "HH:MM"
      },
      message: (props) => `${props.value} is not a valid time format (HH:MM)!`,
    },
  },

  cutoffTime: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{1,2}:\d{2}$/.test(v); // Ensures format is "HH:MM"
      },
      message: (props) => `${props.value} is not a valid time format (HH:MM)!`,
    },
  },
});

export default (models.DeliverySlot as Model<IDeliverySlot>) ||
  model<IDeliverySlot>("DeliverySlot", DeliverySlotSchema);
