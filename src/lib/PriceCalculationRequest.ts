import Attribute from "@/utils/Attribute";

export default class PriceCalculationRequest {
  productName: string;
  quantity: number;
  selectedAttributes: Attribute[];
  deliveryMethod: string;

  constructor(
    productName: string,
    quantity: number,
    selectedAttributes: Attribute[],
    deliveryMethod: string
  ) {
    this.productName = productName;
    this.quantity = quantity;
    this.selectedAttributes = selectedAttributes;
    this.deliveryMethod = deliveryMethod;
  }
}
