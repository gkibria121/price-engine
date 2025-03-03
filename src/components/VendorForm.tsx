"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { createVendor, Vendor } from "@/lib/api";

interface VendorFormProps {
  onSuccess?: () => void;
}

export default function VendorForm({ onSuccess }: VendorFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Vendor>({
    defaultValues: {
      name: "",
      email: "",
      address: "",
    },
  });

  const onSubmit = async (data: Vendor) => {
    setSubmitting(true);
    setError("");

    try {
      await createVendor(data);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError("Failed to create vendor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}

      <div>
        <label className="block mb-1">Vendor Name</label>
        <input
          {...register("name", { required: "Vendor name is required" })}
          className="w-full border rounded p-2"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block mb-1">Email</label>
        <input
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Please enter a valid email",
            },
          })}
          className="w-full border rounded p-2"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block mb-1">Address</label>
        <textarea
          {...register("address", { required: "Address is required" })}
          className="w-full border rounded p-2 h-24"
        />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
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
          {submitting ? "Creating..." : "Create Vendor"}
        </button>
      </div>
    </form>
  );
}
