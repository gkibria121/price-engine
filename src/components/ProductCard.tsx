import Link from "next/link";
import DeleteProduct from "@/components/DeleteProduct";
import { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
  editUrl: string;
  deletePrefix: string;
}

export default function ProductCard({
  product,
  editUrl,
  deletePrefix,
}: ProductCardProps) {
  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition">
      <div className="flex justify-between">
        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
        <Link
          href={editUrl}
          className="bg-blue-600 px-2 py-1 rounded-md text-white mr-2 ml-auto"
        >
          Edit
        </Link>
        <DeleteProduct id={product._id} prefix={deletePrefix} />
      </div>
    </div>
  );
}
