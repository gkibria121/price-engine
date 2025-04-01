import { useState } from "react";
import Link from "next/link";
import { VendorProduct } from "@/lib/api";
import InputCSV from "@/components/InputCSV";
import Modal from "@/components/Modal";
import VendorProductCard from "./VendorProductCard";

interface VendorProductSectionProps {
  vendorProducts: VendorProduct[];
  onCSVUpload: (vendorProducts: VendorProduct[]) => void;
}

export default function VendorProductSection({
  vendorProducts,
  onCSVUpload,
}: VendorProductSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendor Products</h1>
        <Link
          href="/vendor-products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto mr-1"
        >
          Add New Vendor Product
        </Link>
        <button
          className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          Import
        </button>
      </div>

      <ImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCSVUpload={onCSVUpload}
      />

      {vendorProducts.length === 0 ? (
        <EmptyVendorProductState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendorProducts.map((vendorProduct) => (
            <VendorProductCard
              key={vendorProduct._id}
              vendorProduct={vendorProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ImportModal({ isOpen, onClose, onCSVUpload }) {
  return (
    <Modal isOpen={isOpen} title="Add vendor products" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <ImportRow
          label="Pricing rules"
          name="pricing_rules"
          onUpload={onCSVUpload}
        />
        <ImportRow
          label="Delivery slots"
          name="delivery_slots"
          onUpload={onCSVUpload}
        />
        <ImportRow
          label="Quantity pricings"
          name="quantity_pricings"
          onUpload={onCSVUpload}
        />
        <div className="flex flex-row-reverse mt-4">
          <button className="bg-blue-600 text-white px-4 py-1 rounded-md cursor-pointer">
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ImportRow({ label, name, onUpload }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <InputCSV handleFileUpload={onUpload} name={name} />
    </div>
  );
}

function EmptyVendorProductState() {
  return (
    <div className="text-center p-8 bg-gray-50 rounded-lg">
      <p className="mb-4">No vendor products found.</p>
      <Link
        href="/vendor-products/add"
        className="text-blue-600 hover:underline"
      >
        Add your first vendor product
      </Link>
    </div>
  );
}
