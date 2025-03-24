"use client";
import { Product, VendorProduct } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
export default function SimplifiedPriceCalculator() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorProduct, setVendorProduct] = useState<VendorProduct[] | null>(
    null
  );
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Form setup with react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    setValue,
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

  const [deliveryMethods] = useState([
    { label: "Standard 3-5 Working Days", startDate: 0, endDate: 1 },
    { label: "Standard 2 Working Days", startDate: 0, endDate: 1 },
    { label: "Priority Next Day by 11:59 PM", startDate: 0, endDate: 1 },
    { label: "Priority Next Day by 5 PM", startDate: 0, endDate: 1 },
    { label: "Priority Plus Next Day by 12 PM Noon", startDate: 0, endDate: 1 },
    { label: "Priority Plus Next Day by 10:30 AM", startDate: 0, endDate: 1 },
    { label: "Super Express Today by 11:59 PM", startDate: 0, endDate: 1 },
    { label: "Super Express Today by 5 PM", startDate: 0, endDate: 1 },
  ]);

  const availablePricingRules = useMemo(
    () => vendorProduct?.flatMap((el) => el.pricingRules),
    [vendorProduct]
  );
  const pricingRuleOptions = useMemo(
    () =>
      availablePricingRules?.reduce(
        (acc, curr): { attribute: string; values: string[] }[] => {
          if (acc.some((option) => option.attribute === curr.attribute)) {
            return [
              ...acc.map((el) =>
                el.attribute === curr.attribute
                  ? {
                      attribute: curr.attribute,
                      values: [...el.values, curr.value],
                    }
                  : el
              ),
            ];
          }
          return [...acc, { attribute: curr.attribute, values: [curr.value] }];
        },
        [] as { attribute: string; values: string[] }[]
      ),
    [availablePricingRules]
  );

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`
        );

        if (!response.ok) throw new Error("Something went wrong!");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  // Fetch vendor product when productId changes
  useEffect(() => {
    const fetchVendorProduct = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}/vendor-products`
        );

        if (!response.ok) throw new Error("Something went wrong!");
        const data = await response.json();
        setVendorProduct(data);
      } catch (error) {
        console.error("Error fetching vendor product:", error);
        setError("Failed to load vendor product details");
      }
    };

    if (productId) fetchVendorProduct();
  }, [productId]);

  // Add attribute handler
  const addAttribute = () => {
    const firstOption = pricingRuleOptions?.shift();

    if (firstOption) {
      const currentAttributes = watch("attributes");
      setValue("attributes", [
        ...currentAttributes,
        {
          name: firstOption.attribute,
          values: firstOption.values,
          selectedValue: "",
        },
      ]);
    }
  };

  // Delete attribute handler
  const deleteAttribute = (index) => {
    const currentAttributes = watch("attributes");
    setValue(
      "attributes",
      currentAttributes.filter((_, i) => i !== index)
    );
  };

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError("");

      const currentTime = new Date().toISOString();

      // Format attributes for API
      const formattedAttributes = data.attributes.map((attr) => ({
        name: attr.name,
        value: attr.selectedValue,
      }));
      const payload = {
        productId: data.productId,
        quantity: data.quantity,
        attributes: formattedAttributes,
        deliveryMethod: data.deliveryMethod,
        currentTime,
      };
      console.log(payload);
      return;
      const response = await fetch("/api/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate price");
      }

      const resultData = await response.json();
      setResult(resultData);
    } catch (err: any) {
      setError("Error calculating price: " + err.message);
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Product ID */}
        <div>
          <label htmlFor="productId" className="block text-sm font-medium mb-1">
            Product ID
          </label>
          <Controller
            name="productId"
            control={control}
            rules={{ required: "Product is required" }}
            render={({ field }) => (
              <select
                id="productId"
                className="w-full border p-2 rounded"
                {...field}
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
            )}
          />
          {errors.productId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.productId.message}
            </p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium mb-1">
            Quantity
          </label>
          <Controller
            name="quantity"
            control={control}
            rules={{
              required: "Quantity is required",
              min: { value: 1, message: "Quantity must be at least 1" },
            }}
            render={({ field }) => (
              <input
                id="quantity"
                type="number"
                min="1"
                placeholder="Quantity"
                className="w-full border p-2 rounded"
                {...field}
                onChange={(e) =>
                  field.onChange(parseInt(e.target.value, 10) || "")
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

          {watch("attributes").map((attr, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                className="flex-1 border p-2 rounded"
                placeholder="Attribute name"
                value={attr.name}
                readOnly
              />
              <Controller
                name={`attributes.${index}.selectedValue`}
                control={control}
                rules={{ required: "Please select a value" }}
                render={({ field }) => (
                  <select className="flex-1 border p-2 rounded" {...field}>
                    <option value="" disabled>
                      Select an attribute
                    </option>
                    {attr.values.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}
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
          <label
            htmlFor="deliveryMethod"
            className="block text-sm font-medium mb-1"
          >
            Delivery Method
          </label>
          <Controller
            name="deliveryMethod"
            control={control}
            rules={{ required: "Delivery method is required" }}
            render={({ field }) => (
              <select
                id="deliveryMethod"
                className="w-full border p-2 rounded"
                {...field}
              >
                <option value="" disabled>
                  Select a delivery method
                </option>
                {deliveryMethods.map((method) => (
                  <option key={method.label} value={method.label}>
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

        {/* Calculate Button */}
        <button
          type="submit"
          className="w-full bg-green-500 text-white p-2 rounded mt-4 disabled:bg-gray-300"
          disabled={isLoading}
        >
          {isLoading ? "Calculating..." : "Calculate Price"}
        </button>
      </form>

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
