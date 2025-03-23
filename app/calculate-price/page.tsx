"use client";
import { Product } from "@/lib/api";
import { useEffect, useState } from "react";

export default function SimplifiedPriceCalculator() {
  const [productId, setProductId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(20);
  const [attributes, setAttributes] = useState([
    { name: "Paper", value: "Glossy" },
  ]);
  const [deliveryMethod, setDeliveryMethod] = useState("express");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`
      );

      if (!response.ok) throw new Error("Something went wrong!");
      const data = await response.json();
      console.log(data);
      setProducts(data);
    };
    fetchProducts();
  }, []);

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][field] = value;
    setAttributes(updatedAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: "", value: "" }]);
  };

  const deleteAttribute = (index) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const calculatePrice = async () => {
    if (!productId || !deliveryMethod || quantity <= 0) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const currentTime = new Date().toISOString();

      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity,
          attributes,
          deliveryMethod,
          currentTime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate price");
      }

      const data = await response.json();
      setResult(data);
      setError("");
    } catch (err) {
      setError("Error calculating price");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simplified Price Calculator</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>
      )}

      <div className="space-y-4">
        {/* Product ID */}
        <div>
          <label htmlFor="productId" className="block text-sm font-medium mb-1">
            Product ID
          </label>
          <select
            id="productId"
            className="w-full border p-2 rounded"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="" disabled>
              Select a product
            </option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium mb-1">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            min="1"
            placeholder="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(+e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Attributes */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">Attributes</label>
            <button
              type="button"
              onClick={addAttribute}
              className="bg-blue-500 text-white p-1 px-2 rounded text-sm"
            >
              Add Attribute
            </button>
          </div>

          {attributes.map((attr, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 border p-2 rounded"
                placeholder="Attribute name"
                value={attr.name}
                onChange={(e) =>
                  handleAttributeChange(index, "name", e.target.value)
                }
              />

              <input
                type="text"
                className="flex-1 border p-2 rounded"
                placeholder="Attribute value"
                value={attr.value}
                onChange={(e) =>
                  handleAttributeChange(index, "value", e.target.value)
                }
              />

              <button
                type="button"
                onClick={() => deleteAttribute(index)}
                className="bg-red-500 text-white p-2 rounded"
                aria-label="Delete attribute"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        {/* Delivery Method */}
        <div>
          <label htmlFor="delivery" className="block text-sm font-medium mb-1">
            Delivery Method
          </label>
          <input
            id="delivery"
            type="text"
            placeholder="Enter delivery method"
            value={deliveryMethod}
            onChange={(e) => setDeliveryMethod(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* Calculate Button */}
        <button
          type="button"
          onClick={calculatePrice}
          className="w-full bg-green-500 text-white p-2 rounded mt-4 disabled:bg-gray-300"
          disabled={isLoading}
        >
          {isLoading ? "Calculating..." : "Calculate Price"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Calculation Result</h2>
          <div className="text-lg font-bold mb-2">
            Total: £ {result?.totalPrice?.toFixed(2) ?? null}
          </div>
          <div>
            <h3 className="text-md font-medium mb-1">Price Breakdown:</h3>
            <pre className="bg-white p-2 rounded overflow-x-auto">
              {JSON.stringify(result.breakdown, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
