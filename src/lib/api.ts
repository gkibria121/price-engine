import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Product types
export interface PricingRule {
  attribute: string;
  value: string;
  price: number;
}

export interface DeliveryRule {
  method: string;
  price: number;
}

export interface QuantityPricing {
  minQty: number;
  price: number;
}

export interface Product {
  _id?: string;
  name: string;
}
export interface VendorProduct {
  _id?: string;
  product: Product;
  pricingRules: PricingRule[];
  deliverySlots: DeliveryRule[];
  quantityPricings: QuantityPricing[];
  vendor: Vendor;
}

// Vendor types
export interface Vendor {
  _id?: string;
  name: string;
  email: string;
  address: string;
  rating: number;
}

// API functions for Products
export const getProducts = async (): Promise<Product[]> => {
  const response = await axios.get(`${API_URL}/api/products`);
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await axios.get(`${API_URL}/api/products/${id}`);
  return response.data;
};

export const createProduct = async (
  vendorId: string,
  product: Product
): Promise<Product> => {
  const response = await axios.post(`${API_URL}/api/products`, {
    vendorId,
    ...product,
  });
  return response.data;
};

export const createVendorProduct = async (
  vendorProduct: VendorProduct
): Promise<Product> => {
  console.log(vendorProduct);
  const response = await axios.post(`${API_URL}/api/vendor-products`, {
    ...vendorProduct,
  });
  return response.data;
};
export const updateProduct = async (
  id: string,
  product: Product
): Promise<Product> => {
  const response = await axios.put(`${API_URL}/api/products/${id}`, product);
  return response.data;
};
export const updateVendorProduct = async (
  vendorProduct: VendorProduct
): Promise<Product> => {
  const response = await axios.put(
    `${API_URL}/api/vendor-products/${vendorProduct._id}`,
    vendorProduct
  );
  return response.data;
};
// API functions for Vendors
export const getVendors = async (): Promise<Vendor[]> => {
  const response = await axios.get(`${API_URL}/api/vendors`);
  console.log(response);
  return response.data.vendors;
};

export const createVendor = async (vendor: Vendor): Promise<Vendor> => {
  const response = await axios.post(`${API_URL}/api/vendors`, vendor);
  return response.data;
};

// Calculate price
export interface PriceCalculationRequest {
  productId: string;
  vendorId: string;
  quantity: number;
  attributes: { name: string; value: string }[];
  deliveryMethod: string;
}

export interface PriceCalculationResponse {
  productName: string;
  quantity: number;
  totalPrice: number;
}

export const calculatePrice = async (
  request: PriceCalculationRequest
): Promise<PriceCalculationResponse> => {
  const response = await axios.post(`${API_URL}/api/calculate-price`, request);
  return response.data;
};
