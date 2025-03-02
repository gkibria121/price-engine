// View Component for Price Calculation
"use client";
import Attribute from "@/utils/Attribute";
import { useState } from "react";

interface PriceCalculationResult {
  total: number;
  breakdown: Record<string, any>;
}

export default function PriceCalculator() {
  const [productId, setProductId] = useState<string>("");
  const [vendorId, setVendorId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [attributes, setAttributes] = useState<Attribute[]>([{ name: "", selectedValue: "" }]);
  const [deliveryMethod, setDeliveryMethod] = useState<string>("normal");
  const [result, setResult] = useState<PriceCalculationResult | null>(null);

  const handleAttributeChange = (index: number, field: keyof Attribute, value: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][field] = value;
    setAttributes(updatedAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: "", selectedValue: "" }]);
  };

  const deleteAttribute = (index: number) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttributes);
  };

  const calculatePrice = async () => {
    const response = await fetch("/api/calculate-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, vendorId, quantity, attributes, deliveryMethod }),
    });

    const data: PriceCalculationResult = await response.json();
    setResult(data);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Price Calculator</h1>

      <input
        type="text"
        placeholder="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="border p-2 mb-2"
      />

      <input
        type="text"
        placeholder="Vendor ID"
        value={vendorId}
        onChange={(e) => setVendorId(e.target.value)}
        className="border p-2 mb-2"
      />

      <input
        type="number"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        className="border p-2 mb-2"
      />

      {attributes.map((attr, index) => (
        <div key={index} className="mb-2 flex items-center">
          <input
            type="text"
            placeholder="Attribute Name"
            value={attr.name}
            onChange={(e) => handleAttributeChange(index, "name", e.target.value)}
            className="border p-2 mr-2"
          />
          <input
            type="text"
            placeholder="Attribute Value"
            value={attr.selectedValue}
            onChange={(e) => handleAttributeChange(index, "selectedValue", e.target.value)}
            className="border p-2 mr-2"
          />
          <button onClick={() => deleteAttribute(index)} className="bg-red-500 text-white p-2">
            Delete
          </button>
        </div>
      ))}

      <button onClick={addAttribute} className="bg-blue-500 text-white p-2 mb-4">
        Add Attribute
      </button>

      <select
        value={deliveryMethod}
        onChange={(e) => setDeliveryMethod(e.target.value)}
        className="border p-2 mb-2"
      >
        <option value="normal">Normal</option>
        <option value="express">Express</option>
        <option value="overnight">Overnight</option>
      </select>

      <button onClick={calculatePrice} className="bg-green-500 text-white p-2">
        Calculate Price
      </button>

      {result && (
        <div className="mt-4">
          <h2 className="text-xl">Result:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
