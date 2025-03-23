"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Product, createProduct, updateProduct } from "@/lib/api";

interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  isEdit?: boolean;
}

export default function ProductForm({
  product,
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
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues });

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
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>
      )}

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
              <p className="text-red-500 text-sm mt-1">
                {errors.name.message?.toString()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-start gap-4">
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
          {submitting
            ? "Saving..."
            : isEdit
            ? "Update Product"
            : "Create Product"}
        </button>
      </div>
    </form>
  );
}
