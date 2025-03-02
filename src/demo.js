"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Attribute_1 = require("@utils/Attribute");
var DeliveryRule_1 = require("@utils/DeliveryRule");
var PriceCalculationRequest_1 = require("./lib/PriceCalculationRequest");
var PricingEngine_1 = require("./lib/PricingEngine");
var PricingRule_1 = require("@utils/PricingRule");
var Product_1 = require("@utils/Product");
var QuantityPricing_1 = require("@utils/QuantityPricing");
// Example Usage
var product = new Product_1.default("Laptop", [new PricingRule_1.default("Color", "Red", 10)], [new DeliveryRule_1.default("express", 20)], [new QuantityPricing_1.default(1, 1000), new QuantityPricing_1.default(5, 4500), new QuantityPricing_1.default(10, 8000)]);
var pricingEngine = new PricingEngine_1.default(product);
var request = new PriceCalculationRequest_1.default("Laptop", 5, [new Attribute_1.default("Color", "Red")], "express");
var totalPrice = pricingEngine.calculatePrice(request);
console.log("Total price: $".concat(totalPrice));
