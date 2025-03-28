"use client";
import React from "react";
import VendorForm from "@/components/VendorForm";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const handleCancel = () => {
    router.push("/vendors");
  };
  const handleSuccess = () => {
    console.log("Vendor created successfully!");
    router.push("/vendors");
  };

  return (
    <main>
      <h1>Create a Vendor</h1>

      <VendorForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </main>
  );
}
