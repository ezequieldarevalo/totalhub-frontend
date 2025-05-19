import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../layout';
import AddPaymentModal from '@/components/dashboard/AddPaymentModal';

function ReservationsHistory({ initialReservations }) {
  const [reservations, setReservations] = useState(initialReservations || []);
  const [message, setMessage] = useState(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [includeCancelled, setIncludeCancelled] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReservationId, setSelectedReservationId] = useState(null);

  const openPaymentModal = (reservationId) => {
    setSelectedReservationId(reservationId);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedReservationId(null);
  };

  const confirmPayment = async (reservationId, amount) => {
    try {
      const res = await fetch(`/api/backend/reservations/${reservationId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al registrar pago');
      }

      fetchReservations();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const fetchReservations = async () => {
    setMessage(null);
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);
      if (includeCancelled) params.append('includeCancelled', 'true');

      const res = await fetch(`/api/backend/reservations/history?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al obtener historial');
      }

      const data = await res.json();
      setReservations(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [from, to, includeCancelled]);

  const handleCancel = async (id) => {
    if (!confirm('¿Seguro que querés cancelar esta reserva?')) return;

    try {
      const res = await fetch(`/api/backend/reservations/${id}/cancel`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al cancelar');
      }

      fetchReservations();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const getPaymentColor = (status) => {
    if (status === 'paid') return '#28a745';
    if (status === 'partial') return '#fd7e14';
    return '#dc3545';
  };

  const calculatePaidAmount = (payments) => {
    if (!payments || payments.length === 0) return 0;
    return payments.reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <DashboardLayout pageTitle="Historial de reservas">
      <h1>Historial de reservas</h1>

      <div style={{ margin: '1rem 0' }}>
        <label>
          Desde:{' '}
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>{' '}
        <label>
          Hasta:{' '}
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>{' '}
        <label>
          <input
            type="checkbox"
            checked={includeCancelled}
            onChange={(e) => setIncludeCancelled(e.target.checked)}
          />{' '}
          Mostrar canceladas
        </label>
      </div>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {reservations.length === 0 ? (
        <p>No hay reservas en el historial.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: '1rem', width: '100%' }}>
          <thead>
            <tr>
              <th>Habitación</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Huéspedes</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Pago</th>
              <th>Total</th>
              <th>Pagado</th>
              <th>Faltante</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => {
              const paidAmount = calculatePaidAmount(r.payments);
              const missingAmount = r.totalPrice - paidAmount;

              return (
                <tr
                  key={r.id}
                  style={{
                    color: r.cancelled ? '#888' : 'inherit',
                    textDecoration: r.cancelled ? 'line-through' : 'none',
                  }}
                >
                  <td>{r.room.name} {r.cancelled && <span style={{ fontStyle: 'italic' }}>(Cancelada)</span>}</td>
                  <td>{r.startDate.split('T')[0]}</td>
                  <td>{r.endDate.split('T')[0]}</td>
                  <td>{r.guests}</td>
                  <td>{r.guest?.name || r.name || '-'}</td>
                  <td>{r.guest?.email || r.email || '-'}</td>
                  <td>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: r.cancelled ? '#ccc' : '#28a745',
                        color: r.cancelled ? '#333' : 'white',
                        fontSize: '0.85rem',
                      }}
                    >
                      {r.cancelled ? 'Cancelada' : 'Activa'}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: getPaymentColor(r.paymentStatus),
                        color: 'white',
                        fontSize: '0.85rem',
                      }}
                    >
                      {r.paymentStatus === 'paid' && 'Pagado'}
                      {r.paymentStatus === 'partial' && 'Parcial'}
                      {r.paymentStatus === 'pending' && 'Pendiente'}
                    </span>
                  </td>
                  <td>${r.totalPrice}</td>
                  <td>${paidAmount}</td>
                  <td>${missingAmount >= 0 ? missingAmount : 0}</td>
                  <td>
                    {!r.cancelled && (
                      <>
                        <button
                          onClick={() => handleCancel(r.id)}
                          style={{
                            background: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginRight: '0.5rem',
                          }}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => openPaymentModal(r.id)}
                          style={{
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '0.3rem 0.6rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          Registrar pago
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <AddPaymentModal
        isOpen={showPaymentModal}
        onClose={closePaymentModal}
        onConfirm={confirmPayment}
        reservationId={selectedReservationId}
      />
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const initialReservations = res.ok ? await res.json() : [];
    return { props: { initialReservations } };
  } catch {
    return { props: { initialReservations: [] } };
  }
});

export default ReservationsHistory;
