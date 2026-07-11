import { motion } from 'framer-motion';

export default function Terms() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Terms & Conditions</h1>
          <p className="text-gray-500">Last updated: January 2025</p>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 p-8 md:p-10 space-y-6 text-gray-600 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>Welcome to Straightway Couriers. By using our services, you agree to these terms and conditions. Please read them carefully. If you do not agree with any part of these terms, you should not use our services.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Services</h2>
            <p>Straightway Couriers provides courier and parcel delivery services within Sri Lanka. We reserve the right to modify, suspend, or discontinue any aspect of our services at any time without prior notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Shipment Acceptance</h2>
            <p>We reserve the right to refuse any shipment that does not comply with our guidelines. All shipments are subject to inspection. By using our services, you confirm that your shipment contains no prohibited items.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Restricted Items</h2>
            <p>The following items are prohibited: hazardous materials, flammable substances, illegal drugs, weapons, explosives, perishable goods without proper packaging, and any items prohibited by Sri Lankan law. We are not liable for any consequences arising from the shipment of prohibited items.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Liability</h2>
            <p>Our liability for loss, damage, or delay is limited to the declared value of the shipment. We are not liable for indirect or consequential damages. Insurance options are available for high-value shipments.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Delivery</h2>
            <p>Delivery times are estimates and not guaranteed. We are not liable for delays caused by factors beyond our control, including but not limited to weather conditions, traffic, customs clearance, or natural disasters.</p>
            <p className="mt-2">If delivery is unsuccessful after multiple attempts, the shipment may be held at our facility. Storage charges may apply for unclaimed shipments after 7 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Charges and Payment</h2>
            <p>All charges are calculated based on weight, dimensions, distance, and service type. Payment is due at the time of booking unless credit terms have been arranged. COD (Cash on Delivery) amounts will be collected by our delivery staff.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Claims</h2>
            <p>Claims for loss or damage must be submitted within 7 days of delivery. Claims must include the original tracking number, proof of value, and photographs of damaged items. Claims are processed within 14 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Privacy</h2>
            <p>We collect and process personal information as described in our Privacy Policy. By using our services, you consent to such collection and processing.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to update these terms at any time. Changes will be effective immediately upon posting. Continued use of our services after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Contact</h2>
            <p>For questions about these terms, please contact us at straightwaycouriers@gmail.com or call +94 77 252 0636.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
