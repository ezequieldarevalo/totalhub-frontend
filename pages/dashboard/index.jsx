// pages/dashboard/index.jsx
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from './layout';
import Head from 'next/head';

function DashboardHome({ user }) {
  return (
    <DashboardLayout pageTitle='Inicio'>
      <h1>Bienvenido, {user.email}</h1>
      <p>Desde aquí podés gestionar tu propiedad, reservas y habitaciones.</p>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(); // ✅ Aplica la validación

export default DashboardHome;
