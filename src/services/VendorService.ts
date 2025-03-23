import mongoose from "mongoose";
import VendorProduct from "@/models/VendorProduct";

export async function getVendor(
  productId: mongoose.Schema.Types.ObjectId,
  attributes: { name: string; value: string }[],
  deliveryMethod: string,
  currentTime: mongoose.Schema.Types.Date
) {
  console.log(productId, attributes, deliveryMethod, currentTime);

  try {
    const pipeline = [
      {
        $match: {
          product: new mongoose.Types.ObjectId("67dfa64d07e01cd68052c092"),
        },
      },
      {
        $lookup: {
          from: "pricingrules",
          localField: "pricingRules", // VendorProduct.pricingRules array of ObjectIds
          foreignField: "_id", // PricingRule._id
          as: "pricingRulesData", // The result will be stored in this field
        },
      },
      {
        $match: {
          pricingRulesData: {
            $elemMatch: {
              attribute: attributes[0]?.name,
              value: attributes[0]?.value,
            },
          },
        },
      },
    ];

    const vendor = await VendorProduct.aggregate(pipeline);
    console.log(vendor);
    return vendor;
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return null;
  }
}
