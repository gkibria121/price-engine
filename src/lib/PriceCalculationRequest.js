"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PriceCalculationRequest = /** @class */ (function () {
    function PriceCalculationRequest(productName, quantity, selectedAttributes, deliveryMethod) {
        this.productName = productName;
        this.quantity = quantity;
        this.selectedAttributes = selectedAttributes;
        this.deliveryMethod = deliveryMethod;
    }
    return PriceCalculationRequest;
}());
exports.default = PriceCalculationRequest;
