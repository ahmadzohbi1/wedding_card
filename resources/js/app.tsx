import { createRoot } from 'react-dom/client';
import WeddingInvitation from './pages/WeddingInvitation';
import '../css/wedding.css';

const container = document.getElementById('app');

if (container) {
    createRoot(container).render(<WeddingInvitation />);
}
