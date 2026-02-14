import { Request, Response } from "express";
import * as adminService from "./admin.service";

export const getStats = async (req: Request, res: Response) => {
    try {
        const result = await adminService.getDashboardStats();

        res.status(200).json({
            success: true,
            message: "Admin Dashboard Stats Fetched Successfully",
            data: result,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};