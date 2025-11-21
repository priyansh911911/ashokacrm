import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Printer } from 'lucide-react';

export default function POSInvoice() {
  const { axios } = useAppContext();
  const location = useLocation();
  const bookingData = location.state?.bookingData;
  
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kotData, setKotData] = useState([]);

  const fetchInvoiceData = async (checkoutId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (bookingData && (bookingData.tableNo || bookingData.staffName)) {
        // Restaurant order data
        const orderData = bookingData;
        
        // Use calculated totals from invoice data
        const items = orderData.items || [];
        const grossAmount = orderData.amount || orderData.totalAmount || 0;
        const sgst = grossAmount * 0.09; // 9%
        const cgst = grossAmount * 0.09; // 9%
        const roundOff = -0.01;
        const netAmount = grossAmount + sgst + cgst + roundOff;
        
        const posInvoiceData = {
          gstin: '09ANHPJ7242D2Z1',
          hotelName: 'ASHOKA HOTEL A UNIT OF ASHOKA HOSPITALITY',
          billType: 'ROOM SERVICE SALE BILL',
          duplicate: 'Duplicate Bill',
          customerName: orderData.customerName || orderData.guestName || 'Guest',
          address: orderData.address || 'N/A',
          mobile: orderData.phoneNumber || orderData.guestPhone || 'N/A',
          billNo: orderData.billNumber || orderData._id?.slice(-6) || `BRS${Date.now().toString().slice(-8)}`,
          date: new Date().toLocaleDateString('en-GB'),
          time: new Date().toLocaleTimeString('en-GB', { hour12: false }),
          kotNo: orderData.kotNumber || orderData._id?.slice(-6) || `${Math.floor(Math.random() * 9000) + 1000}`,
          steward: orderData.staffName || 'Staff',
          roomNo: orderData.tableNo || orderData.roomNumber || '001',
          pax: '1',
          items: items.map(item => ({
            name: typeof item === 'object' ? (item.itemName || item.name || 'Item') : String(item),
            hsn: '996331',
            taxRate: '18%',
            qty: typeof item === 'object' ? (item.quantity || 1) : 1,
            rate: typeof item === 'object' ? (item.price || item.Price || 0) : 0,
            amount: typeof item === 'object' ? ((item.price || item.Price || 0) * (item.quantity || 1)) : 0
          })),
          grossAmount,
          sgst,
          cgst,
          roundOff,
          netAmount,
          amountInWords: numberToWords(Math.round(netAmount)),
          payment: `ROOM - ${Math.round(netAmount)}`,
          user: 'FOM1'
        };
        
        setInvoiceData(posInvoiceData);
        
        // Fetch KOT data for this order
        await fetchKOTData(orderData._id);
      }
    } catch (error) {
      console.error('Error fetching POS invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKOTData = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/kot/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setKotData(response.data);
      }
    } catch (error) {
      console.error('Error fetching KOT data:', error);
      // If KOT API fails, create mock KOT data from order
      if (bookingData) {
        const mockKot = {
          _id: bookingData._id,
          kotNumber: bookingData._id?.slice(-6) || `${Math.floor(Math.random() * 9000) + 1000}`,
          tableNo: bookingData.tableNo,
          status: 'pending',
          items: bookingData.items?.map(item => ({
            name: typeof item === 'object' ? (item.itemName || item.name || 'Item') : String(item),
            quantity: typeof item === 'object' ? (item.quantity || 1) : 1,
            kotNumber: 1
          })) || [],
          createdAt: new Date().toISOString()
        };
        setKotData([mockKot]);
      }
    }
  };

  const numberToWords = (num) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];

    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '');
    
    return 'Rupees ' + numberToWords(Math.floor(num / 100)) + ' Hundred' + (num % 100 !== 0 ? ' ' + numberToWords(num % 100) : '') + ' Only';
  };

  useEffect(() => {
    if (bookingData) {
      const checkoutId = location.state?.checkoutId || bookingData._id || `POS-${Date.now()}`;
      fetchInvoiceData(checkoutId);
    }
  }, [bookingData, location.state]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-lg">Loading POS Invoice...</div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-white p-4 flex items-center justify-center">
        <div className="text-lg text-red-600">Failed to load POS invoice data</div>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const printKOT = (kot) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>KOT #${kot.displayNumber || kot.kotNumber?.slice(-3) || kot._id?.slice(-6) || 'N/A'}</title>
            <style>
                @page {
                    size: 80mm auto;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: monospace;
                    width: 80mm;
                    font-size: 10px;
                }
                .print-content {
                    width: 80mm;
                    max-width: 80mm;
                    margin: 0;
                    padding: 2mm;
                    font-size: 10px;
                    line-height: 1.2;
                    box-sizing: border-box;
                }
                .print-header {
                    font-size: 12px;
                    font-weight: bold;
                }
                .text-center { text-align: center; }
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-3 { margin-bottom: 12px; }
                .border-b { border-bottom: 1px solid #000; }
                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .font-bold { font-weight: bold; }
            </style>
        </head>
        <body>
            <div class="print-content">
                <div class="text-center mb-3">
                    <div class="print-header mb-2">ASHOKA</div>
                    <div class="mb-1">EXPERIENCE COMFORT</div>
                    <div class="mb-2">KITCHEN ORDER TICKET</div>
                    <div class="font-bold mb-1">ASHOKA DINING</div>
                    <div class="mb-1">(A Unit Of Ashoka hospitality)</div>
                    <div class="mb-1">Add : Near Hanuman Mandir, Deoria Road</div>
                    <div class="mb-1">Kurnaghat, Gorakhpur - 273008</div>
                    <div class="mb-1">GSTIN : 09ANHPJ7242D2Z1</div>
                    <div class="mb-2">Mob : 6388491244</div>
                    <div class="border-b mb-2"></div>
                </div>

                <div class="mb-3">
                    <div class="flex justify-between mb-1">
                        <span>KOT #: ${kot.displayNumber || kot.kotNumber?.slice(-3) || kot._id?.slice(-6) || 'N/A'}</span>
                        <span>Table: ${kot.tableNo || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between mb-1">
                        <span>Date: ${new Date().toLocaleDateString('en-GB')}</span>
                        <span>Time: ${new Date().toLocaleTimeString('en-GB', { hour12: false })}</span>
                    </div>
                    <div class="flex justify-between mb-2">
                        <span>Status: ${kot.status?.toUpperCase() || 'PENDING'}</span>
                        <span>Priority: ${kot.priority?.toUpperCase() || 'NORMAL'}</span>
                    </div>
                    <div class="border-b mb-2"></div>
                </div>

                <div class="mb-2">
                    <div class="flex justify-between font-bold border-b mb-1">
                        <span style="width: 50%">Item</span>
                        <span style="width: 20%; text-align: center">Qty</span>
                        <span style="width: 30%">Notes</span>
                    </div>
                </div>

                <div class="mb-3">
                    ${kot.items?.map(item => {
                        const itemName = typeof item === 'string' ? item : (item.name || item.itemName || 'Unknown Item');
                        const quantity = typeof item === 'object' ? (item.quantity || 1) : 1;
                        const note = typeof item === 'object' ? (item.note || '') : '';
                        return `
                            <div class="flex justify-between mb-1">
                                <span style="width: 50%">${itemName}</span>
                                <span style="width: 20%; text-align: center">${quantity}</span>
                                <span style="width: 30%">${note || '-'}</span>
                            </div>
                        `;
                    }).join('') || '<div>No items</div>'}
                    <div class="border-b mb-2"></div>
                </div>

                <div class="mb-3">
                    <div class="mb-1">Total Items: ${kot.items?.length || 0}</div>
                    <div class="border-b mb-2"></div>
                </div>

                <div class="text-center mb-3">
                    <div class="mb-2">Kitchen Copy</div>
                    <div class="border-b mb-2"></div>
                    <div>Printed: ${new Date().toLocaleString('en-GB')}</div>
                </div>
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .print-content {
            width: 80mm !important;
            max-width: 80mm !important;
            margin: 0 !important;
            padding: 2mm !important;
            font-size: 10px !important;
            line-height: 1.2 !important;
          }
          .print-content * {
            font-size: 10px !important;
          }
          .print-header {
            font-size: 12px !important;
            font-weight: bold !important;
          }
        }
      `}</style>
        {/* Print Buttons */}
        <div className="no-print mb-4 text-center space-y-2">
          <div>
            <button 
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium mr-2"
            >
              🖨️ Print Bill
            </button>
          </div>
          
          {/* KOT Print Section */}
          {kotData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Kitchen Order Tickets</h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {kotData.map((kot, index) => (
                  <button
                    key={kot._id || index}
                    onClick={() => printKOT(kot)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                    title="Print KOT"
                  >
                    <Printer className="w-4 h-4" />
                    Print KOT #{kot.kotNumber?.slice(-3) || kot._id?.slice(-6) || (index + 1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="print-content max-w-sm mx-auto bg-white border border-gray-300 p-4 font-mono text-xs">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="print-header text-lg font-bold mb-2">ASHOKA</div>
          <div className="text-xs mb-1">EXPERIENCE COMFORT</div>
          <div className="text-xs mb-2">Duplicate</div>
          <div className="font-bold text-sm mb-1">ASHOKA DINING</div>
          <div className="text-xs mb-1">(A Unit Of Ashoka hospitality)</div>
          <div className="text-xs mb-1">Add : Near Hanuman Mandir, Deoria Road</div>
          <div className="text-xs mb-1">Kurnaghat, Gorakhpur - 273008</div>
          <div className="text-xs mb-1">GSTIN : 09ANHPJ7242D2Z1</div>
          <div className="text-xs mb-2">Mob : 6388491244</div>
          <div className="border-b border-gray-400 mb-2"></div>
        </div>

        {/* Customer Details */}
        <div className="mb-3 text-xs">
          <div className="mb-1">Name: {invoiceData.customerName}</div>
          <div className="border-b border-gray-400 mb-2"></div>
        </div>

        {/* Bill Details */}
        <div className="mb-3 text-xs">
          <div className="flex justify-between mb-1">
            <span>Date: {invoiceData.date} {invoiceData.time}</span>
            <span>Dine In: {invoiceData.roomNo}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Cashier: {invoiceData.steward}</span>
            <span>Bill No.: {invoiceData.billNo}</span>
          </div>
          <div className="border-b border-gray-400 mb-2"></div>
        </div>

        {/* Items Header */}
        <div className="mb-2">
          <div className="flex justify-between font-bold text-xs border-b border-gray-400 pb-1">
            <span className="flex-1">Item</span>
            <span className="w-8 text-center">Qty.</span>
            <span className="w-12 text-right">Price</span>
            <span className="w-12 text-right">Amount</span>
          </div>
          <div className="border-b border-gray-400 mb-2"></div>
        </div>

        {/* Items */}
        <div className="mb-3">
          {invoiceData.items.map((item, index) => (
            <div key={index} className="mb-1">
              <div className="flex justify-between text-xs">
                <span className="flex-1">{item.name}</span>
                <span className="w-8 text-center">{item.qty}</span>
                <span className="w-12 text-right">{item.rate.toFixed(2)}</span>
                <span className="w-12 text-right">{item.amount.toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div className="border-b border-gray-400 my-2"></div>
        </div>

        {/* Totals */}
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Total Qty: {invoiceData.items.reduce((sum, item) => sum + item.qty, 0)}</span>
            <span>Sub Total: {invoiceData.grossAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>CGST 9%</span>
            <span>{(invoiceData.grossAmount * 0.09).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>SGST 9%</span>
            <span>{(invoiceData.grossAmount * 0.09).toFixed(2)}</span>
          </div>
          <div className="border-b border-gray-400 my-2"></div>
          <div className="flex justify-between text-xs mb-1">
            <span>Round off</span>
            <span>{invoiceData.roundOff.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm">
            <span>Grand Total</span>
            <span>₹ {(invoiceData.grossAmount + (invoiceData.grossAmount * 0.18) + invoiceData.roundOff).toFixed(2)}</span>
          </div>
          <div className="text-xs mt-1">Paid via Other [Upi]</div>
          <div className="border-b border-gray-400 my-2"></div>
        </div>

        {/* Footer */}
        <div className="text-center mb-4">
          <div className="text-xs mb-2">Thanks For Your Visit~</div>
          <div className="border-b border-gray-400 mb-2"></div>
          <div className="text-xs mb-2">Your feedback matters us most to improve ourselves. Please scan below to provide your feedback:</div>
          
          {/* QR Code Placeholder */}
          <div className="flex justify-center mb-2">
            <div className="w-20 h-20 bg-gray-800 flex items-center justify-center text-white text-xs">
              QR CODE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}