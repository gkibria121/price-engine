export default class PricingRule {
  attributeName: string;
  attributeValue: string;
  percentageChange: number;

  constructor(attributeName: string, attributeValue: string, percentageChange: number) {
    this.attributeName = attributeName;
    this.attributeValue = attributeValue;
    this.percentageChange = percentageChange;
  }
}
