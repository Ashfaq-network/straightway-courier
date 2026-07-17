import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Waybill from '../../components/Waybill';

const API = '/api/staff';

export default function StaffDashboard() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [doingAction, setDoingAction] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [waybillShipment, setWaybillShipment] = useState(null);
  const navigate = useNavigate();

  const getToken = () => sessionStorage.getItem('staff_token');

  useEffect(() => {
    fetchProfile();
    fetchShipments();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/profile`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) setProfile(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchShipments = async () => {
    try {
      const res = await fetch(`${API}/my-shipments`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.status === 401 || res.status === 403) {
        sessionStorage.removeItem('staff_token');
        navigate('/staff');
        return;
      }
      setShipments(await res.json());
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleStatusUpdate = async (id, status, extra = {}) => {
    setDoingAction(id);
    try {
      const res = await fetch(`${API}/shipments/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ status, ...extra })
      });
      if (res.ok) { setSelectedShipment(null); fetchShipments(); }
    } catch (err) { console.error(err); } finally { setDoingAction(null); }
  };

  const handleDeliveryAttempt = async (id, reason, note) => {
    setDoingAction(id);
    try {
      await fetch(`${API}/shipments/${id}/delivery-attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ reason, custom_note: note })
      });
      setSelectedShipment(null);
      fetchShipments();
    } catch (err) { console.error(err); } finally { setDoingAction(null); }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('staff_token');
    navigate('/staff');
  };

  const statusColors = {
    pickup_requested: 'bg-yellow-100 text-yellow-800',
    picked_up: 'bg-orange-100 text-orange-800',
    at_warehouse: 'bg-purple-100 text-purple-800',
    at_sorting_center: 'bg-violet-100 text-violet-800',
    sorted: 'bg-indigo-100 text-indigo-800',
    out_for_delivery: 'bg-blue-100 text-blue-800',
    customer_contacted: 'bg-teal-100 text-teal-800',
    delivered: 'bg-green-100 text-green-800',
    failed_delivery: 'bg-red-100 text-red-800',
    returned_to_sender: 'bg-gray-200 text-gray-800',
    rescheduled: 'bg-cyan-100 text-cyan-800',
  };

  const isPickupDriver = profile?.role === 'pickup_driver';
  const isDeliveryRider = profile?.role === 'delivery_rider';

    const PickupForm = ({ s }) => {
    const [location, setLocation] = useState(s.pickup_address || s.sender_address || '');
    const [desc, setDesc] = useState('Parcel collected from sender');
    return (
      <div className="flex flex-col gap-2 w-full sm:w-80">
        <p className="text-xs font-semibold text-amber-600 mb-1">Complete Pickup</p>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Pickup location"
          className="w-full px-3 py-2.5 border text-sm border-gray-300 rounded-lg" />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description"
          className="w-full px-3 py-2.5 border text-sm border-gray-300 rounded-lg" />
        <div className="flex gap-2">
          <button onClick={() => handleStatusUpdate(s.id, 'picked_up', { location, description: desc })}
            disabled={doingAction === s.id}
            className="flex-1 px-4 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-lg hover:bg-amber-600 disabled:opacity-50 touch-manipulation">
            {doingAction === s.id ? 'Updating...' : 'Confirm Pickup'}
          </button>
          <button onClick={() => setSelectedShipment(null)} className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm rounded-lg touch-manipulation">Cancel</button>
        </div>
      </div>
    );
  };

  const DeliveryForm = ({ s }) => {
    const [step, setStep] = useState('options');
    const [location, setLocation] = useState(s.delivery_address || s.receiver_address || '');
    const [desc, setDesc] = useState('');
    const [signature, setSignature] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [remarks, setRemarks] = useState('');
    const [reason, setReason] = useState('');
    const [note, setNote] = useState('');

    if (step === 'deliver') {
      return (
        <div className="flex flex-col gap-3 w-full sm:w-80">
          <p className="text-xs font-semibold text-green-600 mb-1">Complete Delivery</p>
          <input value={signature} onChange={e => setSignature(e.target.value)} placeholder="Receiver name (signature)"
            className="w-full px-3 py-2.5 border text-sm border-gray-300 rounded-lg" />
          <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="Delivery photo URL (optional)"
            className="w-full px-3 py-2.5 border text-sm border-gray-300 rounded-lg" />
          <input value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Delivery remarks (optional)"
            className="w-full px-3 py-2.5 border text-sm border-gray-300 rounded-lg" />
          <div className="flex gap-2">
            <button onClick={() => handleStatusUpdate(s.id, 'delivered', { location, description: desc || 'Delivered successfully', receiver_signature: signature, delivery_photo: photoUrl, delivery_remarks: remarks })}
              disabled={doingAction === s.id || !signature}
              className="flex-1 px-4 py-2.5 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 touch-manipulation">
              {doingAction === s.id ? 'Saving...' : 'Mark Delivered'}
            </button>
            <button onClick={() => setStep('options')} className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm rounded-lg touch-manipulation">Back</button>
          </div>
        </div>
      );
    }

    if (step === 'fail') {
      return (
        <div className="flex flex-col gap-3 w-full sm:w-80">
          <p className="text-xs font-semibold text-red-600 mb-1">Log Failed Delivery</p>
          <select value={reason} onChange={e => setReason(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm">
            <option value="">Select reason...</option>
            <option value="Customer unavailable">Customer unavailable</option>
            <option value="Wrong address">Wrong address</option>
            <option value="Phone unreachable">Phone unreachable</option>
            <option value="Business closed">Business closed</option>
            <option value="Other">Other</option>
          </select>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Additional notes"
            className="w-full px-3 py-2.5 border text-sm border-gray-300 rounded-lg" />
          <div className="flex gap-2">
            <button onClick={() => handleDeliveryAttempt(s.id, reason, note)}
              disabled={doingAction === s.id || !reason}
              className="flex-1 px-4 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 touch-manipulation">
              {doingAction === s.id ? 'Logging...' : 'Log Failed Attempt'}
            </button>
            <button onClick={() => setStep('options')} className="px-4 py-2.5 bg-gray-200 text-gray-700 text-sm rounded-lg touch-manipulation">Back</button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-3 w-full sm:w-80">
        <p className="text-xs font-semibold text-gray-600 mb-1">Update Delivery Status</p>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => handleStatusUpdate(s.id, 'out_for_delivery', { location, description: 'Out for delivery' })}
            disabled={doingAction === s.id}
            className="px-4 py-3 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 disabled:opacity-50 touch-manipulation">
            Out for Delivery
          </button>
          <button onClick={() => handleStatusUpdate(s.id, 'customer_contacted', { location, description: 'Customer contacted' })}
            disabled={doingAction === s.id}
            className="px-4 py-3 bg-teal-500 text-white text-sm font-semibold rounded-lg hover:bg-teal-600 disabled:opacity-50 touch-manipulation">
            Contacted
          </button>
          <button onClick={() => setStep('deliver')}
            className="px-4 py-3 bg-green-500 text-white text-sm font-semibold rounded-lg hover:bg-green-600 touch-manipulation">
            Deliver
          </button>
          <button onClick={() => setStep('fail')}
            className="px-4 py-3 bg-red-500 text-white text-sm font-semibold rounded-lg hover:bg-red-600 touch-manipulation">
            Failed
          </button>
        </div>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Current location"
          className="w-full px-3 py-2.5 border text-sm border-gray-300 rounded-lg" />
        <button onClick={() => setSelectedShipment(null)} className="text-sm text-gray-500 hover:text-gray-700 py-1 touch-manipulation">Cancel</button>
      </div>
    );
  };

  const roleLabel = isPickupDriver ? 'Pickup Driver' : isDeliveryRider ? 'Delivery Rider' : 'Staff';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{roleLabel} Portal</h1>
          {profile && <p className="text-sm text-gray-500">Welcome, {profile.name}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSheet(!showSheet)} className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm">
            {showSheet ? 'Tasks View' : 'Delivery Sheet'}
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Logout</button>
        </div>
      </div>

      {showSheet ? (
        <div className="print-area">
          <div className="text-center mb-6 hidden print:block">
            <h1 className="text-2xl font-bold text-gray-900">Delivery Sheet</h1>
            <p className="text-sm text-gray-500">Straightway Couriers — {profile?.name} — {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex justify-end mb-4 no-print">
            <button onClick={() => window.print()}
              className="px-5 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print
            </button>
          </div>
          {loading ? <p className="text-gray-500">Loading...</p> : shipments.length === 0 ? (
            <p className="text-gray-500">No parcels assigned.</p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 print:bg-gray-100">
                  <tr>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">#</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Tracking</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Sender</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Receiver</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Phone</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Address</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Parcel</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">COD</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Instructions</th>
                    <th className="text-left px-3 py-2 font-medium text-xs text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shipments.map((s, i) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-xs text-gray-500">{i + 1}</td>
                      <td className="px-3 py-2 font-semibold text-gray-900 text-xs">{s.tracking_number}</td>
                      <td className="px-3 py-2 text-gray-800 text-xs">{s.sender_name}</td>
                      <td className="px-3 py-2 text-gray-800 text-xs">{s.receiver_name}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{s.receiver_phone}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs max-w-[160px]">{isPickupDriver ? (s.pickup_address || s.sender_address || '-') : (s.delivery_address || s.receiver_address || '-')}</td>
                      <td className="px-3 py-2 text-gray-600 text-xs">{s.parcel_type || '-'}{s.weight ? ` (${s.weight}kg)` : ''}</td>
                      <td className="px-3 py-2 text-xs">{s.cod_amount ? `LKR ${s.cod_amount}` : '-'}</td>
                      <td className="px-3 py-2 text-xs text-amber-600 max-w-[120px]">{s.special_instructions || '-'}</td>
                      <td className="px-3 py-2 text-xs">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-medium ${statusColors[s.status] || 'bg-gray-100 text-gray-800'}`}>
                          {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <style>{`
            @media print {
              body { font-size: 11px; }
              .no-print { display: none !important; }
              .print-area { margin: 0; padding: 0; }
            }
          `}</style>
        </div>
      ) : loading ? (
        <div className="text-center py-16"><p className="text-gray-500">Loading...</p></div>
      ) : shipments.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500 mb-2">No assigned shipments right now.</p>
          <p className="text-xs text-gray-400">New tasks will appear here when assigned.</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {shipments.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">{s.tracking_number}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${statusColors[s.status] || 'bg-gray-100 text-gray-800'}`}>
                      {s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5 text-sm text-gray-600 mt-2">
                    <div>
                      <span className="text-xs text-gray-400 block">Sender</span>
                      <span className="text-gray-800">{s.sender_name}</span> — {s.sender_phone}
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Receiver</span>
                      <span className="text-gray-800">{s.receiver_name}</span> — {s.receiver_phone}
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Route</span>
                      {s.origin} → {s.destination}
                    </div>
                    {s.pickup_address && isPickupDriver && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-gray-400 block">Pickup Address</span>
                        <span className="text-gray-800">{s.pickup_address}</span>
                      </div>
                    )}
                    {s.delivery_address && isDeliveryRider && (
                      <div className="sm:col-span-2">
                        <span className="text-xs text-gray-400 block">Delivery Address</span>
                        <span className="text-gray-800">{s.delivery_address}</span>
                      </div>
                    )}
                    {s.special_instructions && (
                      <div className="sm:col-span-2 lg:col-span-3">
                        <span className="text-xs text-amber-500 block font-medium">Instructions</span>
                        <span className="text-amber-700 text-xs sm:text-sm">{s.special_instructions}</span>
                      </div>
                    )}
                  </div>
                </div>

        <div className="flex-shrink-0 w-full sm:w-auto">
          {selectedShipment === s.id ? (
            isPickupDriver ? <PickupForm s={s} /> : isDeliveryRider ? <DeliveryForm s={s} /> : null
          ) : (
            <div className="flex flex-col gap-2">
              <button onClick={() => setSelectedShipment(s.id)}
                className={`w-full sm:w-auto px-5 py-3 text-sm font-semibold rounded-lg text-white transition-colors whitespace-nowrap touch-manipulation ${
                  isPickupDriver ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-500 hover:bg-blue-600'
                }`}>
                {isPickupDriver ? 'Start Pickup' : 'Update Delivery'}
              </button>
              <button onClick={() => setWaybillShipment(s)}
                className="w-full sm:w-auto px-4 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors touch-manipulation">
                Waybill
              </button>
            </div>
          )}
        </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {waybillShipment && <Waybill shipment={waybillShipment} onClose={() => setWaybillShipment(null)} />}
    </div>
  );
}
