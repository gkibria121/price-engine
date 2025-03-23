import { updateProduct, VendorProduct } from "@/lib/api";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

function ProductFormJson({
  vendorProduct,
  onSuccess,
}: {
  vendorProduct: VendorProduct;
  onSuccess: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [jsonValue, setJsonValue] = useState(
    JSON.stringify(vendorProduct, null, 2)
  );

  const { handleSubmit } = useForm({ defaultValues: vendorProduct });
  if (!vendorProduct) return <div>No product found!</div>;
  const handleUpdate = () => {
    try {
      // Ensure trimmed JSON is valid before parsing
      const updatedProduct = JSON.parse(jsonValue.trim());
      console.log("Updated Product:", updatedProduct);

      // Reset error on success
      setError("");
    } catch (err) {
      setError("Invalid JSON format. Please check your input.");
      console.error("JSON Parse Error:", err);
    }
  };
  const onSubmit = async () => {
    try {
      setSubmitting(true);
      await updateProduct(
        vendorProduct._id as string,
        JSON.parse(jsonValue.trim())
      );
      if (onSuccess) onSuccess();
    } catch (e) {
      console.log(e);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <textarea
        className="border border-slate-500 p-4 w-full"
        rows={28}
        value={jsonValue}
        onChange={(e) => setJsonValue(e.target.value)}
      ></textarea>

      {error && <p className="text-red-500">{error}</p>}

      <button
        onClick={handleUpdate}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={submitting}
      >
        Update
      </button>
    </form>
  );
}

export default ProductFormJson;
