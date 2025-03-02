"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var QuadraticCurveFitter_1 = require("@utils/QuadraticCurveFitter");
// Pricing Engine
var PricingEngine = /** @class */ (function () {
    function PricingEngine(product) {
        this.curveFitter = new QuadraticCurveFitter_1.default();
        this.pricingRules = product.pricingRules;
        this.deliveryRules = product.deliveryRules;
        this.curveFitter.fit(product.quantityPricing);
    }
    PricingEngine.prototype.calculatePrice = function (request) {
        var _this = this;
        var basePrice = this.curveFitter.predict(request.quantity);
        var total = basePrice;
        request.selectedAttributes.forEach(function (attribute) {
            var rule = _this.pricingRules.find(function (r) { return r.attributeName === attribute.name && r.attributeValue === attribute.selectedValue; });
            if (rule) {
                total += total * (rule.percentageChange / 100);
            }
        });
        var deliveryRule = this.deliveryRules.find(function (r) { return r.deliveryNature.toLowerCase() === request.deliveryMethod.toLowerCase(); });
        if (!deliveryRule) {
            throw new Error("Invalid delivery nature");
        }
        total += deliveryRule.deliveryFee;
        return total;
    };
    return PricingEngine;
}());
exports.default = PricingEngine;
