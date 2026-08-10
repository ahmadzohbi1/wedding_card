import { createRoot } from 'react-dom/client';
import WeddingInvitation, { type GuestData } from './pages/WeddingInvitation';
import '../css/wedding.css';

const container = document.getElementById('app');

if (container) {
    const rawGuest = container.dataset.guest;
    const guest: GuestData | undefined = rawGuest ? JSON.parse(rawGuest) : undefined;
    const showKidsMessage = container.dataset.showKidsMessage === '1';
    createRoot(container).render(<WeddingInvitation guest={guest} showKidsMessage={showKidsMessage} />);
}
