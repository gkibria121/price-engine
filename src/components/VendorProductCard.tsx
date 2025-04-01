import Link from "next/link";
import DeleteProduct from "@/components/DeleteProduct";
import { VendorProduct } from "@/lib/api";

interface VendorProductCardProps {
  vendorProduct: VendorProduct;
}

export default function VendorProductCard({
  vendorProduct,
}: VendorProductCardProps) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold mb-1">
          {vendorProduct.product.name}
        </h2>
        <Link
          href={`/vendor-products/edit/${vendorProduct._id}`}
          className="bg-blue-600 px-2 py-1 rounded-md text-white mr-2 ml-auto"
        >
          Edit
        </Link>
        <DeleteProduct prefix="/api/vendor-products/" id={vendorProduct._id} />
      </div>
      <h2 className="text-lg mb-2">{vendorProduct.vendor.name}</h2>
      <div className="text-sm text-gray-600">
        <p>{vendorProduct.pricingRules.length} pricing rules</p>
        <p>{vendorProduct.deliverySlots.length} delivery options</p>
        <p>{vendorProduct.quantityPricing.length} quantity tiers</p>
      </div>
    </div>
  );
}
