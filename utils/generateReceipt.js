const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReceipt = async ({
  repaymentId,
  customerName,
  loanDescription,
  amount,
  paymentDate,
  remainingBalance,
  shopName,
}) => {
  const doc = new PDFDocument({ size: 'A5', margin: 50 });
  const tempFilePath = path.join(__dirname, '../receipts', `${repaymentId}.pdf`);

  if (!fs.existsSync(path.join(__dirname, '../receipts'))) {
    fs.mkdirSync(path.join(__dirname, '../receipts'));
  }

  const stream = fs.createWriteStream(tempFilePath);
  doc.pipe(stream);

  // PDF Content
  doc.fontSize(20).text(shopName, { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text('Payment Receipt', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Receipt ID: ${repaymentId}`);
  doc.text(`Date: ${paymentDate.toLocaleDateString()}`);
  doc.text(`Customer: ${customerName}`);
  doc.text(`Loan Description: ${loanDescription}`);
  doc.moveDown();

  doc.fontSize(14).text('Payment Details', { underline: true });
  doc.moveDown();
  doc.text(`Amount Paid: ₹${amount.toFixed(2)}`);
  doc.text(`Remaining Balance: ₹${remainingBalance.toFixed(2)}`);
  doc.moveDown();

  doc.fontSize(10).text('Thank you for your payment!', { align: 'center' });
  doc.text('This is an electronically generated receipt.', {
    align: 'center',
  });

  doc.end();
  await new Promise((resolve) => stream.on('finish', resolve));
  return fs.createReadStream(tempFilePath);
};

module.exports = generateReceipt;