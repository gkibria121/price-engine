"use client";
import VendorForm from "@/components/VendorForm";

export default function Page() {
  const handleSuccess = () => {
    console.log("Vendor created successfully!");
  };

  return (
    <main>
      <h1>Create a Vendor</h1>
      <VendorForm onSuccess={handleSuccess} />
    </main>
  );
}
