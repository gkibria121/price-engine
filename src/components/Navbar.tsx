import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Pricing Engine
        </Link>
        <div className="space-x-4">
          <Link href="/products" className="hover:text-blue-200">
            Products
          </Link>
          <Link href="/vendors" className="hover:text-blue-200">
            Vendors
          </Link>
          <Link href="/calculate-price" className="hover:text-blue-200">
            Calculate Price
          </Link>
        </div>
      </div>
    </nav>
  );
}
