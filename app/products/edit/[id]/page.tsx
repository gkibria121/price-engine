"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { Product } from "@/lib/api";
import ProductFormJson from "@/components/ProductFormJson";

export default function AddProductPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = useParams();
  const [formType, setFormType] = useState<"form" | "json">("form");
  const [product, setProduct] = useState<Product | undefined>();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`
        );
        if (!response.ok) throw new Error("Product not found!");
        const data = await response.json();
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load product");
        setLoading(false);
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSuccess = () => {
    router.push("/products");
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
  if (!product)
    return (
      <div className="text-center p-8 text-red-500">Product not found</div>
    );
  return (
    <div>
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
        <div className="">
          <select
            name="form_type"
            id=""
            value={formType}
            onChange={(e) => setFormType(e.target.value as "form" | "json")}
            className="border border-slate-600 rounded-md px-2 py-1 "
          >
            <option value="form">Form</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>
      {formType === "form" && (
        <ProductForm
          onSuccess={handleSuccess}
          isEdit={true}
          product={product}
        />
      )}
      {formType === "json" && (
        <>
          <ProductFormJson onSuccess={handleSuccess} vendorProduct={product} />
        </>
      )}
    </div>
  );
}
