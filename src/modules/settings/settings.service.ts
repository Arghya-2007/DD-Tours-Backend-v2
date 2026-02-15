import prisma from "../../app/database";

// 1. GET SETTINGS (With Auto-Create Logic)
export const getSettingsFromDB = async () => {
    // Try to find the single row
    let settings = await prisma.systemSettings.findUnique({
        where: { id: "global_settings" }
    });

    // If it doesn't exist (first time running app), create it!
    if (!settings) {
        settings = await prisma.systemSettings.create({
            data: {
                id: "global_settings",
                siteName: "DD Tours & Travels",
                supportEmail: "support@ddtours.com",
                supportPhone: "+91-9876543210",
                currency: "INR",
                taxRate: 18.0
            }
        });
    }

    return settings;
};

// 2. UPDATE SETTINGS
export const updateSettingsInDB = async (payload: any) => {
    // We only update specific fields allowed by the frontend
    // We don't want users to accidentally change the ID
    const { id, ...dataToUpdate } = payload;

    return prisma.systemSettings.update({
        where: { id: "global_settings" },
        data: dataToUpdate
    });
};