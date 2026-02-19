import { PrismaClient, TourStatus, BookingStatus, PaymentStatus, Role, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import redis from "../src/app/redis";

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting Database Seeding...');

    // ==========================================
    // 0. CLEANUP (Order matters for Foreign Keys!)
    // ==========================================
    // We delete children first, then parents
    try {
        await prisma.review.deleteMany();
        await prisma.blog.deleteMany();     // 👈 Added Blog cleanup
        await prisma.booking.deleteMany();
        await prisma.tour.deleteMany();
        await prisma.user.deleteMany();
        await prisma.systemSettings.deleteMany();
        console.log('🧹 Old data cleared');
    } catch (error) {
        console.log('⚠️ Cleanup skipped or partial (first run)');
    }

    // ==========================================
    // 1. SYSTEM SETTINGS
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

    // A. Super Admin (Will author the blogs)
    const admin = await prisma.user.create({
        data: {
            userName: 'Super Admin',
            userEmail: 'admin@ddtours.com',
            password: hashedPassword,
            phoneNumber: '+919000000000',
            role: Role.ADMIN,
            userAddress: 'Headquarters, Kolkata, WB'
        },
    });

    // B. User 1 (Rahul)
    const user1 = await prisma.user.create({
        data: {
            userName: 'Rahul Sharma',
            userEmail: 'rahul@gmail.com',
            password: hashedPassword,
            phoneNumber: '+919988776655',
            role: Role.USER,
            userAddress: 'Salt Lake Sector V, Kolkata'
        },
    });

    // C. User 2 (Priya)
    const user2 = await prisma.user.create({
        data: {
            userName: 'Priya Verma',
            userEmail: 'priya@gmail.com',
            password: hashedPassword,
            phoneNumber: '+918877665544',
            role: Role.USER,
            userAddress: 'Indiranagar, Bangalore'
        },
    });

    console.log('✅ Users Created');

    // ==========================================
    // 3. TOUR DATA
    // ==========================================

    // Tour 1: Manali
    const tour1 = await prisma.tour.create({
        data: {
            tourTitle: 'Majestic Manali Escape',
            slug: 'majestic-manali-escape',
            tourDuration: '5 Days / 4 Nights',
            tourDescription: 'Experience the snow-capped mountains and vibrant culture of Manali. Includes stay, food, and Volvo bus.',
            tourPrice: 12000,
            startLocation: 'Delhi',
            tourCategory: 'Adventure',
            expectedMonth: 'December',
            isFixedDate: false,
            coveredPlaces: ['Hadimba Temple', 'Solang Valley', 'Rohtang Pass'],
            includedItems: ['Breakfast', 'Dinner', 'Hotel Stay', 'Volvo Bus'],
            images: ['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&q=80'],
            tourStatus: TourStatus.UPCOMING,
            maxSeats: 30,
            availableSeats: 28,
        },
    });

    // Tour 2: Goa
    const tour2 = await prisma.tour.create({
        data: {
            tourTitle: 'Goa Beach Party',
            slug: 'goa-beach-party-2026',
            tourDuration: '4 Days / 3 Nights',
            tourDescription: 'Sun, Sand, and Sea! Enjoy the best beaches of North Goa with a private cruise party.',
            tourPrice: 15000,
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

    console.log('✅ Tours Created');

    // ==========================================
    // 4. BLOG DATA (🆕 NEW SECTION)
    // ==========================================

    await prisma.blog.create({
        data: {
            title: '10 Hidden Gems in Manali You Must Visit',
            slug: '10-hidden-gems-in-manali',
            content: 'Manali is not just about Mall Road and Solang Valley. Explore the hidden waterfalls and ancient temples...',
            excerpt: 'Discover the secret spots of Manali that tourists often miss.',
            category: 'Travel Tips',
            tags: ['Manali', 'Solo Travel', 'Mountains'],
            coverImage: 'https://images.unsplash.com/photo-1593182440959-9d5165b29b59?auto=format&fit=crop&q=80',
            youtubeUrl: 'https://youtu.be/dummy-video-id',
            isPublished: true,
            views: 125,
            authorId: admin.userId // Link to Admin
        }
    });

    await prisma.blog.create({
        data: {
            title: 'Why Goa in November is a Vibe',
            slug: 'why-goa-in-november',
            content: 'November marks the beginning of the party season in Goa. The weather is perfect and the clubs are buzzing...',
            excerpt: 'Planning a winter trip? Here is why Goa should be your top choice.',
            category: 'Destinations',
            tags: ['Goa', 'Party', 'Beach'],
            coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80',
            facebookUrl: 'https://facebook.com/watch/dummy-video',
            isPublished: true,
            views: 89,
            authorId: admin.userId
        }
    });

    console.log('✅ Blogs Created');

    // ==========================================
    // 5. BOOKING DATA
    // ==========================================

    await prisma.booking.create({
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

    await prisma.booking.create({
        data: {
            userId: user2.userId,
            tourId: tour1.tourId,
            totalGuests: 1,
            totalPrice: 12000,
            guestDetails: [{ name: 'Priya Verma', age: 24, gender: 'Female' }],
            bookingStatus: BookingStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            paymentMethod: PaymentMethod.CREDIT_CARD,
            bookingDate: new Date()
        },
    });

    console.log('✅ Bookings Created');

    // ==========================================
    // 6. REVIEW DATA
    // ==========================================

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

    console.log('🧹 Flushing Redis Cache...');
        await redis.flushall();
    console.log('✨ Cache Cleared!');

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