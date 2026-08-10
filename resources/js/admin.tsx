import { createRoot } from 'react-dom/client';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import '../css/wedding.css';
import '../css/admin.css';

const loginContainer = document.getElementById('admin-login');
if (loginContainer) {
    const errors: string[] = JSON.parse(loginContainer.dataset.errors ?? '[]');
    const oldEmail = loginContainer.dataset.oldEmail ?? '';
    createRoot(loginContainer).render(<AdminLogin errors={errors} oldEmail={oldEmail} />);
}

const dashboardContainer = document.getElementById('admin-dashboard');
if (dashboardContainer) {
    createRoot(dashboardContainer).render(<AdminDashboard />);
}
