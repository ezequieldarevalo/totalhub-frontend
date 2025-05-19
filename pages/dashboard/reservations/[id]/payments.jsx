// pages/dashboard/reservations/[id]/payments.jsx

import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../layout';
import Link from 'next/link';

function ReservationPaymentsPage({ payments, reservationId }) {
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <DashboardLayout pageTitle="Pagos de la reserva">
      <h1>Pagos de la reserva</h1>

      <p><strong>ID de reserva:</strong> {reservationId}</p>
      <p><strong>Total pagado:</strong> ${totalPaid}</p>

      {payments.length === 0 ? (
        <p>No hay pagos registrados.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: '1rem', width: '100%' }}>
          <thead>
            <tr>
              <th>Monto</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, index) => (
              <tr key={index}>
                <td>${p.amount}</td>
                <td>{new Date(p.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '1rem' }}>
        <Link href="/dashboard/reservations">
          <button>Volver al listado de reservas</button>
        </Link>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';
  const { id } = ctx.params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/reservation/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return { notFound: true };

    const payments = await res.json();
    return { props: { payments, reservationId: id } };
  } catch {
    return { notFound: true };
  }
});

export default ReservationPaymentsPage;
