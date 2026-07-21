import { useState, useEffect } from 'react';

const API = '/api/admin';

const defaultForm = {
  client_id: '', sender_name: '', sender_phone: '', sender_email: '', sender_address: '',
  receiver_name: '', receiver_phone: '', receiver_email: '', receiver_address: '',
  pickup_address: '', delivery_address: '', origin: '', destination: '',
  parcel_type: '', parcel_description: '', num_items: 1, weight: '',
  delivery_type: '', cod_amount: '', delivery_charge: '', payment_status: 'pending',
  special_instructions: '', tracking_number: '', status: 'pickup_requested',
  estimated_delivery: '', notes: '',
  pickup_driver_id: '', delivery_rider_id: '',
};

export default function ShipmentForm({ shipment, onDone, onCancel }) {
  const [form, setForm] = useState(shipment || defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [clients, setClients] = useState([]);

  const isEdit = !!shipment;
  const getToken = () => sessionStorage.getItem('swc_token');

  useEffect(() => {
    fetch(`${API}/staff`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
      .then(res => res.ok && res.json()).then(data => data && setStaffList(data)).catch(() => {});
    fetch(`${API}/clients`, { headers: { 'Authorization': `Bearer ${getToken()}` } })
      .then(res => res.ok && res.json()).then(data => data && setClients(data)).catch(() => {});
  }, []);

  const generateTracking = async () => {
    try {
      const res = await fetch(`${API}/generate-tracking`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
      if (res.ok) { const data = await res.json(); setForm({ ...form, tracking_number: data.tracking_number }); }
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const url = isEdit ? `${API}/shipments/${shipment.id}` : `${API}/shipments`;
    try {
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || 'Failed to save'); }
      onDone();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'number' ? (e.target.value === '' ? '' : parseFloat(e.target.value)) : e.target.value;
    setForm({ ...form, [field]: val });
  };

  const statusOptions = [
    'pickup_requested', 'picked_up', 'at_sorting_center', 'sorted', 'out_for_delivery',
    'customer_contacted', 'delivered', 'failed_delivery', 'returned_to_sender', 'rescheduled'
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Shipment' : 'New Shipment'}</h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700 text-sm">Cancel</button>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"><p className="text-red-700 text-sm">{error}</p></div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tracking Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number *</label>
          <input type="text" required value={form.tracking_number} onChange={handleChange('tracking_number')}
            placeholder="Enter tracking number (e.g. SW0001)" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>

        {/* Client */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Client</h3>
          <select value={form.client_id} onChange={handleChange('client_id')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
            <option value="">Walk-in / No Client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name || c.contact_person} ({c.phone})</option>)}
          </select>
        </div>

        {/* Sender */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Sender Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" required value={form.sender_name} onChange={handleChange('sender_name')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="text" required value={form.sender_phone} onChange={handleChange('sender_phone')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.sender_email} onChange={handleChange('sender_email')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" value={form.sender_address} onChange={handleChange('sender_address')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
          </div>
        </div>

        {/* Receiver */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Receiver Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Name *</label><input type="text" required value={form.receiver_name} onChange={handleChange('receiver_name')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input type="text" required value={form.receiver_phone} onChange={handleChange('receiver_phone')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.receiver_email} onChange={handleChange('receiver_email')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Address</label><input type="text" value={form.receiver_address} onChange={handleChange('receiver_address')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
          </div>
        </div>

        {/* Pickup & Delivery Addresses */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Pickup & Delivery</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address</label><input type="text" value={form.pickup_address} onChange={handleChange('pickup_address')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label><input type="text" value={form.delivery_address} onChange={handleChange('delivery_address')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
          </div>
        </div>

        {/* Route */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Route</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Origin *</label><input type="text" required value={form.origin} onChange={handleChange('origin')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label><input type="text" required value={form.destination} onChange={handleChange('destination')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
          </div>
        </div>

        {/* Parcel Details */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Parcel Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Type</label><input type="text" value={form.parcel_type} onChange={handleChange('parcel_type')} placeholder="e.g. Document, Package" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Items</label><input type="number" min="1" value={form.num_items} onChange={handleChange('num_items')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Weight</label><input type="text" placeholder="e.g. 2 kg" value={form.weight} onChange={handleChange('weight')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><input type="text" placeholder="Describe contents" value={form.parcel_description} onChange={handleChange('parcel_description')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label><input type="text" value={form.delivery_type} onChange={handleChange('delivery_type')} placeholder="e.g. Standard, Express" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
          </div>
        </div>

        {/* Financial */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Financial</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">COD Amount (LKR)</label><input type="text" inputMode="decimal" value={form.cod_amount} onChange={handleChange('cod_amount')} placeholder="0.00" className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Payment</label><select value={form.payment_status} onChange={handleChange('payment_status')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
              <option value="pending">Pending</option><option value="paid">Paid</option><option value="cod">Cash on Delivery</option><option value="partial">Partial</option>
            </select></div>
          </div>
        </div>

        {/* Assignment */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Staff Assignment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Pickup Staff</label><select value={form.pickup_driver_id} onChange={handleChange('pickup_driver_id')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
              <option value="">Not assigned</option>{staffList.filter(s => s.role === 'pickup_driver' || !s.role).map(staff => <option key={staff.id} value={staff.id}>{staff.name} ({staff.phone})</option>)}
            </select></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Delivery Staff</label><select value={form.delivery_rider_id} onChange={handleChange('delivery_rider_id')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
              <option value="">Not assigned</option>{staffList.filter(s => s.role === 'delivery_rider' || !s.role).map(staff => <option key={staff.id} value={staff.id}>{staff.name} ({staff.phone})</option>)}
            </select></div>
          </div>
        </div>

        {/* Additional */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Additional</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Est. Delivery</label><input type="date" value={form.estimated_delivery} onChange={handleChange('estimated_delivery')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select value={form.status} onChange={handleChange('status')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg">
              {statusOptions.map(st => <option key={st} value={st}>{st.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </select></div>
          </div>
          <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label><textarea rows={2} value={form.special_instructions} onChange={handleChange('special_instructions')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
          <div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label><textarea rows={2} value={form.notes} onChange={handleChange('notes')} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg" /></div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 disabled:opacity-50">
            {loading ? 'Saving...' : isEdit ? 'Update Shipment' : 'Create Shipment'}
          </button>
          <button type="button" onClick={onCancel} className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
