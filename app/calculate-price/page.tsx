// View Component for Price Calculation
"use client";
import { getProducts, Product } from "@/lib/api";
import Attribute from "@/utils/Attribute";
import { useEffect, useState } from "react";

function getUniqueObject<T extends Record<string, any>[]>(obj: T, uniqeKey = "name"): T {
  const uniqueObjects: T = obj.reduce((accumulator, currentValue) => {
    // Check if the object already exists in the accumulator (based on a key or criteria)
    const existingIndex = accumulator.findIndex((item: Record<string, any>) => {
      return item[uniqeKey] === currentValue[uniqeKey];
    });
    if (existingIndex === -1) {
      accumulator.push(currentValue);
    }
    return accumulator;
  }, []) as T;

  return uniqueObjects;
}

function toTitleCase(str: string) {
  return str[0].toLocaleUpperCase() + str.toLocaleLowerCase().slice(1);
}

interface PriceCalculationResult {
  total: number;
  breakdown: Record<string, any>;
}

export default function PriceCalculator() {
  const [attributes, setAttributes] = useState<Attribute[]>([{ name: "", selectedValue: "" }]);
  const [productName, setProductName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [result, setResult] = useState<PriceCalculationResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const uniqeProducts = getUniqueObject(products);
  const vendorsForAProduct = getUniqueObject(
    products.filter((product) => product.name === productName).map((product) => product.vendor)
  );

  const selectedProduct = products.find(
    (product) => product.name === productName && product.vendor._id === vendorId
  );

  const selectedProductId = selectedProduct?._id;
  const deliveryMethods = selectedProduct?.deliveryRules.map((rule) => rule.method) ?? [];
  const availableAttributes = selectedProduct?.pricingRules ?? [];
  const uniqeAvailableAttributes = getUniqueObject(availableAttributes, "attribute");
  const addAttribute = () => {
    setAttributes([
      ...attributes,
      {
        name: availableAttributes[0].attribute ?? "",
        selectedValue: availableAttributes[0].value ?? "",
      },
    ]);
  };

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

  const handleAttributeChange = (index: number, field: keyof Attribute, value: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][field] = value;
    setAttributes(updatedAttributes);
  };

  const deleteAttribute = (index: number) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttributes);
  };

  const calculatePrice = async () => {
    const response = await fetch("/api/calculate-price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProductId,
        vendorId,
        quantity: 20,
        attributes,
        deliveryMethod: deliveryMethod,
      }),
    });

    const data: PriceCalculationResult = await response.json();
    setResult(data);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Price Calculator</h1>

      <select
        name="productId"
        id=""
        className="border p-2 mb-2"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
      >
        <option value="" disabled>
          Select A Product
        </option>
        {uniqeProducts.map((product) => {
          return (
            <option key={product.name} value={product.name}>
              {product.name}
            </option>
          );
        })}
      </select>

      <select
        name="vendorId"
        id=""
        className="border p-2 mb-2"
        value={vendorId}
        onChange={(e) => setVendorId(e.target.value)}
      >
        <option value="">Select A Vendor</option>
        {vendorsForAProduct.map((vendor) => {
          return (
            <option key={vendor._id} value={vendor._id}>
              {vendor.name}
            </option>
          );
        })}
      </select>

      <input type="number" placeholder="Quantity" name="quantity" className="border p-2 mb-2" />

      {attributes.map((attr, index) => (
        <div key={index} className="mb-2 flex items-center">
          <select
            id=""
            className="border p-2 mb-2"
            onChange={(e) => handleAttributeChange(index, "name", e.target.value)}
          >
            {uniqeAvailableAttributes?.map((attr) => (
              <option value={attr.attribute} key={attr.value}>
                {attr.attribute}
              </option>
            ))}
          </select>
          <select
            className="border p-2 mb-2"
            id=""
            onChange={(e) => handleAttributeChange(index, "selectedValue", e.target.value)}
          >
            {availableAttributes
              ?.filter((attr) => attr.attribute === attributes[index].name)
              .map((attr) => (
                <option value={attr.value} key={attr.value}>
                  {attr.value}
                </option>
              ))}
          </select>

          <button onClick={() => deleteAttribute(index)} className="bg-red-500 text-white mb-2 p-2">
            Delete
          </button>
        </div>
      ))}

      <button onClick={addAttribute} className="bg-blue-500 text-white p-2 mb-4">
        Add Attribute
      </button>

      <select
        name="deliveryMethod"
        className="border p-2 mb-2"
        value={deliveryMethod}
        onChange={(e) => setDeliveryMethod(e.target.value)}
      >
        <option value="" disabled>
          Select a method
        </option>

        {deliveryMethods.map((method) => (
          <option value={method} key={method}>
            {toTitleCase(method)}
          </option>
        ))}
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
