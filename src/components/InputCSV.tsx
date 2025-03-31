"use client";
import csvToJson from "@/lib/csv-to-json";
import React, { useRef, useState } from "react";

function InputCSV({
  name,
  handleFileUpload,
}: {
  name: string;
  handleFileUpload: (data: any[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        onFileUpload(e.target?.result as string);
        setLoading(false);
      };
      reader.readAsText(file);
    }
  };

  const onFileUpload = (fileContent: string) => {
    const jsonData = csvToJson(fileContent, { headers: true });
    if (jsonData) handleFileUpload(jsonData);
    else console.log("File does not contain  any csv");
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
          <span className="text-lg font-semibold">Loading...</span>
        </div>
      )}
      <input
        ref={fileInputRef}
        className="hidden"
        type="file"
        accept=".csv"
        name={name}
        onChange={handleFileChange}
      />
      <button
        onClick={handleButtonClick}
        className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded cursor-pointer"
        disabled={loading}
      >
        {loading ? "Processing..." : "Import"}
      </button>
    </div>
  );
}

export default InputCSV;
