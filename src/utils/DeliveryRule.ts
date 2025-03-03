export default class DeliveryRule {
  deliveryNature: string;
  deliveryFee: number;

  constructor(deliveryNature: string, deliveryFee: number) {
    this.deliveryNature = deliveryNature;
    this.deliveryFee = deliveryFee;
  }
}
