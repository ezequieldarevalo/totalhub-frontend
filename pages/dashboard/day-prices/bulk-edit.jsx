import { useState } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../layout';

export default function BulkEditPricesPage({ rooms }) {
  const [roomId, setRoomId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [prices, setPrices] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setMessage(null);
    setPrices([]);

    try {
      const res = await fetch(
        `/api/backend/day-prices?roomId=${roomId}&from=${from}&to=${to}`,
        {
          headers: {
            Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al obtener precios');

      const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setPrices(sorted.map(p => ({ ...p, newPrice: p.price })));
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleChange = (index, value) => {
    const updated = [...prices];
    updated[index].newPrice = value;
    setPrices(updated);
  };

  const handleApply = async () => {
    setMessage(null);
    try {
      const changes = prices
        .filter(p => parseFloat(p.newPrice) !== p.price)
        .map(p => ({ date: p.date, price: parseFloat(p.newPrice) }));

      const res = await fetch('/api/backend/day-prices/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify({ roomId, prices: changes }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al aplicar cambios');
      }

      setMessage('Cambios aplicados correctamente');
      await handleFetch();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <DashboardLayout pageTitle='Edición masiva de precios'>
      <h1>Edición masiva de precios</h1>

      <label>
        Habitación:
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)} required>
          <option value="">Seleccionar</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </label>
      <br />
      <label>
        Desde:
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
      </label>
      <br />
      <label>
        Hasta:
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
      </label>
      <br />
      <button onClick={handleFetch} disabled={!roomId || !from || !to}>Cargar precios</button>

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}

      {prices.length > 0 && (
        <>
          <h2>Editar precios</h2>
          <table border="1" cellPadding="8" style={{ marginTop: '1rem' }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Precio actual</th>
                <th>Nuevo precio</th>
              </tr>
            </thead>
            <tbody>
              {prices.map((p, i) => (
                <tr key={p.date}>
                  <td>{p.date.split('T')[0]}</td>
                  <td>${p.price}</td>
                  <td>
                    <input
                      type="number"
                      value={p.newPrice}
                      onChange={(e) => handleChange(i, e.target.value)}
                      style={{ width: '80px' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={handleApply} style={{ marginTop: '1rem' }}>
            Aplicar cambios
          </button>
        </>
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

    if (!res.ok) return { props: { rooms: [] } };

    const rooms = await res.json();
    return { props: { rooms } };
  } catch {
    return { props: { rooms: [] } };
  }
});
