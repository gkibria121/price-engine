"use client";
import { getProducts, Product } from "@/lib/api";
import Attribute from "@/utils/Attribute";
import { useEffect, useMemo, useState } from "react";

// Helper function to get unique objects from an array based on a key
function getUniqueObjects<T extends Record<string, any>>(array: T[], uniqueKey = "name"): T[] {
  return array.reduce((accumulator: T[], currentValue: T) => {
    const exists = accumulator.some((item) => item[uniqueKey] === currentValue[uniqueKey]);
    if (!exists) {
      accumulator.push(currentValue);
    }
    return accumulator;
  }, []);
}

// Helper function to convert string to title case
function toTitleCase(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

interface PriceCalculationResult {
  totalPrice: number;
  breakdown: Record<string, unknown>;
}

export default function PriceCalculator() {
  // State definitions
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [productName, setProductName] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [vendorId, setVendorId] = useState("");
  const [result, setResult] = useState<PriceCalculationResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();
        setProducts(data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load products");
        setIsLoading(false);
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  // Derived state
  const uniqueProducts = useMemo(() => getUniqueObjects(products), [products]);

  const vendorsForSelectedProduct = useMemo(
    () =>
      getUniqueObjects(
        products.filter((product) => product.name === productName).map((product) => product.vendor)
      ),
    [products, productName]
  );

  const selectedProduct = useMemo(
    () =>
      products.find((product) => product.name === productName && product.vendor._id === vendorId),
    [products, productName, vendorId]
  );

  const selectedProductId = selectedProduct?._id;

  const deliveryMethods = useMemo(
    () => selectedProduct?.deliveryRules?.map((rule) => rule.method) || [],
    [selectedProduct]
  );

  const availableAttributes = useMemo(() => selectedProduct?.pricingRules || [], [selectedProduct]);

  const uniqueAvailableAttributes = useMemo(
    () => getUniqueObjects(availableAttributes, "attribute"),
    [availableAttributes]
  );

  // Reset form when product or vendor changes
  useEffect(() => {
    if (productName && vendorId && uniqueAvailableAttributes.length > 0) {
      // Initialize with the first available attribute and value
      const firstAttribute = uniqueAvailableAttributes[0];
      const firstValue =
        availableAttributes.find((attr) => attr.attribute === firstAttribute.attribute)?.value ||
        "";

      setAttributes([
        {
          name: firstAttribute.attribute,
          selectedValue: firstValue,
        },
      ]);

      // Reset delivery method
      setDeliveryMethod("");
    } else {
      setAttributes([]);
    }
  }, [productName, vendorId, uniqueAvailableAttributes, availableAttributes]);

  // Handlers
  const handleAttributeChange = (index: number, field: keyof Attribute, value: string) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index][field] = value;

    // If the attribute name changed, update its value to the first available value
    if (field === "name") {
      const firstValue = availableAttributes.find((attr) => attr.attribute === value)?.value || "";
      updatedAttributes[index].selectedValue = firstValue;
    }

    setAttributes(updatedAttributes);
    console.log(updatedAttributes);
  };

  const addAttribute = () => {
    if (
      uniqueAvailableAttributes.length === 0 ||
      attributes.length >= uniqueAvailableAttributes.length
    ) {
      return; // Don't add more attributes than available
    }

    // Find an attribute that hasn't been selected yet
    const usedAttributes = new Set(attributes.map((attr) => attr.name));
    const nextAttribute = uniqueAvailableAttributes.find(
      (attr) => !usedAttributes.has(attr.attribute)
    );

    if (nextAttribute) {
      const firstValue =
        availableAttributes.find((attr) => attr.attribute === nextAttribute.attribute)?.value || "";
      setAttributes([
        ...attributes,
        {
          name: nextAttribute.attribute,
          selectedValue: firstValue,
        },
      ]);
    }
  };

  const deleteAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const calculatePrice = async () => {
    if (!selectedProductId || !vendorId || !deliveryMethod || quantity <= 0) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          vendorId,
          quantity,
          attributes,
          deliveryMethod,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate price");
      }

      const data: PriceCalculationResult = await response.json();
      setResult(data);
      console.log(data);
      setError("");
    } catch (err) {
      setError("Error calculating price");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Form validation
  const isFormValid = selectedProductId && vendorId && deliveryMethod && quantity > 0;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Price Calculator</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">{error}</div>}

      <div className="space-y-4">
        {/* Product Selection */}
        <div>
          <label htmlFor="product" className="block text-sm font-medium mb-1">
            Product
          </label>
          <select
            id="product"
            className="w-full border p-2 rounded"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={isLoading}
          >
            <option value="" disabled>
              Select A Product
            </option>
            {uniqueProducts.map((product) => (
              <option key={product.name} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vendor Selection */}
        {productName && (
          <div>
            <label htmlFor="vendor" className="block text-sm font-medium mb-1">
              Vendor
            </label>
            <select
              id="vendor"
              className="w-full border p-2 rounded"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              disabled={isLoading || vendorsForSelectedProduct.length === 0}
            >
              <option value="" disabled>
                Select A Vendor
              </option>
              {vendorsForSelectedProduct.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Quantity */}
        {vendorId && (
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
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full border p-2 rounded"
              disabled={isLoading}
            />
          </div>
        )}

        {/* Attributes */}
        {vendorId && uniqueAvailableAttributes.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Attributes</label>
              <button
                type="button"
                onClick={addAttribute}
                className="bg-blue-500 text-white p-1 px-2 rounded text-sm"
                disabled={attributes.length >= uniqueAvailableAttributes.length || isLoading}
              >
                Add Attribute
              </button>
            </div>

            {attributes.map((attr, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <select
                  className="flex-1 border p-2 rounded"
                  value={attr.name}
                  onChange={(e) => handleAttributeChange(index, "name", e.target.value)}
                  disabled={isLoading}
                >
                  <option value="" disabled>
                    Select Attribute
                  </option>
                  {uniqueAvailableAttributes.map((availAttr) => (
                    <option
                      key={availAttr.attribute}
                      value={availAttr.attribute}
                      disabled={attributes.some(
                        (a, i) => i !== index && a.name === availAttr.attribute
                      )}
                    >
                      {availAttr.attribute}
                    </option>
                  ))}
                </select>

                <select
                  className="flex-1 border p-2 rounded"
                  value={attr.selectedValue}
                  onChange={(e) => handleAttributeChange(index, "selectedValue", e.target.value)}
                  disabled={!attr.name || isLoading}
                >
                  <option value="" disabled>
                    Select Value
                  </option>
                  {availableAttributes
                    .filter((availAttr) => availAttr.attribute === attr.name)
                    .map((availAttr) => (
                      <option key={availAttr.value} value={availAttr.value}>
                        {availAttr.value}
                      </option>
                    ))}
                </select>

                <button
                  type="button"
                  onClick={() => deleteAttribute(index)}
                  className="bg-red-500 text-white p-2 rounded"
                  disabled={isLoading}
                  aria-label="Delete attribute"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Delivery Method */}
        {vendorId && (
          <div>
            <label htmlFor="delivery" className="block text-sm font-medium mb-1">
              Delivery Method
            </label>
            <select
              id="delivery"
              className="w-full border p-2 rounded"
              value={deliveryMethod}
              onChange={(e) => setDeliveryMethod(e.target.value)}
              disabled={isLoading || deliveryMethods.length === 0}
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
          </div>
        )}

        {/* Calculate Button */}
        <button
          type="button"
          onClick={calculatePrice}
          className="w-full bg-green-500 text-white p-2 rounded mt-4 disabled:bg-gray-300"
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? "Calculating..." : "Calculate Price"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">Calculation Result</h2>
          <div className="text-lg font-bold mb-2">
            Total: ${result?.totalPrice?.toFixed(2) ?? null}
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
