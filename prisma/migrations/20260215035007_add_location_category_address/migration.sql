-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TourStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'UPI', 'NET_BANKING', 'OFFLINE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "aadharNumber" TEXT,
    "dob" TIMESTAMP(3),
    "userAddress" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Tour" (
    "tourId" TEXT NOT NULL,
    "tourTitle" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tourDuration" TEXT NOT NULL,
    "tourDescription" TEXT NOT NULL,
    "tourPrice" DOUBLE PRECISION NOT NULL,
    "startLocation" TEXT,
    "tourCategory" TEXT,
    "expectedMonth" TEXT,
    "isFixedDate" BOOLEAN NOT NULL DEFAULT false,
    "fixedDate" TIMESTAMP(3),
    "bookingDeadline" TIMESTAMP(3),
    "coveredPlaces" TEXT[],
    "includedItems" TEXT[],
    "images" TEXT[],
    "tourStatus" "TourStatus" NOT NULL DEFAULT 'UPCOMING',
    "maxSeats" INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("tourId")
);

-- CreateTable
CREATE TABLE "Booking" (
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "totalGuests" INTEGER NOT NULL,
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "guestDetails" JSONB,
    "bookingStatus" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod",
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentTime" TIMESTAMP(3),
    "paymentId" TEXT,
    "transactionId" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("bookingId")
);

-- CreateTable
CREATE TABLE "Review" (
    "reviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tourName" TEXT NOT NULL,
    "reviewText" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("reviewId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_userEmail_key" ON "User"("userEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Tour_slug_key" ON "Tour"("slug");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("tourId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
