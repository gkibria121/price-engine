"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { VendorProduct } from "@/lib/api";
import ProductFormJson from "@/components/ProductFormJson";
import VendorProductForm from "@/components/VendorProductForm";

export default function AddProductPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = useParams();
  const [formType, setFormType] = useState<"form" | "json">("form");
  const [vendorProduct, setVendorProduct] = useState<
    VendorProduct | undefined
  >();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/vendor-products/${id}`
        );
        if (!response.ok) throw new Error("Product not found!");
        const data = await response.json();
        setVendorProduct(data);
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
  if (!vendorProduct)
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
        <VendorProductForm
          vendors={[]}
          products={[]}
          onSuccess={handleSuccess}
          isEdit={true}
          vendorProduct={vendorProduct}
        />
      )}
      {formType === "json" && (
        <>
          <ProductFormJson
            onSuccess={handleSuccess}
            vendorProduct={vendorProduct}
          />
        </>
      )}
    </div>
  );
}
