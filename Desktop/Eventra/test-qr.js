require('dotenv').config();

if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'my_temporary_test_secret_key';
}

const { generateTicketQRCode, validateQRChecksum } = require('./utils/qrCode');

async function runQRTest() {
  console.log('--- Starting QR Utility Test ---\n');

  const dummyTicketId = '123e4567-e89b-12d3-a456-426614174000';
  const dummyEventId = '987f6543-e21b-32d1-a456-426614174000';

  console.log('1. Generating QR code and saving image...');
  
  // ---> PASSING THE FILENAME AS THE 3RD ARGUMENT HERE <---
  const qrResult = await generateTicketQRCode(
    dummyTicketId, 
    dummyEventId, 
    'my-custom-ticket-code.png'
  );

  console.log('-> Generated Content string:', qrResult.content);
  console.log('-> Generated Data URL length:', qrResult.dataUrl.length);
  console.log('-> Image automatically saved to disk!');

  console.log('\n2. Validating genuine QR content...');
  const isValid = validateQRChecksum(qrResult.content);
  console.log('-> Result (Expected: true):', isValid);

  console.log('\n3. Validating tampered QR content...');
  const tamperedContent = qrResult.content + 'fake-characters';
  const isTamperedValid = validateQRChecksum(tamperedContent);
  console.log('-> Result (Expected: false):', isTamperedValid);

  console.log('\n--- Test Complete ---');
}

runQRTest();