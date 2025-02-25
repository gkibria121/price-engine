import Attribute from "./Attribute";
import DeliveryRule from "./DeliveryRule";
import PriceCalculationRequest from "./PriceCalculationRequest";
import PricingEngine from "./PricingEngine";
import PricingRule from "./PricingRule";
import Product from "./Product";
import QuantityPricing from "./QuantityPricing";

// Example Usage
const product = new Product(
  "Laptop",
  [new PricingRule("Color", "Red", 10)],
  [new DeliveryRule("express", 20)],
  [new QuantityPricing(1, 1000), new QuantityPricing(5, 4500), new QuantityPricing(10, 8000)]
);

const pricingEngine = new PricingEngine(product);

const request = new PriceCalculationRequest(
  "Laptop",
  5,
  [new Attribute("Color", "Red")],
  "express"
);

const totalPrice = pricingEngine.calculatePrice(request);
console.log(`Total price: $${totalPrice}`);
