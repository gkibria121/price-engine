import mongoose from "mongoose";
import VendorProduct from "@/models/VendorProduct";

export async function getVendor(
  productId: string,
  attributes: { name: string; value: string }[],
  deliveryMethod: string,
  currentTime: mongoose.Schema.Types.Date
) {
  console.log(deliveryMethod, currentTime);
  try {
    // Create match conditions for each attribute-value pair
    const attributeConditions = attributes.map((attr) => ({
      attribute: attr.name,
      value: attr.value,
    }));
    // Ensure currentTime is a Date object for proper comparison
    const currentTimeDate =
      typeof currentTime === "string" ? new Date(currentTime) : currentTime;
    const pipeline = [
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $lookup: {
          from: "pricingrules",
          localField: "pricingRules",
          foreignField: "_id",
          as: "pricingRulesData",
        },
      },
      {
        $lookup: {
          from: "deliveryslots",
          localField: "deliverySlots",
          foreignField: "_id",
          as: "deliverySlotsData",
        },
      },
      {
        $lookup: {
          from: "vendors",
          localField: "vendor",
          foreignField: "_id",
          as: "vendorData",
        },
      },
      {
        $unwind: "$vendorData",
      },
      {
        $match: {
          $and: [
            ...attributeConditions.map((condition) => ({
              pricingRulesData: {
                $elemMatch: condition,
              },
            })),
            {
              deliverySlotsData: {
                $elemMatch: {
                  label: deliveryMethod,
                  cutoffTime: { $gt: currentTimeDate },
                },
              },
            },
          ],
        },
      },
    ];

    const vendors = await VendorProduct.aggregate([
      ...pipeline,
      {
        $sort: {
          "vendorData.rating": -1,
        },
      },
    ]);

    return vendors.length > 0 ? vendors[0].vendorData : null;
  } catch (error) {
    console.error("Error fetching vendor:", error);
    return null;
  }
}
