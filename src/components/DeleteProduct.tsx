"use client";

export default function DeleteProduct({ id }) {
  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this product?")) {
      await fetch("/api/products/" + id, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      window.location.reload();
    }
  };

  return (
    <button onClick={handleDelete} className="text-red-600 hover:underline">
      Delete
    </button>
  );
}
