"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Vendor } from "@/lib/api";
import axios, { AxiosError } from "axios";
import InputCSV from "@/components/InputCSV";
import toast, { Toaster } from "react-hot-toast";
export default function VendorList() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/vendors");

        if (!response.ok) {
          throw new Error("Failed to fetch vendors");
        }

        const data = await response.json();
        setVendors(data.vendors);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching vendors:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const uploadVendorsFromCSV = async (vendors: Vendor[]) => {
    const toastId = toast.loading("Uploading vendors");
    try {
      await axios.post("/api/vendors/bulk-upload", {
        vendors,
      });
      toast.dismiss(toastId);
      toast.success("Vendor uploaded!", {
        duration: 1000,
      });
      setTimeout(() => window.location.reload(), 2000);
    } catch (e) {
      if (e instanceof AxiosError) toast.error(e?.response?.data?.message);
    } finally {
      toast.dismiss(toastId);
    }
  };
  const deleteVendor = (id: string) => {
    try {
      axios.delete("/api/vendors/" + id);
      window.location.reload();
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <main className="p-6 max-w-4xl mx-auto">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendors</h1>

        <Link
          href="/vendors/add"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded ml-auto mr-1"
        >
          Create Vendor
        </Link>
        <InputCSV name="vendors_csv" handleFileUpload={uploadVendorsFromCSV} />
      </div>

      {isLoading && (
        <div className="text-center py-4">
          <p>Loading vendors...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && vendors.length === 0 && (
        <div className="text-center py-4 border rounded bg-gray-50">
          <p className="text-gray-500">No vendors found</p>
        </div>
      )}

      {vendors.length > 0 && (
        <div className="bg-white shadow rounded overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vendors.map((vendor) => (
                <tr key={vendor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {vendor.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-500">{vendor.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-500">{vendor.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/vendors/${vendor._id}`}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View
                    </Link>
                    <Link
                      href={`/vendors/edit/${vendor._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteVendor(vendor._id as string)}
                      className="text-red-600 cursor-pointer ml-2 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
