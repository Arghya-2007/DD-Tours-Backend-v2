-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL DEFAULT 'global_settings',
    "siteName" TEXT NOT NULL DEFAULT 'DD Tours & Travels',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@ddtours.com',
    "supportPhone" TEXT NOT NULL DEFAULT '+91-9876543210',
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 18.0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSettings_pkey" PRIMARY KEY ("id")
);
