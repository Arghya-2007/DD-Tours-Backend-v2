"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookingConfirmedTemplate = exports.getBookingReceivedTemplate = void 0;
const getBookingReceivedTemplate = (userName, tourName, bookingId) => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h2 style="color: #2c3e50;">Booking Received! ⏳</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>We have received your booking request for <strong>${tourName}</strong>.</p>
      <p><strong>Booking ID:</strong> ${bookingId}</p>
      <p>Please complete your payment to confirm your seat.</p>
      <a href="http://localhost:3000/payment/${bookingId}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none;">Pay Now</a>
    </div>
  `;
};
exports.getBookingReceivedTemplate = getBookingReceivedTemplate;
const getBookingConfirmedTemplate = (userName, tourName, amount) => {
    return `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; background-color: #f9f9f9;">
      <h2 style="color: #27ae60;">Booking Confirmed! 🎉</h2>
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your payment of <strong>₹${amount}</strong> was successful.</p>
      <p>You are all set for <strong>${tourName}</strong>!</p>
      <p>See you soon!</p>
      <p>- DD Tours Team</p>
    </div>
  `;
};
exports.getBookingConfirmedTemplate = getBookingConfirmedTemplate;
//# sourceMappingURL=emailTemplates.js.map