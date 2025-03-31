import { connectDB } from "@/lib/db";
import Vendor from "@/models/Vendor";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { vendors } = await req.json();

    if (!vendors || !Array.isArray(vendors) || vendors.length === 0) {
      return NextResponse.json(
        { message: "Missing or invalid vendor data" },
        { status: 400 }
      );
    }

    // Check for duplicate emails in the database
    const existingEmails = await Vendor.find({
      email: { $in: vendors.map((v) => v.email) },
    }).distinct("email");

    if (existingEmails.length > 0) {
      return NextResponse.json(
        { message: "Some emails are already taken", existingEmails },
        { status: 422 }
      );
    }

    // Save multiple vendors
    const savedVendors = await Vendor.insertMany(vendors);

    return NextResponse.json(
      { message: "Vendors created", vendors: savedVendors },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving vendors:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error },
      { status: 500 }
    );
  }
}
