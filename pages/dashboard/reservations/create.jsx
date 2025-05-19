import { useState } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../layout';

function CreateReservation({ rooms }) {
  const [form, setForm] = useState({
    roomId: '',
    startDate: '',
    endDate: '',
    guests: '',
    name: '',
    email: '',
    amountPaid: '', // 👈 nuevo campo
  });

  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    setMessage(null);
    setPreview(null);

    if (
      updated.roomId &&
      updated.startDate &&
      updated.endDate &&
      updated.guests > 0
    ) {
      try {
        const res = await fetch(
          `/api/backend/reservations/preview?roomId=${updated.roomId}&startDate=${updated.startDate}&endDate=${updated.endDate}&guests=${updated.guests}`,
          {
            headers: {
              Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
            },
          }
        );

        const data = await res.json();
        if (!res.ok || data.valid === false) {
          throw new Error(data.message || 'Error al calcular total');
        }

        setPreview(data);
      } catch (err) {
        setMessage(err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/backend/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify({
          ...form,
          guests: parseInt(form.guests, 10),
          amountPaid: form.amountPaid ? parseInt(form.amountPaid, 10) : 0, // 👈 casteamos el pago
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear reserva');

      window.location.href = '/dashboard/reservations';
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle='Creación de reserva'>
      <h1>Crear nueva reserva</h1>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Habitación:
          <select name="roomId" value={form.roomId} onChange={handleChange} required>
            <option value="">Seleccionar</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Desde:
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Hasta:
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Huéspedes:
          <input
            type="number"
            name="guests"
            value={form.guests}
            onChange={handleChange}
            required
            min="1"
          />
        </label>
        <br />

        {preview?.total !== undefined && (
          <>
            <p>Total estimado: <strong>${preview.total}</strong></p>
            {preview.breakdown?.length > 0 && (
              <>
                <p><strong>Desglose por día:</strong></p>
                <ul>
                  {preview.breakdown.map((b) => (
                    <li key={b.date}>
                      {b.date}: ${b.price} x {form.guests || 1} = <strong>${b.price * (form.guests || 1)}</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        <label>
          Nombre del huésped:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Email del huésped:
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Monto pagado (opcional):
          <input
            type="number"
            name="amountPaid"
            value={form.amountPaid}
            onChange={handleChange}
            min="0"
          />
        </label>
        <br />

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Confirmar reserva'}
        </button>
      </form>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx, user) => {
  const token = ctx.req.cookies.token || '';

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const rooms = res.ok ? await res.json() : [];
    return { props: { rooms } };
  } catch {
    return { props: { rooms: [] } };
  }
});

export default CreateReservation;
