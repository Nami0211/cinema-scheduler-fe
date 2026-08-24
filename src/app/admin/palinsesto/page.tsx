import { AdminPalinsestoClient } from './AdminPalinsestoClient';

export const metadata = {
  title: 'Gestione Palinsesto | Admin Multiplex Aurora',
  description:
    'Gestione del palinsesto proiezioni e verifica conflitti di sala.',
};

export default function AdminPalinsestoPage() {
  return <AdminPalinsestoClient />;
}
