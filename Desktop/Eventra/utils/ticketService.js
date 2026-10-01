const Ticket = require('../models/Ticket');
const { generateTicketQRCode } = require('./qrCode');

/**
 * Creates a new ticket after payment, generates its QR code, and saves it.
 * Order matters: create the ticket row first, generate QR using its ID, then update.
 */
async function createTicket(bookingId, ticketTypeId, eventId) {
  // 1. Generate a random ticket code
  const code = 'EVT-' + Math.floor(100000 + Math.random() * 900000);

  // 2. Create the ticket row first in the database
  const ticket = await Ticket.create({
    booking_id: bookingId,
    ticket_type_id: ticketTypeId,
    ticket_code: code,
  });

  // 3. Generate the QR code using the new ticket's ID and event ID
  const qr = await generateTicketQRCode(ticket.id, eventId);
  
  // 4. Attach the QR code URL and content to the ticket and save
  ticket.qr_code_url = qr.dataUrl;
  ticket.qr_content = qr.content;
  await ticket.save();

  return ticket;
}

module.exports = { createTicket };