"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Product, VendorProduct } from "@/lib/api";
import DeleteProduct from "@/components/DeleteProduct";
import InputCSV from "@/components/InputCSV";
import axios, { AxiosError } from "axios";
import toast, { Toaster } from "react-hot-toast";
import Modal from "@/components/Modal";
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`
        );
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        const data = await response.json();
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
  useEffect(() => {
    const fetchVendorProducts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/vendor-products`
        );
        if (!response.ok) {
          throw new Error("Something went wrong!");
        }
        const data = await response.json();
        setVendorProducts(data);
        console.log(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load products");
        setLoading(false);
        console.error(err);
      }
    };
    fetchVendorProducts();
  }, []);
  const handleProductUploadFromCSV = async (products: Product[]) => {
    let toastId;
    try {
      toastId = toast.loading("Uploading products..");
      await axios.post("/api/products/bulk-upload", {
        products,
      });
      toast.dismiss(toastId);
      toast.success("Products uploaded!", {
        duration: 1000,
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (e) {
      console.log(e);
      if (e instanceof AxiosError) toast.error(e.response?.data.message);
    } finally {
      toast.dismiss(toastId);
    }
  };
  const handleVendorProductUploadFromCSV = (
    vendorProducts: VendorProduct[]
  ) => {
    console.log(vendorProducts);
  };
  if (loading)
    return <div className="text-center p-8">Loading products...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  return (
    <div>
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto mr-1"
        >
          Add New Product
        </Link>
        <InputCSV
          name="products_csv"
          handleFileUpload={handleProductUploadFromCSV}
        />
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
            <div
              key={product._id}
              className="border rounded-lg p-6 hover:shadow-lg transition  "
            >
              <div className="flex  justify-between">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <Link
                  href={`/products/edit/${product._id}`}
                  key={product._id}
                  className="bg-blue-600 px-2 py-1 rounded-md text-white mr-2 ml-auto"
                >
                  Edit
                </Link>
                <DeleteProduct id={product._id} />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mb-6 mt-10">
        <h1 className="text-3xl font-bold">Vendor Products</h1>
        <Link
          href="/vendor-products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto mr-1"
        >
          Add New Vendor Product
        </Link>
        {/* <InputCSV
          name="products_csv"
          handleFileUpload={handleVendorProductUploadFromCSV}
        /> */}
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded cursor-pointer"
          onClick={() => setIsModalOpen((prev) => !prev)}
        >
          Import
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        title="Add vendor products"
        onClose={() => {
          setIsModalOpen(false);
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center  justify-between">
            <span>Pricing rules</span>
            <InputCSV
              handleFileUpload={handleVendorProductUploadFromCSV}
              name="pricing_rules"
            />
          </div>
          <div className="flex items-center  justify-between">
            <span>Delivery slots</span>
            <InputCSV
              handleFileUpload={handleVendorProductUploadFromCSV}
              name="delivery_slots"
            />
          </div>
          <div className="flex items-center  justify-between">
            <span>Quantity pricings</span>
            <InputCSV
              handleFileUpload={handleVendorProductUploadFromCSV}
              name="quantity_pricings"
            />
          </div>
          <div className="flex flex-row-reverse mt-4">
            <button className="bg-blue-600  text-white px-4 py-1 rounded-md cursor-pointer">
              Save
            </button>
          </div>
        </div>
      </Modal>
      {vendorProducts.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="mb-4">No vendor products found.</p>
          <Link
            href="/products/add"
            className="text-blue-600 hover:underline  "
          >
            Add your first vendor product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendorProducts.map((vendorProduct) => (
            <div
              key={vendorProduct._id}
              className="border rounded-lg p-6 hover:shadow-lg transition  "
            >
              <div className="flex  justify-between">
                <h2 className="text-xl font-semibold mb-1">
                  {vendorProduct.product.name}
                </h2>
                <Link
                  href={`/vendor-products/edit/${vendorProduct._id}`}
                  key={vendorProduct._id}
                  className="bg-blue-600 px-2 py-1 rounded-md text-white mr-2 ml-auto"
                >
                  Edit
                </Link>
                <DeleteProduct
                  prefix="/api/vendor-products/"
                  id={vendorProduct._id}
                />
              </div>
              <h2 className="text-lg mb-2">{vendorProduct.vendor.name}</h2>
              <div className="text-sm text-gray-600">
                <p>{vendorProduct.pricingRules.length} pricing rules</p>
                <p>{vendorProduct.deliverySlots.length} delivery options</p>
                <p>{vendorProduct.quantityPricing.length} quantity tiers</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
