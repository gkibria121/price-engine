"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Product, Vendor, createProduct, updateProduct } from "@/lib/api";

interface ProductFormProps {
  product?: Product;
  vendors: Vendor[];
  onSuccess?: () => void;
  isEdit?: boolean;
}

export default function ProductForm({
  product,
  vendors,
  onSuccess,
  isEdit = false,
}: ProductFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const defaultValues: any = product || {
    name: "",
    pricingRules: [{ attribute: "", value: "", price: 0 }],
    deliveryRules: [{ method: "Standard", price: 0 }],
    quantityPricing: [{ minQty: 1, price: 0 }],
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

  const {
    fields: pricingFields,
    append: appendPricing,
    remove: removePricing,
  } = useFieldArray({ control, name: "pricingRules" });

  const {
    fields: deliveryFields,
    append: appendDelivery,
    remove: removeDelivery,
  } = useFieldArray({ control, name: "deliveryRules" });

  const {
    fields: quantityFields,
    append: appendQuantity,
    remove: removeQuantity,
  } = useFieldArray({ control, name: "quantityPricing" });

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    setError("");

    try {
      if (isEdit && product?._id) {
        await updateProduct(product._id, data);
      } else {
        // For new products, we need a vendorId
        const vendorId = data.vendorId;
        delete data.vendorId; // Remove vendorId from product data
        await createProduct(vendorId, data);
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Product Name</label>
            <input
              {...register("name", { required: "Product name is required" })}
              className="w-full border rounded p-2"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message?.toString()}</p>
            )}
          </div>

          {!isEdit && (
            <div>
              <label className="block mb-1">Vendor</label>
              <select
                {...register("vendorId", { required: "Vendor is required" })}
                className="w-full border rounded p-2"
              >
                <option value="">Select a vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
              {errors.vendorId && (
                <p className="text-red-500 text-sm mt-1">{errors.vendorId.message?.toString()}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pricing Rules */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Pricing Rules</h2>
          <button
            type="button"
            onClick={() => appendPricing({ attribute: "", value: "", price: 0 })}
            className="text-blue-600 text-sm"
          >
            + Add Rule
          </button>
        </div>

        {pricingFields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-start border-b pb-4">
            <div className="flex-1">
              <label className="block mb-1 text-sm">Attribute</label>
              <input
                {...register(`pricingRules.${index}.attribute` as const, { required: "Required" })}
                className="w-full border rounded p-2"
                placeholder="e.g. color, size"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm">Value</label>
              <input
                {...register(`pricingRules.${index}.value` as const, { required: "Required" })}
                className="w-full border rounded p-2"
                placeholder="e.g. red, large"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm">Price Adjustment</label>
              <input
                type="number"
                step="0.01"
                {...register(`pricingRules.${index}.price` as const, {
                  required: "Required",
                  valueAsNumber: true,
                })}
                className="w-full border rounded p-2"
              />
            </div>
            <button
              type="button"
              onClick={() => removePricing(index)}
              className="text-red-500 mt-6"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Delivery Rules */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Delivery Options</h2>
          <button
            type="button"
            onClick={() => appendDelivery({ method: "", price: 0 })}
            className="text-blue-600 text-sm"
          >
            + Add Option
          </button>
        </div>

        {deliveryFields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-start border-b pb-4">
            <div className="flex-1">
              <label className="block mb-1 text-sm">Delivery Method</label>
              <input
                {...register(`deliveryRules.${index}.method` as const, { required: "Required" })}
                className="w-full border rounded p-2"
                placeholder="e.g. Standard, Express"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm">Price</label>
              <input
                type="number"
                step="0.01"
                {...register(`deliveryRules.${index}.price` as const, {
                  required: "Required",
                  valueAsNumber: true,
                })}
                className="w-full border rounded p-2"
              />
            </div>
            <button
              type="button"
              onClick={() => removeDelivery(index)}
              className="text-red-500 mt-6"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Quantity Pricing */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Quantity Pricing</h2>
          <button
            type="button"
            onClick={() => appendQuantity({ minQty: 1, price: 0 })}
            className="text-blue-600 text-sm"
          >
            + Add Tier
          </button>
        </div>

        {quantityFields.map((field, index) => (
          <div key={field.id} className="flex gap-4 items-start border-b pb-4">
            <div className="flex-1">
              <label className="block mb-1 text-sm">Quantity</label>
              <input
                type="number"
                {...register(`quantityPricing.${index}.minQty` as const, {
                  required: "Required",
                  valueAsNumber: true,
                  min: { value: 1, message: "Must be at least 1" },
                })}
                className="w-full border rounded p-2"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 text-sm">Price Per Unit</label>
              <input
                type="number"
                step="0.01"
                {...register(`quantityPricing.${index}.price` as const, {
                  required: "Required",
                  valueAsNumber: true,
                })}
                className="w-full border rounded p-2"
              />
            </div>
            <button
              type="button"
              onClick={() => removeQuantity(index)}
              className="text-red-500 mt-6"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => onSuccess && onSuccess()}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
