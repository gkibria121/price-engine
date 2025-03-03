"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getProducts, Product } from "@/lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        console.log(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load products");
        setLoading(false);
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div className="text-center p-8">Loading products...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="mb-4">No products found.</p>
          <Link href="/products/add" className="text-blue-600 hover:underline">
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="border rounded-lg p-6 hover:shadow-lg transition  ">
              <div className="flex  justify-between">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <Link
                  href={`/products/edit/${product._id}`}
                  key={product._id}
                  className="bg-blue-600 px-2 py-1 rounded-md text-white"
                >
                  Edit
                </Link>
              </div>
              <div className="text-sm text-gray-600">
                <p>{product.pricingRules.length} pricing rules</p>
                <p>{product.deliveryRules.length} delivery options</p>
                <p>{product.quantityPricing.length} quantity tiers</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
