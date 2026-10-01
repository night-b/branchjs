var QRCode = require('qrcode');
var crypto = require('crypto');
var fs = require('fs'); // <--- 1. Require the file system module

// generateTicketQRCode now accepts an optional filename if you want to save it to disk
async function generateTicketQRCode(ticketId, eventId, outputFilename = null) {

    var qrData = {
        ticketId: ticketId,
        eventId: eventId,
        issuedAt: Math.floor(Date.now() / 1000)
    };

    var checksum = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(JSON.stringify(qrData))
        .digest('hex')
        .slice(0, 16);

    qrData.checksum = checksum;
    var qrContent = JSON.stringify(qrData);

    var qrCodeDataUrl = await QRCode.toDataURL(qrContent, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 400
    });

    // --- 2. Optional: If a filename is provided, save it as a physical PNG ---
    if (outputFilename) {
        var base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
        fs.writeFileSync(outputFilename, base64Data, 'base64');
    }

    return {
        dataUrl: qrCodeDataUrl,      // For HTML / Emails
        content: qrContent           // For database storage & validation
    };
}

function validateQRChecksum(scannedContent) {
    try {
        var data = JSON.parse(scannedContent);

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

        return data.checksum === expectedChecksum;

    } catch (err) {
        return false;
    }
}

module.exports = {
    generateTicketQRCode: generateTicketQRCode,
    validateQRChecksum: validateQRChecksum
};