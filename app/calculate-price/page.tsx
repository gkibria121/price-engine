"use client";
import { Product, VendorProduct } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";

// Improved type definitions with more specific types
type Attribute = {
  name: string;
  value: string;
};

type FormValues = {
  productId: string;
  quantity: number;
  attributes: Array<{
    name: string;
    values: string[];
    selectedValue: string;
  }>;
  deliveryMethod: string;
};

type CalculationResult = {
  totalPrice: number;
  breakdown: Record<string, any>;
};

type DeliveryMethod = {
  label: string;
  deliveryTimeStartDate: number;
  deliveryTimeEndDate: number;
  deliveryTimeEndTime: `${number}:${number}`;
};

export default function SimplifiedPriceCalculator() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorProduct, setVendorProduct] = useState<VendorProduct[] | null>(
    null
  );
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableAttributes, setAvailableAttributes] = useState<
    Array<{ attribute: string; values: string[] }>
  >([]);

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      productId: "",
      quantity: 20,
      attributes: [],
      deliveryMethod: "",
    },
  });

  // Watch for product ID changes
  const productId = watch("productId");
  const selectedAttributes = watch("attributes");

  const deliveryMethods: DeliveryMethod[] = [
    {
      label: "Standard 3-5 Working Days",
      deliveryTimeStartDate: 0,
      deliveryTimeEndDate: 1,
      deliveryTimeEndTime: "23:59",
    },
    {
      label: "Standard 2 Working Days",
      deliveryTimeStartDate: 0,
      deliveryTimeEndDate: 1,
      deliveryTimeEndTime: "23:59",
    },
    {
      label: "Priority Next Day by 11:59 PM",
      deliveryTimeStartDate: 0,
      deliveryTimeEndDate: 1,
      deliveryTimeEndTime: "23:59",
    },
    {
      label: "Priority Next Day by 5 PM",
      deliveryTimeStartDate: 0,
      deliveryTimeEndDate: 1,
      deliveryTimeEndTime: "17:00",
    },
    {
      label: "Priority Plus Next Day by 12 PM Noon",
      deliveryTimeStartDate: 0,
      deliveryTimeEndDate: 1,
      deliveryTimeEndTime: "12:00",
    },
    {
      label: "Priority Plus Next Day by 10:30 AM",
      deliveryTimeStartDate: 0,
      deliveryTimeEndDate: 1,
      deliveryTimeEndTime: "10:30",
    },
    {
      label: "Super Express Today by 11:59 PM",
      deliveryTimeStartDate: 0,
      deliveryTimeEndDate: 1,
      deliveryTimeEndTime: "23:59",
    },
    {
      label: "Super Express Today by 5 PM",
      deliveryTimeStartDate: 0,
      deliveryTimeEndDate: 1,
      deliveryTimeEndTime: "17:00",
    },
  ];

  // Process pricing rules when vendor product changes
  useEffect(() => {
    if (!vendorProduct) {
      setAvailableAttributes([]);
      return;
    }

    const availablePricingRules = vendorProduct.flatMap(
      (el) => el.pricingRules || []
    );

    // Group attributes and their values
    const attributeMap = availablePricingRules.reduce((acc, rule) => {
      if (!rule.attribute) return acc;

      if (!acc[rule.attribute]) {
        acc[rule.attribute] = new Set();
      }
      if (rule.value) {
        acc[rule.attribute].add(rule.value);
      }
      return acc;
    }, {} as Record<string, Set<string>>);

    // Convert to array format needed for the form
    const attributes = Object.entries(attributeMap).map(
      ([attribute, valueSet]) => ({
        attribute,
        values: Array.from(valueSet),
      })
    );

    setAvailableAttributes(attributes);

    // Reset attributes when product changes
    setValue("attributes", []);
  }, [vendorProduct, setValue]);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`
        );

        if (!response.ok) throw new Error("Failed to load products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch vendor product when productId changes
  useEffect(() => {
    const fetchVendorProduct = async () => {
      if (!productId) return;

      try {
        setIsLoading(true);
        setError("");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/vendor-products`
        );

        if (!response.ok) throw new Error("Failed to load product details");
        const data = await response.json();
        setVendorProduct(data);

        // Reset result when product changes
        setResult(null);
      } catch (error) {
        console.error("Error fetching vendor product:", error);
        setError("Failed to load vendor product details");
        setVendorProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorProduct();
  }, [productId]);

  // Add attribute handler
  const addAttribute = () => {
    const usedAttributes = new Set(selectedAttributes.map((attr) => attr.name));

    // Find first available attribute not already added
    const availableAttribute = availableAttributes.find(
      (attr) => !usedAttributes.has(attr.attribute)
    );

    if (availableAttribute) {
      setValue("attributes", [
        ...selectedAttributes,
        {
          name: availableAttribute.attribute,
          values: availableAttribute.values,
          selectedValue: "",
        },
      ]);
    }
  };

  // Delete attribute handler
  const deleteAttribute = (index: number) => {
    setValue(
      "attributes",
      selectedAttributes.filter((_, i) => i !== index)
    );
  };

  // Reset form handler
  const handleReset = () => {
    reset({
      productId: "",
      quantity: 20,
      attributes: [],
      deliveryMethod: "",
    });
    setResult(null);
    setError("");
  };

  // Form submission handler
  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      setError("");

      const currentTime = new Date().toISOString();

      // Format attributes for API
      const formattedAttributes: Attribute[] = data.attributes.map((attr) => ({
        name: attr.name,
        value: attr.selectedValue,
      }));
      const selectedDeliveryMethod = JSON.parse(data.deliveryMethod);
      const payload = {
        productId: data.productId,
        quantity: data.quantity,
        attributes: formattedAttributes,
        deliveryMethod: selectedDeliveryMethod,
        currentTime,
      };

      // Remove this console.log and return in production
      console.log(payload);
      // return;
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to calculate price");
      }

      const resultData = await response.json();
      setResult(resultData);
    } catch (err: any) {
      setError(
        `Error calculating price: ${err.message || "Unknown error occurred"}`
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate if Add Attribute button should be disabled
  const canAddMoreAttributes = useMemo(() => {
    const usedAttributes = new Set(selectedAttributes.map((attr) => attr.name));
    return availableAttributes.some(
      (attr) => !usedAttributes.has(attr.attribute)
    );
  }, [availableAttributes, selectedAttributes]);

  return (
    <div className="p-5 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Simplified Price Calculator
      </h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded border border-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Product Selection */}
        <div className="space-y-1">
          <label
            htmlFor="productId"
            className="block text-sm font-medium text-gray-700"
          >
            Product
          </label>
          <Controller
            name="productId"
            control={control}
            rules={{ required: "Please select a product" }}
            render={({ field }) => (
              <select
                id="productId"
                className={`w-full border ${
                  errors.productId ? "border-red-500" : "border-gray-300"
                } p-2 rounded shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                disabled={isLoading || products.length === 0}
                {...field}
              >
                <option value="" disabled>
                  {products.length === 0
                    ? "Loading products..."
                    : "Select a product"}
                </option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.productId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.productId.message}
            </p>
          )}
        </div>

        {/* Quantity */}
        <div className="space-y-1">
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700"
          >
            Quantity
          </label>
          <Controller
            name="quantity"
            control={control}
            rules={{
              required: "Quantity is required",
              min: { value: 1, message: "Quantity must be at least 1" },
              pattern: {
                value: /^[0-9]+$/,
                message: "Please enter a valid number",
              },
            }}
            render={({ field }) => (
              <input
                id="quantity"
                type="number"
                min="1"
                placeholder="Enter quantity"
                className={`w-full border ${
                  errors.quantity ? "border-red-500" : "border-gray-300"
                } p-2 rounded shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                disabled={isLoading || !productId}
                {...field}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseInt(e.target.value, 10) : ""
                  )
                }
              />
            )}
          />
          {errors.quantity && (
            <p className="text-red-500 text-sm mt-1">
              {errors.quantity.message}
            </p>
          )}
        </div>

        {/* Attributes Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Attributes
            </label>
            <button
              type="button"
              onClick={addAttribute}
              disabled={!canAddMoreAttributes || isLoading || !productId}
              className="bg-blue-500 hover:bg-blue-600 text-white p-1 px-3 rounded text-sm disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Add Attribute
            </button>
          </div>

          {selectedAttributes.length === 0 && productId && (
            <p className="text-sm text-gray-500 italic">
              {availableAttributes.length > 0
                ? "Click 'Add Attribute' to select product attributes"
                : "No attributes available for this product"}
            </p>
          )}

          <div className="space-y-3">
            {selectedAttributes.map((attr, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {attr.name}
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 p-2 rounded bg-gray-50"
                    value={attr.name}
                    disabled
                    readOnly
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Value
                  </label>
                  <Controller
                    name={`attributes.${index}.selectedValue`}
                    control={control}
                    rules={{ required: "Please select a value" }}
                    render={({ field }) => (
                      <select
                        className={`w-full border ${
                          errors.attributes?.[index]?.selectedValue
                            ? "border-red-500"
                            : "border-gray-300"
                        } p-2 rounded shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                        disabled={isLoading}
                        {...field}
                      >
                        <option value="" disabled>
                          Select a value
                        </option>
                        {attr.values.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.attributes?.[index]?.selectedValue && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.attributes[index].selectedValue?.message}
                    </p>
                  )}
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => deleteAttribute(index)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
                    disabled={isLoading}
                    aria-label="Delete attribute"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Method */}
        <div className="space-y-1">
          <label
            htmlFor="deliveryMethod"
            className="block text-sm font-medium text-gray-700"
          >
            Delivery Method
          </label>
          <Controller
            name="deliveryMethod"
            control={control}
            rules={{ required: "Please select a delivery method" }}
            render={({ field }) => (
              <select
                id="deliveryMethod"
                className={`w-full border ${
                  errors.deliveryMethod ? "border-red-500" : "border-gray-300"
                } p-2 rounded shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                disabled={isLoading || !productId}
                {...field}
              >
                <option value="" disabled>
                  Select a delivery method
                </option>
                {deliveryMethods.map((method) => (
                  <option key={method.label} value={JSON.stringify(method)}>
                    {method.label}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.deliveryMethod && (
            <p className="text-red-500 text-sm mt-1">
              {errors.deliveryMethod.message}
            </p>
          )}
        </div>

        {/* Form Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white p-3 rounded font-medium transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={isLoading || !productId}
          >
            {isLoading ? "Calculating..." : "Calculate Price"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Results */}
      {result && (
        <div className="mt-8 p-4 border rounded-lg bg-gray-50 shadow-inner">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">
            Price Calculation Result
          </h2>
          <div className="text-2xl font-bold mb-4 text-green-700">
            Total: £{result?.totalPrice?.toFixed(2)}
          </div>
          <div>
            <h3 className="text-md font-medium mb-2 text-gray-700">
              Price Breakdown:
            </h3>
            <pre className="bg-white p-3 rounded border border-gray-200 overflow-x-auto text-sm">
              {JSON.stringify(result.breakdown, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
