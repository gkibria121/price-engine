"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import VendorProductForm from "@/components/VendorProductForm";
import { Vendor, getVendors } from "@/lib/api";
import Product from "@/utils/Product";

export default function AddProductPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const data = await getVendors();
        setVendors(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load vendors");
        setLoading(false);
        console.error(err);
      }
    };

    fetchVendors();
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const resposne = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`
        );
        if (!resposne.ok) throw new Error("Fail to fetch products");
        const data = await resposne.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load vendors");
        setLoading(false);
        console.error(err);
      }
    };

    fetchProducts();
  }, []);
  const handleSuccess = () => {
    router.push("/products");
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  if (vendors.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Add New Vendor Product</h1>
        <p className="mb-4">
          You need to create a vendor before adding products.
        </p>
        <button
          onClick={() => router.push("/vendors/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create a Vendor First
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add New Vendor Product</h1>
      <VendorProductForm
        vendors={vendors}
        products={products}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
