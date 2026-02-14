import { PrismaClient, TourStatus, BookingStatus, PaymentStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../src/app/database';

async function main() {
    console.log('🌱 Starting Seeding...');

    // ==========================================
    // 1. USERS & ADMIN DATA
    // ==========================================
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create Admin (No need to store in variable if not using it)
    await prisma.user.upsert({
        where: { userEmail: 'admin@ddtours.com' },
        update: {},
        create: {
            userName: 'Super Admin',
            userEmail: 'admin@ddtours.com',
            password: hashedPassword,
            phoneNumber: '+919876543210',
            role: Role.ADMIN,
        },
    });

    // Create User 1
    const user1 = await prisma.user.upsert({
        where: { userEmail: 'rahul@gmail.com' },
        update: {},
        create: {
            userName: 'Rahul Sharma',
            userEmail: 'rahul@gmail.com',
            password: hashedPassword,
            phoneNumber: '+919988776655',
            role: Role.USER,
        },
    });

    // Create User 2
    const user2 = await prisma.user.upsert({
        where: { userEmail: 'priya@gmail.com' },
        update: {},
        create: {
            userName: 'Priya Verma',
            userEmail: 'priya@gmail.com',
            password: hashedPassword,
            phoneNumber: '+918877665544',
            role: Role.USER,
        },
    });

    console.log('✅ Users Created');

    // ==========================================
    // 2. TOUR DATA
    // ==========================================
    const tour1 = await prisma.tour.create({
        data: {
            tourTitle: 'Majestic Manali Escape',
            slug: 'majestic-manali-escape',
            tourDuration: '5 Days / 4 Nights',
            tourDescription: 'Experience the snow-capped mountains and vibrant culture of Manali. Includes stay, food, and Volvo bus.',
            tourPrice: 12000,
            expectedMonth: 'December',
            isFixedDate: false,
            coveredPlaces: ['Hadimba Temple', 'Solang Valley', 'Rohtang Pass'],
            includedItems: ['Breakfast', 'Dinner', 'Hotel Stay', 'Volvo Bus'],
            images: ['https://example.com/manali1.jpg', 'https://example.com/manali2.jpg'],
            tourStatus: TourStatus.UPCOMING,
            maxSeats: 30,
            availableSeats: 28, // We will book 2 seats below
        },
    });

    // Create Tour 2 (No variable needed)
    await prisma.tour.create({
        data: {
            tourTitle: 'Goa Beach Party',
            slug: 'goa-beach-party-2026',
            tourDuration: '4 Days / 3 Nights',
            tourDescription: 'Sun, Sand, and Sea! Enjoy the best beaches of North Goa with a private cruise party.',
            tourPrice: 15000,
            isFixedDate: true,
            fixedDate: new Date('2026-11-15'),
            bookingDeadline: new Date('2026-11-01'),
            coveredPlaces: ['Baga Beach', 'Calangute', 'Fort Aguada'],
            includedItems: ['Breakfast', 'Scooty Rental', 'Cruise Ticket'],
            images: ['https://example.com/goa1.jpg'],
            tourStatus: TourStatus.UPCOMING,
            maxSeats: 20,
            availableSeats: 20,
        },
    });

    console.log('✅ Tours Created');

    // ==========================================
    // 3. BOOKING DATA (Linking User & Tour)
    // ==========================================

    // Booking 1: Rahul books Manali (Confirmed & Paid)
    await prisma.booking.create({
        data: {
            userId: user1.userId,
            tourId: tour1.tourId,
            totalGuests: 2,
            totalPrice: 24000, // 12000 * 2
            guestDetails: [
                { name: 'Rahul Sharma', age: 28, gender: 'Male' },
                { name: 'Sneha Sharma', age: 26, gender: 'Female' }
            ],
            bookingStatus: BookingStatus.CONFIRMED,
            paymentStatus: PaymentStatus.COMPLETED,
            paymentMethod: 'UPI',
            transactionId: 'txn_123456789',
        },
    });

    // Booking 2: Priya books Manali (Pending)
    await prisma.booking.create({
        data: {
            userId: user2.userId,
            tourId: tour1.tourId,
            totalGuests: 1,
            totalPrice: 12000,
            guestDetails: [
                { name: 'Priya Verma', age: 24, gender: 'Female' }
            ],
            bookingStatus: BookingStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            paymentMethod: 'CREDIT_CARD',
        },
    });

    console.log('✅ Bookings Created');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });