import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '../../layout';
import { withAuth } from '@/lib/withAuth';

function GuestDetail({ guest, payments }) {
  const router = useRouter();

  if (!guest) {
    return (
      <DashboardLayout pageTitle="Detalle del huésped">
        <p>Huésped no encontrado.</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Detalle del huésped">
      <h1>Detalle del huésped</h1>

      <p><strong>Nombre:</strong> {guest.name || '-'}</p>
      <p><strong>Email:</strong> {guest.email}</p>

      <div style={{ margin: '1rem 0' }}>
        <Link href={`/dashboard/guests/${guest.id}/edit`}>
          <button>Editar</button>
        </Link>
      </div>

      <h2>Reservas asociadas</h2>

      {guest.reservations.length === 0 ? (
        <p>No tiene reservas registradas.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Habitación</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Huéspedes</th>
              <th>Total</th>
              <th>Pago</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {guest.reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.room.name}</td>
                <td>{r.startDate.split('T')[0]}</td>
                <td>{r.endDate.split('T')[0]}</td>
                <td>{r.guests}</td>
                <td>${r.totalPrice}</td>
                <td>{r.paymentStatus === 'paid' ? 'Pagado' : r.paymentStatus === 'partial' ? 'Parcial' : 'Pendiente'}</td>
                <td>{r.cancelled ? 'Cancelada' : 'Activa'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h2 style={{ marginTop: '2rem' }}>Pagos registrados</h2>

      {payments.length === 0 ? (
        <p>No hay pagos registrados para este huésped.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Reserva</th>
              <th>Habitación</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.createdAt.split('T')[0]}</td>
                <td>${p.amount}</td>
                <td>{p.reservationId}</td>
                <td>{p.reservation.room.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => router.push('/dashboard/guests')}>Volver</button>
      </div>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';
  const { id } = ctx.params;

  try {
    const [guestRes, paymentsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/guests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/by-guest/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!guestRes.ok) return { notFound: true };

    const guest = await guestRes.json();
    const payments = paymentsRes.ok ? await paymentsRes.json() : [];

    return { props: { guest, payments } };
  } catch {
    return { notFound: true };
  }
});

export default GuestDetail;
