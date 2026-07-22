import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AdminRoute, StaffRoute, ClientRoute } from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Tracking = lazy(() => import('./pages/Tracking'));
const Services = lazy(() => import('./pages/Services'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQs = lazy(() => import('./pages/FAQs'));
const Terms = lazy(() => import('./pages/Terms'));
const Privacy = lazy(() => import('./pages/Privacy'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const StaffLogin = lazy(() => import('./pages/staff/Login'));
const StaffDashboard = lazy(() => import('./pages/staff/Dashboard'));
const ClientLogin = lazy(() => import('./pages/client/Login'));
const ClientDashboard = lazy(() => import('./pages/client/Dashboard'));
const Register = lazy(() => import('./pages/Register'));

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/track" element={<Tracking />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/staff" element={<StaffLogin />} />
            <Route path="/staff/dashboard" element={<StaffRoute><StaffDashboard /></StaffRoute>} />
            <Route path="/client" element={<ClientLogin />} />
            <Route path="/client/dashboard" element={<ClientRoute><ClientDashboard /></ClientRoute>} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
