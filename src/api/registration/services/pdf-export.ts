import PDFDocument from 'pdfkit';

export const generateRegistrationsPDF = (registrations: any[], eventName?: string) => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  // Title
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .text('Event Registrations Report', { align: 'center' });

  doc.moveDown(0.5);

  if (eventName) {
    doc.fontSize(14)
       .font('Helvetica')
       .text(`Event: ${eventName}`, { align: 'center' });
  }

  doc.fontSize(10)
     .font('Helvetica')
     .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });

  doc.moveDown(1);

  // Summary
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text(`Total Registrations: ${registrations.length}`);

  const confirmed = registrations.filter(r => r.payment_status === 'confirmed').length;
  const pending = registrations.filter(r => r.payment_status === 'pending').length;
  const failed = registrations.filter(r => r.payment_status === 'failed').length;

  doc.fontSize(10)
     .font('Helvetica')
     .text(`Confirmed: ${confirmed} | Pending: ${pending} | Failed: ${failed}`);

  doc.moveDown(1);

  // Table header
  const tableTop = doc.y;
  const colWidths = {
    no: 30,
    name: 120,
    email: 150,
    phone: 80,
    status: 70
  };

  doc.fontSize(9)
     .font('Helvetica-Bold');

  let x = 50;
  doc.text('No', x, tableTop, { width: colWidths.no });
  x += colWidths.no;
  doc.text('Name', x, tableTop, { width: colWidths.name });
  x += colWidths.name;
  doc.text('Email', x, tableTop, { width: colWidths.email });
  x += colWidths.email;
  doc.text('Phone', x, tableTop, { width: colWidths.phone });
  x += colWidths.phone;
  doc.text('Status', x, tableTop, { width: colWidths.status });

  // Draw line under header
  doc.moveTo(50, doc.y + 5)
     .lineTo(545, doc.y + 5)
     .stroke();

  doc.moveDown(0.3);

  // Table rows
  doc.fontSize(8)
     .font('Helvetica');

  registrations.forEach((reg, index) => {
    const y = doc.y;

    // Check if we need a new page
    if (y > 700) {
      doc.addPage();
      doc.fontSize(8).font('Helvetica');
    }

    x = 50;
    doc.text((index + 1).toString(), x, y, { width: colWidths.no });
    x += colWidths.no;
    doc.text(`${reg.first_name} ${reg.last_name}`, x, y, { width: colWidths.name });
    x += colWidths.name;
    doc.text(reg.email || '', x, y, { width: colWidths.email });
    x += colWidths.email;
    doc.text(reg.phone || '', x, y, { width: colWidths.phone });
    x += colWidths.phone;

    // Color code payment status
    const statusY = y;
    if (reg.payment_status === 'confirmed') {
      doc.fillColor('green');
    } else if (reg.payment_status === 'pending') {
      doc.fillColor('orange');
    } else {
      doc.fillColor('red');
    }
    doc.text(reg.payment_status || 'N/A', x, statusY, { width: colWidths.status });
    doc.fillColor('black');

    doc.moveDown(0.5);
  });

  // Footer
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(8)
       .font('Helvetica')
       .text(
         `Page ${i + 1} of ${pageCount}`,
         50,
         doc.page.height - 50,
         { align: 'center' }
       );
  }

  doc.end();
  return doc;
};
