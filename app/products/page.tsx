"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import ProductSection from "@/components/ProductSection";
import VendorProductSection from "@/components/VendorProductSection";
import { Product, VendorProduct } from "@/lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, vendorProductsResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendor-products`),
        ]);

        if (!productsResponse.ok || !vendorProductsResponse.ok) {
          throw new Error("Something went wrong!");
        }

        const productsData = await productsResponse.json();
        const vendorProductsData = await vendorProductsResponse.json();

        setProducts(productsData);
        setVendorProducts(vendorProductsData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load data");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  const handleProductUploadFromCSV = async (products: Product[]) => {
    const toastId = toast.loading("Uploading products..");

    try {
      await axios.post("/api/products/bulk-upload", { products });

      toast.dismiss(toastId);
      toast.success("Products uploaded!", { duration: 1000 });
      setTimeout(() => window.location.reload(), 2000);
    } catch (e) {
      console.log(e);
      if (e instanceof axios.AxiosError) {
        toast.error(e.response?.data.message);
      }
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleVendorProductUploadFromCSV = async ({
    pricingRules,
    deliverySlots,
    quantityPricings,
  }) => {
    let toastId;
    try {
      toastId = toast.loading("Vendor Products Uploading..");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/vendor-products/bulk-upload`,
        {
          pricingRules,
          deliverySlots,
          quantityPricings,
        }
      );
      toast.success("Successfully vendor products uploaded!");
      toast.remove(toastId);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (e: unknown) {
      console.log(e);
      toast.remove(toastId);
      toast.error("Something went wrong!");
    }

    // Implement vendor product upload logic here
  };

  if (loading)
    return <div className="text-center p-8">Loading products...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div>
      <Toaster />

      <ProductSection
        products={products}
        onCSVUpload={handleProductUploadFromCSV}
      />

      <VendorProductSection
        vendorProducts={vendorProducts}
        onCSVUpload={handleVendorProductUploadFromCSV}
      />
    </div>
  );
}
