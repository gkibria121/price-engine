export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-4xl font-bold mb-6">Pricing Engine Dashboard</h1>
      <p className="mb-8 max-w-2xl text-lg">
        Welcome to the Pricing Engine Dashboard. This application allows you to manage products,
        vendors, and calculate dynamic pricing based on various attributes, delivery methods, and
        quantities.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        <a
          href="/products"
          className="p-6 bg-blue-50 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-semibold mb-2 text-blue-600">Products</h2>
          <p>Manage your product catalog and their pricing rules.</p>
        </a>

        <a
          href="/vendors"
          className="p-6 bg-green-50 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-semibold mb-2 text-green-600">Vendors</h2>
          <p>Manage vendor information and product associations.</p>
        </a>

        <a
          href="/calculate-price"
          className="p-6 bg-purple-50 rounded-lg shadow-md hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-semibold mb-2 text-purple-600">Calculate Price</h2>
          <p>Dynamically calculate prices based on product attributes and quantities.</p>
        </a>
      </div>
    </div>
  );
}
