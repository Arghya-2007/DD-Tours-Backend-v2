"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.initiatePayment = void 0;
const paymentService = __importStar(require("./payment.service"));
// 1. Initiate Payment
const initiatePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const order = await paymentService.createPaymentOrder(bookingId);
        res.status(200).json({
            success: true,
            message: "Payment Order Created",
            data: order
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.initiatePayment = initiatePayment;
// 2. Verify Payment
const verifyPayment = async (req, res) => {
    try {
        const result = await paymentService.verifyPaymentSignature(req.body);
        res.status(200).json({
            success: true,
            message: "Payment Verified Successfully!",
            data: result
        });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.verifyPayment = verifyPayment;
//# sourceMappingURL=payment.controller.js.map