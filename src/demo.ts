import Attribute from "@utils/Attribute";
import DeliveryRule from "@utils/DeliveryRule";
import PriceCalculationRequest from "./lib/PriceCalculationRequest";
import PricingEngine from "./lib/PricingEngine";
import PricingRule from "@utils/PricingRule";
import Product from "@utils/Product";
import QuantityPricing from "@utils/QuantityPricing";

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
