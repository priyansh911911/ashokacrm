import React from 'react';
import jsPDF from 'jspdf';
import logoImg from '../../assets/logo.png';

const LaundryInvoice = ({ invoiceData, onClose, vendors }) => {
  const downloadPDF = () => {
    const printContent = document.getElementById('laundry-invoice-content');
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent.outerHTML;
    
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body { margin: 0; padding: 0; }
        .max-w-4xl { max-width: none !important; width: 100% !important; }
        .border-2 { border: 1px solid black !important; }
        .text-xs { font-size: 10px !important; }
        .text-sm { font-size: 11px !important; }
        .text-base { font-size: 12px !important; }
        .text-lg { font-size: 14px !important; }
        .text-xl { font-size: 16px !important; }
        .p-4 { padding: 8px !important; }
        .p-2 { padding: 4px !important; }
        .mb-1 { margin-bottom: 2px !important; }
        .mb-2 { margin-bottom: 4px !important; }
        .mb-3 { margin-bottom: 6px !important; }
        table { page-break-inside: avoid; }
        .border-black { border-color: black !important; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const downloadInvoicePDF = (order) => {
    const vendor = vendors.find(v => v._id === (typeof order.vendorId === 'object' ? order.vendorId._id : order.vendorId));
    const invoiceNumber = `LAUNDRY-INV-${Date.now()}`;
    
    const doc = new jsPDF();
    
    doc.rect(15, 15, 180, 260);
    doc.rect(15, 15, 180, 50);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoiceNumber}`, 20, 25);
    doc.text('Ashoka hotel', 20, 32);
    doc.text('Deoria Rd, near Hanuman mandir', 20, 38);
    doc.text('Kunraghat, Gorakhpur, Uttar Pradesh 273001', 20, 44);
    
    doc.rect(135, 18, 60, 40);
    doc.addImage(logoImg, 'PNG', 140, 20, 50, 35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ASHOKA HOTEL', 165, 50, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Hospitality | Service | Excellence', 165, 56, { align: 'center' });
    
    doc.rect(15, 65, 180, 35);
    
    doc.setFontSize(10);
    doc.text('To:', 20, 75);
    doc.text(vendor?.vendorName || 'Laundry Service Provider', 20, 82);
    doc.text(vendor?.address || 'Service Address', 20, 89);
    doc.text(vendor?.phone || 'Contact Number', 20, 96);
    
    doc.setFont('helvetica', 'bold');
    doc.text('LAUNDRY INVOICE', 150, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 150, 82);
    doc.text(`Order ID: #${order._id?.slice(-8)}`, 150, 89);
    doc.text(`Status: ${order.laundryStatus || 'Pending'}`, 150, 96);
    
    let yPos = 110;
    const tableWidth = 170;
    const colWidths = [15, 80, 20, 25, 30];
    
    const colPositions = [20];
    for (let i = 0; i < colWidths.length - 1; i++) {
      colPositions.push(colPositions[i] + colWidths[i]);
    }
    
    doc.rect(20, yPos, tableWidth, 8 + (order.items?.length || 0) * 6);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPos, tableWidth, 8, 'F');
    
    colPositions.forEach((pos, index) => {
      if (index > 0) {
        doc.line(pos, yPos, pos, yPos + 8 + (order.items?.length || 0) * 6);
      }
    });
    
    doc.text('S.No', colPositions[0] + colWidths[0]/2, yPos + 5, { align: 'center' });
    doc.text('Item Name', colPositions[1] + colWidths[1]/2, yPos + 5, { align: 'center' });
    doc.text('Qty', colPositions[2] + colWidths[2]/2, yPos + 5, { align: 'center' });
    doc.text('Status', colPositions[3] + colWidths[3]/2, yPos + 5, { align: 'center' });
    doc.text('Notes', colPositions[4] + colWidths[4]/2, yPos + 5, { align: 'center' });
    
    doc.line(20, yPos + 8, 20 + tableWidth, yPos + 8);
    
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    order.items?.forEach((item, index) => {
      doc.line(20, yPos + 6, 20 + tableWidth, yPos + 6);
      
      const itemName = (item.itemName || 'Laundry Item').length > 35 ? 
        (item.itemName || 'Laundry Item').substring(0, 32) + '...' : 
        (item.itemName || 'Laundry Item');
      
      doc.text((index + 1).toString(), colPositions[0] + colWidths[0]/2, yPos + 4, { align: 'center' });
      doc.text(itemName, colPositions[1] + 2, yPos + 4);
      doc.text((Number(item.quantity) || 0).toString(), colPositions[2] + colWidths[2]/2, yPos + 4, { align: 'center' });
      doc.text(item.status || 'Pending', colPositions[3] + colWidths[3]/2, yPos + 4, { align: 'center' });
      doc.text('-', colPositions[4] + colWidths[4]/2, yPos + 4, { align: 'center' });
      yPos += 6;
    });
    
    yPos += 10;
    doc.rect(15, yPos - 5, 180, 40);
    
    doc.text(`Total Items: ${order.items?.length || 0}`, 20, yPos);
    doc.text(`Total Quantity: ${order.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0}`, 105, yPos);
    
    doc.text(`Room Number: ${order.roomNumber || 'N/A'}`, 20, yPos + 10);
    if (order.specialInstructions) {
      doc.text(`Special Instructions: ${order.specialInstructions}`, 20, yPos + 20);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('* Thanks for choosing our laundry service *', 105, 270, { align: 'center' });
    
    doc.save(`Laundry-Invoice-${order._id?.slice(-8)}-${Date.now()}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Laundry Invoice Preview</h2>
            <div className="flex gap-2">
              <button
                onClick={downloadPDF}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Print Invoice
              </button>
              <button
                onClick={() => downloadInvoicePDF(invoiceData.order)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
          
          <div className="w-full bg-white border-2 border-black font-sans text-sm" id="laundry-invoice-content" style={{maxWidth: '210mm', margin: '0 auto'}}>
            <div className="border-b-2 border-black">
              <div className="flex justify-between items-start p-4">
                <div className="flex-1">
                  <div className="text-xs mb-2">
                    <strong>Invoice #:</strong> {invoiceData.invoiceNumber}
                  </div>
                  <div className="font-semibold mb-1">Ashoka hotel</div>
                  <div className="mb-1">Deoria Rd, near Hanuman mandir</div>
                  <div className="mb-1">Kunraghat, Gorakhpur, Uttar Pradesh 273001</div>
                </div>
                <div className="border-2 border-black p-4 text-center bg-gray-50" style={{width: '220px'}}>
                  <div className="flex items-center justify-center mb-3">
                    <img src={logoImg} alt="Ashoka Hotel Logo" className="w-20 h-20 object-contain" />
                  </div>
                  <div className="text-sm font-semibold text-gray-800 mb-1">ASHOKA HOTEL</div>
                  <div className="text-xs font-medium text-gray-600">Hospitality | Service | Excellence</div>
                </div>
              </div>
            </div>

            <div className="flex p-4 border-b border-black">
              <div className="flex-1 pr-8">
                <div className="mb-1"><strong>To:</strong></div>
                <div className="mb-1">{invoiceData.vendor?.vendorName || 'Laundry Service Provider'}</div>
                <div className="mb-1">{invoiceData.vendor?.address || 'Service Address'}</div>
                <div className="mb-3">{invoiceData.vendor?.phone || 'Contact Number'}</div>
              </div>
              <div className="text-right">
                <h2 className="text-lg font-bold mb-3">LAUNDRY INVOICE</h2>
                <div className="mb-1"><strong>Date :</strong> {new Date(invoiceData.order?.createdAt).toLocaleDateString() || invoiceData.date}</div>
                <div className="mb-1"><strong>Order ID :</strong> #{invoiceData.order?._id?.slice(-8)}</div>
                <div className="mb-1"><strong>Status :</strong> {invoiceData.order?.laundryStatus || 'Pending'}</div>
                <div className="mb-1"><strong>Room :</strong> {invoiceData.order?.roomNumber || 'N/A'}</div>
                <div><strong>Time :</strong> {new Date(invoiceData.order?.createdAt).toLocaleTimeString()}</div>
              </div>
            </div>

            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-black p-2 w-12">S.No</th>
                  <th className="border border-black p-2">Item Name</th>
                  <th className="border border-black p-2 w-16">Qty</th>
                  <th className="border border-black p-2 w-20">Status</th>
                  <th className="border border-black p-2 w-24">Notes</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.order?.items?.length > 0 ? invoiceData.order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-black p-2 text-center">{index + 1}</td>
                    <td className="border border-black p-2 pl-3">{item.itemName || 'Laundry Item'}</td>
                    <td className="border border-black p-2 text-center">{Number(item.quantity) || 0}</td>
                    <td className="border border-black p-2 text-center">{item.status || 'Pending'}</td>
                    <td className="border border-black p-2 text-center">-</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="border border-black p-4 text-center text-gray-500">No items found</td>
                  </tr>
                )}
                {Array.from({ length: Math.max(0, 10 - (invoiceData.order?.items?.length || 0)) }).map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td className="border border-black p-2">&nbsp;</td>
                    <td className="border border-black p-2">&nbsp;</td>
                    <td className="border border-black p-2">&nbsp;</td>
                    <td className="border border-black p-2">&nbsp;</td>
                    <td className="border border-black p-2">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between p-4 border-t border-black">
              <div className="flex-1">
                <div className="mb-2"><strong>Total Items :</strong> {invoiceData.order?.items?.length || 0}</div>
                <div className="mb-2"><strong>Total Quantity :</strong> {invoiceData.order?.items?.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0}</div>
                <div className="mb-2"><strong>Room Number :</strong> {invoiceData.order?.roomNumber || 'N/A'}</div>
                {invoiceData.order?.isUrgent && (
                  <div className="mb-2 text-red-600"><strong>URGENT ORDER</strong></div>
                )}
              </div>
              <div className="flex-1 text-center">
                {invoiceData.order?.scheduledPickupTime && (
                  <div className="mb-2"><strong>Pickup Time :</strong> {new Date(invoiceData.order.scheduledPickupTime).toLocaleString()}</div>
                )}
                {invoiceData.order?.scheduledDeliveryTime && (
                  <div className="mb-2"><strong>Delivery Time :</strong> {new Date(invoiceData.order.scheduledDeliveryTime).toLocaleString()}</div>
                )}
              </div>
              <div className="flex-1 text-right">
                <div className="mb-2"><strong>Order Status :</strong> {invoiceData.order?.laundryStatus || 'Pending'}</div>
                <div className="mb-2"><strong>Bill Status :</strong> {invoiceData.order?.billStatus || 'Unpaid'}</div>
                {invoiceData.order?.receivedBy && (
                  <div className="mb-2"><strong>Received By :</strong> {invoiceData.order.receivedBy}</div>
                )}
              </div>
            </div>

            {invoiceData.order?.specialInstructions && (
              <div className="p-4 border-t border-black">
                <div><strong>Special Instructions:</strong></div>
                <div className="mt-2 text-sm">{invoiceData.order.specialInstructions}</div>
              </div>
            )}

            <div className="text-center border-t-2 border-black py-4">
              <p className="font-bold text-base">* Thanks for choosing our laundry service *</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaundryInvoice;
