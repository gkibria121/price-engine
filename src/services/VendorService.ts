import mongoose from "mongoose";
import VendorProduct from "@/models/VendorProduct";
import { IDeliverySlot } from "@/models/DeliverySlot";

export async function getVendor(
  productId: string,
  attributes: { name: string; value: string }[],
  deliveryMethod: IDeliverySlot,
  currentTime: Date
) {
  try {
    // Create match conditions for each attribute-value pair
    const attributeConditions = attributes.map((attr) => ({
      attribute: attr.name,
      value: attr.value,
    }));
    // Ensure currentTime is a Date object for proper comparison
    const currentTimeDate =
      typeof currentTime === "string" ? new Date(currentTime) : currentTime;

    // Get current time components for time comparison
    const currentHour = currentTimeDate.getHours();
    const currentMinute = currentTimeDate.getMinutes();
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
        $addFields: {
          deliverySlotsWithTime: {
            $map: {
              input: "$deliverySlotsData",
              as: "slot",
              in: {
                $mergeObjects: [
                  "$$slot",
                  {
                    cutoffTimeHour: {
                      $toInt: { $substr: ["$$slot.cutoffTime", 0, 2] },
                    },
                    cutoffTimeMinute: {
                      $toInt: { $substr: ["$$slot.cutoffTime", 3, 2] },
                    },
                  },
                ],
              },
            },
          },
        },
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
              deliverySlotsWithTime: {
                $elemMatch: {
                  // label: deliveryMethod,
                  deliveryTimeStartDate: deliveryMethod.deliveryTimeStartDate,
                  deliveryTimeEndDate: deliveryMethod.deliveryTimeEndDate,
                  deliveryTimeEndTime: deliveryMethod.deliveryTimeEndTime,
                  $or: [
                    { cutoffTimeHour: { $gt: currentHour } },
                    {
                      $and: [
                        { cutoffTimeHour: currentHour },
                        { cutoffTimeMinute: { $gt: currentMinute } },
                      ],
                    },
                  ],
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

export async function getMatchedDeliverySlot(
  vendor_id: mongoose.Schema.Types.ObjectId,
  product_id: mongoose.Schema.Types.ObjectId,
  deliveryMethod: IDeliverySlot
): Promise<any> {
  try {
    // Ensure vendor has delivery slots

    // Lookup delivery slots for the vendor
    const populatedVendor = await mongoose
      .model("VendorProduct")
      .findOne({
        vendor: vendor_id,
        product: product_id,
      })
      .populate("deliverySlots");

    if (!populatedVendor || !populatedVendor.deliverySlots) {
      console.log("Failed to populate vendor delivery slots");
      return null;
    }

    // Find matching delivery slot based on criteria
    const matchedSlot = populatedVendor.deliverySlots.find(
      (slot) =>
        slot.deliveryTimeStartDate.toString() ===
          deliveryMethod.deliveryTimeStartDate.toString() &&
        slot.deliveryTimeEndDate.toString() ===
          deliveryMethod.deliveryTimeEndDate.toString() &&
        slot.deliveryTimeEndTime === deliveryMethod.deliveryTimeEndTime
    );

    return matchedSlot || null;
  } catch (error) {
    console.error("Error finding matched delivery slot:", error);
    return null;
  }
}
