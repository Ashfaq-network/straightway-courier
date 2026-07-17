import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

export default function Waybill({ shipment, onClose }) {
  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && shipment?.tracking_number) {
      JsBarcode(barcodeRef.current, shipment.tracking_number, {
        format: 'CODE128',
        width: 2.2,
        height: 60,
        displayValue: false,
        margin: 0,
      });
    }
  }, [shipment]);

  if (!shipment) return null;

  const s = shipment;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-2 py-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between rounded-t-2xl z-10 no-print">
          <h2 className="font-bold text-gray-900">Waybill — {s.tracking_number}</h2>
          <div className="flex gap-2">
            <button onClick={() => window.print()}
              className="px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        <div className="p-5 print:p-0 print-area">
          {/* 1. Company Details */}
          <div className="flex items-start gap-4 mb-5 pb-4 border-b border-gray-200">
            <img src="/logo.png" alt="Straightway Couriers" className="w-16 h-16 object-contain rounded-lg" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Straightway Couriers</h1>
              <p className="text-xs text-gray-500">+94 77 252 0636</p>
              <p className="text-xs text-gray-500">straightwaycouriers@gmail.com</p>
              <p className="text-xs text-gray-500">straightwaycouriers.com</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 2. Tracking Information */}
            <div className="sm:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Tracking Number</p>
                  <p className="text-xl font-bold text-gray-900 tracking-tight">{s.tracking_number}</p>
                  <p className="text-xs text-gray-400 mt-1">Date: {new Date(s.created_at || s.createdAt || new Date()).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="flex-shrink-0 text-center">
                  <svg ref={barcodeRef} className="mx-auto" />
                  <p className="text-[10px] text-gray-500 mt-1 tracking-widest font-mono">{s.tracking_number}</p>
                </div>
              </div>
            </div>

            {/* 3. Sender Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sender</p>
              <p className="font-semibold text-gray-900 text-sm">{s.sender_name}</p>
              <p className="text-xs text-gray-600">{s.sender_phone}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.sender_address || '-'}</p>
            </div>

            {/* 4. Receiver Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Receiver</p>
              <p className="font-semibold text-gray-900 text-sm">{s.receiver_name}</p>
              <p className="text-xs text-gray-600">{s.receiver_phone}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.delivery_address || s.receiver_address || '-'}</p>
              {s.landmark && <p className="text-xs text-amber-600 mt-0.5">Landmark: {s.landmark}</p>}
            </div>

            {/* 5. Parcel Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Parcel Details</p>
              <table className="w-full text-xs">
                <tbody>
                  <tr><td className="text-gray-400 py-0.5 pr-2">Description</td><td className="text-gray-800">{s.parcel_description || '-'}</td></tr>
                  <tr><td className="text-gray-400 py-0.5 pr-2">Weight</td><td className="text-gray-800">{s.weight ? `${s.weight} kg` : '-'}</td></tr>
                  <tr><td className="text-gray-400 py-0.5 pr-2">Parcel Type</td><td className="text-gray-800">{s.parcel_type || '-'}</td></tr>
                  <tr><td className="text-gray-400 py-0.5 pr-2">Items</td><td className="text-gray-800">{s.num_items || '1'}</td></tr>
                  {s.declared_value && <tr><td className="text-gray-400 py-0.5 pr-2">Declared Value</td><td className="text-gray-800">LKR {s.declared_value}</td></tr>}
                </tbody>
              </table>
            </div>

            {/* 6. Payment Details */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Payment</p>
              <table className="w-full text-xs">
                <tbody>
                  <tr><td className="text-gray-400 py-0.5 pr-2">Delivery Type</td><td className="text-gray-800">{s.delivery_type || '-'}</td></tr>
                  <tr><td className="text-gray-400 py-0.5 pr-2">Delivery Charge</td><td className="text-gray-800 font-semibold">{s.delivery_charge ? `LKR ${s.delivery_charge}` : '-'}</td></tr>
                  <tr><td className="text-gray-400 py-0.5 pr-2">COD Amount</td><td className="text-gray-800 font-semibold">{s.cod_amount ? `LKR ${s.cod_amount}` : '-'}</td></tr>
                  <tr><td className="text-gray-400 py-0.5 pr-2">Payment Status</td><td className="text-gray-800">{s.payment_status || '-'}</td></tr>
                </tbody>
              </table>
            </div>

            {/* Route Info */}
            <div className="sm:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-gray-800">{s.origin || '-'}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                <span className="font-semibold text-gray-800">{s.destination || '-'}</span>
                {s.sorting_area && <span className="text-xs text-gray-400 ml-2">(Area: {s.sorting_area})</span>}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 pt-3 border-t border-gray-200 text-center text-xs text-gray-400">
            <p>Straightway Couriers — Customer Care: +94 77 252 0636 — straightwaycouriers.com</p>
          </div>
        </div>

        <style>{`
          @media print {
            body { font-size: 11px; background: white; }
            .no-print { display: none !important; }
            .print-area { margin: 0; padding: 0; }
            .fixed { position: absolute; left: 0; top: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
