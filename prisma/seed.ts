import { PrismaClient, TourStatus, BookingStatus, PaymentStatus, Role, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Database Seeding...');

    // ==========================================
    // 0. CLEANUP (Optional: Clear old data to avoid duplicates)
    // ==========================================
     await prisma.review.deleteMany();
     await prisma.booking.deleteMany();
     await prisma.tour.deleteMany();
     await prisma.user.deleteMany();
     await prisma.systemSettings.deleteMany();
     console.log('🧹 Old data cleared');

    // ==========================================
    // 1. SYSTEM SETTINGS (New Feature)
    // ==========================================
    await prisma.systemSettings.upsert({
        where: { id: 'global_settings' },
        update: {},
        create: {
            id: 'global_settings',
            siteName: 'DD Tours & Travels',
            supportEmail: 'admin@ddtours.com',
            supportPhone: '+91-9876543210',
            currency: 'INR',
            taxRate: 18.0
        }
    });
    console.log('✅ System Settings Initialized');

    // ==========================================
    // 2. USERS & ADMIN DATA
    // ==========================================
    const hashedPassword = await bcrypt.hash('password123', 10);

    // A. Super Admin
    const admin = await prisma.user.upsert({
        where: { userEmail: 'admin@ddtours.com' },
        update: {},
        create: {
            userName: 'Super Admin',
            userEmail: 'admin@ddtours.com',
            password: hashedPassword,
            phoneNumber: '+919000000000',
            role: Role.ADMIN,
            userAddress: 'Headquarters, Kolkata, WB'
        },
    });

    // B. User 1 (Rahul)
    const user1 = await prisma.user.upsert({
        where: { userEmail: 'rahul@gmail.com' },
        update: {},
        create: {
            userName: 'Rahul Sharma',
            userEmail: 'rahul@gmail.com',
            password: hashedPassword,
            phoneNumber: '+919988776655',
            role: Role.USER,
            userAddress: 'Salt Lake Sector V, Kolkata' // 👈 New Field
        },
    });

    // C. User 2 (Priya)
    const user2 = await prisma.user.upsert({
        where: { userEmail: 'priya@gmail.com' },
        update: {},
        create: {
            userName: 'Priya Verma',
            userEmail: 'priya@gmail.com',
            password: hashedPassword,
            phoneNumber: '+918877665544',
            role: Role.USER,
            userAddress: 'Indiranagar, Bangalore' // 👈 New Field
        },
    });

    console.log('✅ Users Created');

    // ==========================================
    // 3. TOUR DATA
    // ==========================================

    // Tour 1: Manali (Adventure)
    const tour1 = await prisma.tour.upsert({
        where: { slug: 'majestic-manali-escape' },
        update: {},
        create: {
            tourTitle: 'Majestic Manali Escape',
            slug: 'majestic-manali-escape',
            tourDuration: '5 Days / 4 Nights',
            tourDescription: 'Experience the snow-capped mountains and vibrant culture of Manali. Includes stay, food, and Volvo bus.',
            tourPrice: 12000,

            // 🆕 New Fields
            startLocation: 'Delhi',
            tourCategory: 'Adventure',

            expectedMonth: 'December',
            isFixedDate: false,

            coveredPlaces: ['Hadimba Temple', 'Solang Valley', 'Rohtang Pass'],
            includedItems: ['Breakfast', 'Dinner', 'Hotel Stay', 'Volvo Bus'],
            images: [
                'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1593182440959-9d5165b29b59?auto=format&fit=crop&q=80'
            ],

            tourStatus: TourStatus.UPCOMING,
            maxSeats: 30,
            availableSeats: 28, // Reduced for testing booking logic
        },
    });

    // Tour 2: Goa (Relaxation)
    const tour2 = await prisma.tour.upsert({
        where: { slug: 'goa-beach-party-2026' },
        update: {},
        create: {
            tourTitle: 'Goa Beach Party',
            slug: 'goa-beach-party-2026',
            tourDuration: '4 Days / 3 Nights',
            tourDescription: 'Sun, Sand, and Sea! Enjoy the best beaches of North Goa with a private cruise party.',
            tourPrice: 15000,

            // 🆕 New Fields
            startLocation: 'Mumbai',
            tourCategory: 'Relaxation',

            isFixedDate: true,
            fixedDate: new Date('2026-11-15T00:00:00Z'),
            bookingDeadline: new Date('2026-11-01T00:00:00Z'),

            coveredPlaces: ['Baga Beach', 'Calangute', 'Fort Aguada'],
            includedItems: ['Breakfast', 'Scooty Rental', 'Cruise Ticket'],
            images: ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80'],

            tourStatus: TourStatus.UPCOMING,
            maxSeats: 20,
            availableSeats: 20,
        },
    });

    // Tour 3: Kedarnath (Pilgrimage)
    const tour3 = await prisma.tour.upsert({
        where: { slug: 'kedarnath-yatra' },
        update: {},
        create: {
            tourTitle: 'Divine Kedarnath Yatra',
            slug: 'kedarnath-yatra',
            tourDuration: '6 Days / 5 Nights',
            tourDescription: 'A spiritual journey to one of the holiest shrines of Lord Shiva.',
            tourPrice: 18000,

            // 🆕 New Fields
            startLocation: 'Haridwar',
            tourCategory: 'Pilgrimage',

            expectedMonth: 'May',
            isFixedDate: false,

            coveredPlaces: ['Guptkashi', 'Kedarnath Temple', 'Rishikesh'],
            includedItems: ['Vegetarian Meals', 'Hotel', 'Guide'],
            images: ['https://images.unsplash.com/photo-1623164478200-c9a785312386?auto=format&fit=crop&q=80'],

            tourStatus: TourStatus.UPCOMING,
            maxSeats: 15,
            availableSeats: 15,
        },
    });

    console.log('✅ Tours Created');

    // ==========================================
    // 4. BOOKING DATA
    // ==========================================

    // Booking 1: Rahul books Manali (Confirmed & Paid)
    // We check if exists first to avoid duplicate errors on re-seed
    const booking1 = await prisma.booking.create({
        data: {
            userId: user1.userId,
            tourId: tour1.tourId,
            totalGuests: 2,
            totalPrice: 24000,
            guestDetails: [
                { name: 'Rahul Sharma', age: 28, gender: 'Male' },
                { name: 'Sneha Sharma', age: 26, gender: 'Female' }
            ],
            bookingStatus: BookingStatus.CONFIRMED,
            paymentStatus: PaymentStatus.COMPLETED,
            paymentMethod: PaymentMethod.UPI,
            transactionId: 'txn_123456789',
            bookingDate: new Date()
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
            paymentMethod: PaymentMethod.CREDIT_CARD,
            bookingDate: new Date()
        },
    });

    console.log('✅ Bookings Created');

    // ==========================================
    // 5. REVIEW DATA (New Feature)
    // ==========================================

    // Review 1: Rahul reviews Manali (Since he is Confirmed)
    await prisma.review.create({
        data: {
            userId: user1.userId,
            tourName: tour1.tourTitle,
            rating: 5,
            reviewText: "Absolutely amazing experience! The bus was comfortable and the hotels were top notch.",
            photoUrl: "https://example.com/user-trip-photo.jpg",
            createdAt: new Date()
        }
    });

    console.log('✅ Reviews Created');
    console.log('🚀 Seeding Completed Successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });