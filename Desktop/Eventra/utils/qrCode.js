var QRCode = require('qrcode');

// crypto is built into Node.js - no installation needed
// It provides cryptographic functions including HMAC
var crypto = require('crypto');

// generateTicketQRCode creates a QR code image for one ticket
// ticketId: the UUID of the ticket from the database
// eventId: the UUID of the event this ticket belongs to
async function generateTicketQRCode(ticketId, eventId) {

    // Build the data object we will encode into the QR code
    var qrData = {
        ticketId: ticketId,
        eventId: eventId,
        issuedAt: Math.floor(Date.now() / 1000)   // Unix timestamp in seconds
    };

    // Create a security checksum using HMAC-SHA256
    // HMAC uses our JWT_SECRET as a key to produce a signature
    // Without the secret key, it's impossible to produce the same checksum
    // This prevents anyone from creating a fake QR code
    var checksum = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(JSON.stringify(qrData))    // Convert object to string, then hash it
        .digest('hex')                     // Get result as hexadecimal string
        .slice(0, 16);                     // Take first 16 chars to keep QR size small

    qrData.checksum = checksum;

    // JSON.stringify converts the object to a string
    // This string is what gets encoded into the QR image
    var qrContent = JSON.stringify(qrData);

    // Generate the QR code as a base64 data URL
    // A data URL can be embedded directly in email HTML or displayed in an img tag
    // No need to save a file to disk - the data is in the URL itself
    var qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
        errorCorrectionLevel: 'H',   // H = can recover if 30% of the QR is damaged
        type: 'image/png',
        width: 400                   // Width in pixels
    });

    return {
        dataUrl: qrCodeDataUrl,      // Embed in email or display on screen
        content: qrContent           // Store in database - needed for validation
    };
}

// validateQRChecksum checks whether a scanned QR code is genuine
// scannedContent: the JSON string that the camera decoded from the QR
function validateQRChecksum(scannedContent) {
    try {
        var data = JSON.parse(scannedContent);

        // Rebuild the checksum from the scanned data
        // We must use the same fields in the same order as when we generated it
        var dataWithoutChecksum = {
            ticketId: data.ticketId,
            eventId: data.eventId,
            issuedAt: data.issuedAt
        };

        var expectedChecksum = crypto
            .createHmac('sha256', process.env.JWT_SECRET)
            .update(JSON.stringify(dataWithoutChecksum))
            .digest('hex')
            .slice(0, 16);

        // If they match, the QR code is genuine and was created by our system
        return data.checksum === expectedChecksum;

    } catch (err) {
        // JSON.parse throws if the string is malformed
        // Return false - the QR code is invalid
        return false;
    }
}

module.exports = {
    generateTicketQRCode: generateTicketQRCode,
    validateQRChecksum: validateQRChecksum
};