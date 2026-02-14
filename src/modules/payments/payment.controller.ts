import { Request, Response } from "express";
import * as paymentService from "./payment.service";

// 1. Initiate Payment
export const initiatePayment = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.body;
        const order = await paymentService.createPaymentOrder(bookingId);

        res.status(200).json({
            success: true,
            message: "Payment Order Created",
            data: order
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// 2. Verify Payment
export const verifyPayment = async (req: Request, res: Response) => {
    try {
        const result = await paymentService.verifyPaymentSignature(req.body);

        res.status(200).json({
            success: true,
            message: "Payment Verified Successfully!",
            data: result
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};