import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order, Shop } from '../types';

/**
 * Downloads a high-quality PDF invoice for an order.
 * Tries DOM capture via html2canvas first; if not available or fails, falls back to direct vector jsPDF generation.
 */
export async function downloadInvoicePDF(
  order: Order,
  shop: Shop,
  elementId?: string
): Promise<boolean> {
  try {
    if (elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const imgWidth = 190;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`Invoice-${order.orderNumber}.pdf`);
        return true;
      }
    }

    // Direct vector jsPDF fallback
    generateVectorPDF(order, shop);
    return true;
  } catch (err) {
    console.warn('html2canvas capture failed, falling back to direct vector PDF generator:', err);
    try {
      generateVectorPDF(order, shop);
      return true;
    } catch (fallbackErr) {
      console.error('Vector PDF generation also failed:', fallbackErr);
      // Fallback to print window if all fails
      printInvoiceDocument(order, shop);
      return false;
    }
  }
}

/**
 * Direct vector jsPDF generator (Fast, clean, zero-dependency on DOM/images).
 */
export function generateVectorPDF(order: Order, shop: Shop) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const margin = 15;
  let y = 20;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, 180, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(shop.shopName || 'KGN SHOP', margin + 6, y + 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const shopSub = `${shop.category || 'Retail'} • Phone: ${shop.phone || ''} • ${shop.city || 'India'}`;
  doc.text(shopSub, margin + 6, y + 17);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', margin + 140, y + 10);
  doc.setFontSize(8);
  doc.text(`#${order.orderNumber}`, margin + 140, y + 17);

  y += 32;

  // Invoice Meta & Customer Details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO:', margin, y);
  doc.text('INVOICE DETAILS:', margin + 110, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`Customer: ${order.customerName}`, margin, y);
  doc.text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, margin + 110, y);

  y += 5;
  doc.text(`Phone: ${order.customerPhone || 'N/A'}`, margin, y);
  doc.text(`Payment Mode: ${(order.paymentMethod || 'UPI').toUpperCase()} (${(order.paymentStatus || 'PAID').toUpperCase()})`, margin + 110, y);

  y += 5;
  doc.text(`Address: ${order.deliveryAddress || 'Store Pickup'}`, margin, y);
  doc.text(`Fulfillment: ${(order.deliveryType || 'DELIVERY').toUpperCase()}`, margin + 110, y);

  y += 10;

  // Items Table Header
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(margin, y, 180, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600

  doc.text('#', margin + 3, y + 5);
  doc.text('ITEM DESCRIPTION', margin + 12, y + 5);
  doc.text('QTY', margin + 105, y + 5);
  doc.text('PRICE', margin + 130, y + 5);
  doc.text('TOTAL', margin + 160, y + 5);

  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);

  // Table rows
  order.items.forEach((item, index) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    doc.text(`${index + 1}`, margin + 3, y);
    const itemName = doc.splitTextToSize(item.name, 88);
    doc.text(itemName, margin + 12, y);
    doc.text(`${item.quantity} ${item.unit || ''}`, margin + 105, y);
    doc.text(`₹${item.price.toFixed(2)}`, margin + 130, y);
    doc.text(`₹${item.total.toFixed(2)}`, margin + 160, y);

    const rowHeight = Math.max(7, itemName.length * 4.5);
    y += rowHeight;

    // Row divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y - 2, margin + 180, y - 2);
  });

  y += 4;

  // Calculation Summary box
  doc.setFillColor(248, 250, 252);
  doc.rect(margin + 100, y, 80, 32, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin + 100, y, 80, 32, 'S');

  doc.setFontSize(8.5);
  doc.text('Subtotal:', margin + 105, y + 6);
  doc.text(`₹${order.subtotal.toFixed(2)}`, margin + 160, y + 6);

  if (order.discount > 0) {
    doc.setTextColor(16, 185, 129); // emerald-600
    doc.text('Discount:', margin + 105, y + 12);
    doc.text(`-₹${order.discount.toFixed(2)}`, margin + 160, y + 12);
  }

  doc.setTextColor(71, 85, 105);
  doc.text('Delivery Fee:', margin + 105, y + 18);
  const feeLabel = (order.deliveryFee && order.deliveryFee > 0) 
    ? `₹${order.deliveryFee.toFixed(2)}` 
    : (order.deliveryType === 'delivery' ? 'FREE (₹0.00)' : 'Store Pickup (₹0.00)');
  doc.text(feeLabel, margin + 155, y + 18);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Net Total Paid:', margin + 105, y + 26);
  doc.setFontSize(10);
  doc.text(`₹${order.totalAmount.toFixed(2)}`, margin + 160, y + 26);

  y += 40;

  // Terms & Footer
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Terms & Conditions: Goods once sold are subject to store return policies. Thank you for your business!', margin, y);
  doc.text(`Generated securely by KGN SHOP Cloud SaaS • Shop UPI: ${shop.upiId || 'N/A'}`, margin, y + 5);

  doc.save(`Invoice-${order.orderNumber}.pdf`);
}

/**
 * Prints an invoice with clean CSS styling in an isolated iframe or popup window.
 * Ensures compatibility with mobile browsers and iframe sandboxes.
 */
export function printInvoiceDocument(order: Order, shop: Shop) {
  const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tax Invoice - #${order.orderNumber}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; background: #ffffff; padding: 24px; font-size: 13px; line-height: 1.4; }
    .invoice-card { max-width: 680px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px; }
    .shop-title { font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
    .shop-meta { font-size: 11px; color: #64748b; }
    .invoice-tag { text-align: right; }
    .invoice-badge { display: inline-block; background: #0f172a; color: #fff; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; margin-bottom: 4px; }
    .invoice-number { font-family: monospace; font-size: 14px; font-weight: 700; color: #0f172a; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin-bottom: 6px; }
    .info-box { font-size: 12px; }
    .info-box strong { color: #0f172a; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #f8fafc; text-align: left; padding: 8px 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    td { padding: 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
    .text-right { text-align: right; }
    .totals { margin-left: auto; width: 260px; margin-bottom: 24px; }
    .totals-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 12px; }
    .grand-total { border-top: 2px solid #0f172a; padding-top: 8px; font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 4px; }
    .footer { text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 16px; font-size: 10px; color: #94a3b8; }
    .print-actions { margin-bottom: 16px; text-align: center; }
    .btn { background: #0f172a; color: white; border: none; padding: 10px 20px; font-size: 13px; font-weight: 700; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
    .btn:hover { background: #1e293b; }
    @media print {
      body { padding: 0; }
      .invoice-card { border: none; padding: 0; width: 100%; max-width: 100%; }
      .print-actions { display: none !important; }
      @page { margin: 12mm; }
    }
  </style>
</head>
<body>
  <div class="print-actions">
    <button class="btn" onclick="window.print()">🖨️ Click to Print / Save as PDF</button>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="shop-title">${shop.shopName}</div>
        <div class="shop-meta">${shop.address ? shop.address + ', ' : ''}${shop.city || 'India'}</div>
        <div class="shop-meta">Phone: ${shop.phone} • UPI: ${shop.upiId || 'N/A'}</div>
      </div>
      <div class="invoice-tag">
        <div class="invoice-badge">TAX INVOICE</div>
        <div class="invoice-number">#${order.orderNumber}</div>
        <div class="shop-meta">${new Date(order.createdAt).toLocaleDateString()}</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="section-title">Billed To</div>
        <div class="info-box">
          <div><strong>${order.customerName}</strong></div>
          <div>${order.customerPhone || ''}</div>
          <div>${order.deliveryAddress || 'Store Pickup'}</div>
        </div>
      </div>
      <div>
        <div class="section-title">Payment & Fulfillment</div>
        <div class="info-box">
          <div>Payment: <strong>${(order.paymentMethod || 'UPI').toUpperCase()}</strong> (${(order.paymentStatus || 'PAID').toUpperCase()})</div>
          <div>Fulfillment: <strong>${(order.deliveryType || 'DELIVERY').toUpperCase()}</strong></div>
          <div>Status: <strong>${(order.orderStatus || 'COMPLETED').toUpperCase()}</strong></div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Price</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (it, idx) => `
          <tr>
            <td style="color: #94a3b8; width: 24px;">${idx + 1}</td>
            <td><strong>${it.name}</strong></td>
            <td class="text-right">${it.quantity} ${it.unit || ''}</td>
            <td class="text-right">₹${it.price}</td>
            <td class="text-right"><strong>₹${it.total}</strong></td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotal:</span>
        <span>₹${order.subtotal}</span>
      </div>
      ${
        order.discount > 0
          ? `
      <div class="totals-row" style="color: #059669;">
        <span>Discount:</span>
        <span>-₹${order.discount}</span>
      </div>
      `
          : ''
      }
      <div class="totals-row">
        <span>Delivery Fee:</span>
        <span>${(order.deliveryFee && order.deliveryFee > 0) ? `₹${order.deliveryFee}` : (order.deliveryType === 'delivery' ? '<strong style="color: #059669;">FREE</strong>' : 'FREE (Pickup)')}</span>
      </div>
      <div class="totals-row grand-total">
        <span>Net Amount Paid:</span>
        <span>₹${order.totalAmount}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for shopping at ${shop.shopName}!</p>
      <p style="margin-top: 4px;">Powered by KGN SHOP Cloud SaaS Platform</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
  `;

  // Create clean iframe or new window for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(invoiceHtml);
    doc.close();

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to popup window:', err);
        const win = window.open('', '_blank');
        if (win) {
          win.document.write(invoiceHtml);
          win.document.close();
        }
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 60000);
      }
    };
  } else {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(invoiceHtml);
      win.document.close();
    }
  }
}

/**
 * Generates an 80mm/58mm thermal POS receipt and invokes print.
 */
export function printThermalReceipt(order: Order, shop: Shop) {
  const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>POS Receipt #${order.orderNumber}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    body { font-family: 'Courier New', Courier, monospace; width: 76mm; padding: 2mm; margin: 0 auto; color: #000; font-size: 11px; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border-bottom: 1px dashed #000; margin: 4px 0; }
    .row { display: flex; justify-content: space-between; margin: 2px 0; }
    .total-row { font-size: 13px; font-weight: bold; margin: 4px 0; }
    @media print {
      body { width: 100%; padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 10px; text-align: center;">
    <button onclick="window.print()" style="padding: 6px 12px; font-weight: bold; background: #000; color: #fff; border-radius: 4px; cursor: pointer;">Print Receipt</button>
  </div>
  <div class="center bold" style="font-size: 14px;">${shop.shopName}</div>
  <div class="center" style="font-size: 10px;">${shop.address || shop.city || ''}</div>
  <div class="center" style="font-size: 10px;">Tel: ${shop.phone}</div>
  <div class="divider"></div>
  <div class="center bold">TAX INVOICE / CASH MEMO</div>
  <div class="row"><span>Bill: #${order.orderNumber}</span><span>${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
  <div class="row"><span>Date: ${new Date(order.createdAt).toLocaleDateString()}</span><span>Mode: ${(order.paymentMethod || 'CASH').toUpperCase()}</span></div>
  <div class="row"><span>Customer: ${order.customerName}</span></div>
  <div class="divider"></div>
  <div class="row bold"><span>ITEM</span><span>QTY x RATE</span><span>AMT</span></div>
  <div class="divider"></div>
  ${order.items.map(it => `
    <div class="row">
      <span style="max-width: 38mm; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${it.name}</span>
      <span>${it.quantity} x ${it.price}</span>
      <span class="bold">₹${it.total}</span>
    </div>
  `).join('')}
  <div class="divider"></div>
  <div class="row"><span>Subtotal:</span><span>₹${order.subtotal}</span></div>
  ${order.discount > 0 ? `<div class="row"><span>Discount:</span><span>-₹${order.discount}</span></div>` : ''}
  <div class="divider"></div>
  <div class="row total-row"><span>NET TOTAL:</span><span>₹${order.totalAmount}</span></div>
  <div class="divider"></div>
  <div class="center" style="font-size: 10px; margin-top: 4px;">Thank you! Visit Again!</div>
  <div class="center" style="font-size: 9px;">KGN SHOP POS</div>
  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 250);
    };
  </script>
</body>
</html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(receiptHtml);
    doc.close();

    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('Iframe thermal print failed:', e);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 60000);
      }
    };
  }
}
