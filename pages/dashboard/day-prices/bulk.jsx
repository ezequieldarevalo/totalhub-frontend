// pages/dashboard/day-prices/bulk.jsx
import { useState } from 'react';
import { withAuth } from '@/lib/withAuth';

export default function BulkDayPricesPage({ rooms }) {
  const [form, setForm] = useState({
    roomId: '',
    from: '',
    to: '',
  });
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState([]);
  const [message, setMessage] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const fetchPrices = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(
        `/api/backend/day-prices?roomId=${form.roomId}&from=${form.from}&to=${form.to}`,
        {
          headers: {
            Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
          },
        }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al cargar precios');

      // Creamos una fila por cada día entre from y to
      const fromDate = new Date(form.from);
      const toDate = new Date(form.to);
      const dates = [];

      for (
        let d = new Date(fromDate);
        d <= toDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toISOString().split('T')[0];
        const existing = data.find((p) => p.date.startsWith(dateStr));
        dates.push({
          date: dateStr,
          price: existing?.price ?? '',
        });
      }

      setDays(dates);
    } catch (err) {
      setMessage(err.message);
      setDays([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (index, value) => {
    const updated = [...days];
    updated[index].price = value;
    setDays(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      for (const day of days) {
        await fetch(`/api/backend/day-prices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
          },
          body: JSON.stringify({
            roomId: form.roomId,
            date: day.date,
            price: parseFloat(day.price),
          }),
        });
      }

      setMessage('Precios actualizados correctamente');
    } catch (err) {
      setMessage(err.message || 'Error al guardar precios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle='Carga masiva de precios'>
      <h1>Edición masiva de precios diarios</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          fetchPrices();
        }}
        style={{ marginBottom: '2rem' }}
      >
        <label>
          Habitación:
          <select
            name="roomId"
            value={form.roomId}
            onChange={handleChange}
            required
          >
            <option value="">Seleccionar</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Desde:
          <input
            type="date"
            name="from"
            value={form.from}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Hasta:
          <input
            type="date"
            name="to"
            value={form.to}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Buscar precios'}
        </button>
      </form>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {days.length > 0 && (
        <form onSubmit={handleSubmit}>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Precio</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day, i) => (
                <tr key={day.date}>
                  <td>{day.date}</td>
                  <td>
                    <input
                      type="number"
                      value={day.price}
                      onChange={(e) => handlePriceChange(i, e.target.value)}
                      required
                      step="0.01"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: '1rem' }}
          >
            Guardar todos los cambios
          </button>
        </form>
      )}
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

    const rooms = await res.json();

    if (!res.ok) return { props: { rooms: [] } };

    return {
      props: { rooms },
    };
  } catch {
    return {
      props: { rooms: [] },
    };
  }
});
