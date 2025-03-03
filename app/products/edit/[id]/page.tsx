"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { Product, getProductById } from "@/lib/api";

export default function AddProductPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const { id } = useParams();
  const [product, setProduct] = useState<{ product: Product } | undefined>();
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id as string);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load product");
        setLoading(false);
        console.error(err);
      }
    };
    fetchProduct();
  }, []);

  const handleSuccess = () => {
    router.push("/products");
  };

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Add New Product</h1>
      <ProductForm
        vendors={[]}
        onSuccess={handleSuccess}
        isEdit={true}
        product={product?.product}
      />
    </div>
  );
}
