import Link from "next/link";
import { Product } from "@/lib/api";
import InputCSV from "@/components/InputCSV";
import ProductCard from "./ProductCard";

interface ProductSectionProps {
  products: Product[];
  onCSVUpload: (products: Product[]) => void;
}

export default function ProductSection({
  products,
  onCSVUpload,
}: ProductSectionProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link
          href="/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ml-auto mr-1"
        >
          Add New Product
        </Link>
        <InputCSV name="products_csv" handleFileUpload={onCSVUpload} />
      </div>

      {products.length === 0 ? (
        <EmptyProductState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              editUrl={`/products/edit/${product._id}`}
              deletePrefix="/api/products/"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyProductState() {
  return (
    <div className="text-center p-8 bg-gray-50 rounded-lg">
      <p className="mb-4">No products found.</p>
      <Link href="/products/add" className="text-blue-600 hover:underline">
        Add your first product
      </Link>
    </div>
  );
}
