import { NextResponse } from "next/server";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
dotenv.config();

// Get All Products with Vendors
export async function GET() {
  try {
    // Get the absolute path to the JSON file
    // This assumes the file is in the src/data directory relative to the project root
    const filePath = path.join(
      process.cwd(),
      "src",
      "data",
      "deliverySlots.json"
    );

    // Read the file asynchronously
    const fileContents = await fs.readFile(filePath, "utf-8");

    // Parse the JSON contents
    const deliveryMethods = JSON.parse(fileContents);

    return NextResponse.json(deliveryMethods, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
