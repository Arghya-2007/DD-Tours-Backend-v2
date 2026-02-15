import { Request, Response } from "express";
import * as settingsService from "./settings.service"; // Import the file we just made

export const getSettings = async (req: Request, res: Response) => {
    try {
        const result = await settingsService.getSettingsFromDB();
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSettings = async (req: Request, res: Response) => {
    try {
        const result = await settingsService.updateSettingsInDB(req.body);
        res.status(200).json({ success: true, message: "Settings updated!", data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};