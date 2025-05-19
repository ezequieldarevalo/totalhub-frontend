import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../layout';

function PaymentsPage({ initialPayments }) {
  const [payments, setPayments] = useState(initialPayments || []);
  const [message, setMessage] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const fetchPayments = async () => {
    setMessage(null);
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const res = await fetch(`/api/backend/payments?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al obtener pagos');
      }

      const data = await res.json();
      setPayments(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [from, to]);

  return (
    <DashboardLayout pageTitle="Pagos">
      <h1>Pagos registrados</h1>

      <div style={{ margin: '1rem 0' }}>
        <label>
          Desde:{' '}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>{' '}
        <label>
          Hasta:{' '}
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {payments.length === 0 ? (
        <p>No hay pagos registrados.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Monto</th>
              <th>Reserva</th>
              <th>Nombre</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                <td>${p.amount}</td>
                <td>{p.reservationId}</td>
                <td>{p.guest?.name || '-'}</td>
                <td>{p.guest?.email || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const initialPayments = res.ok ? await res.json() : [];
    return { props: { initialPayments } };
  } catch {
    return { props: { initialPayments: [] } };
  }
});

export default PaymentsPage;
