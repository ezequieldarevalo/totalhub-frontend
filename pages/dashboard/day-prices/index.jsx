import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth'
import DashboardLayout from '../layout';

export default function DayPricesPage({ rooms }) {
  const [form, setForm] = useState({
    roomId: '',
    date: '',
    price: '',
  });
  const [message, setMessage] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchPrices = async () => {
    if (!form.roomId) return;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/backend/day-prices?roomId=${form.roomId}&from=2025-01-01&to=2025-12-31`,
        {
          headers: {
            Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
          },
        }
      );
      const data = await res.json();
      console.log('>>> precios recibidos', data);
      if (res.ok) {
        setPrices(data);
      } else {
        setMessage(data.message || 'Error al cargar precios');
        setPrices([]);
      }
    } catch {
      setMessage('Error al obtener precios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [form.roomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch(`/api/backend/day-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify({
          roomId: form.roomId,
          date: form.date,
          price: parseFloat(form.price),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cargar el precio');

      setMessage('Precio cargado correctamente');
      setForm({ ...form, date: '', price: '' });
      fetchPrices();
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleEditSubmit = async (id, date) => {
    try {
      const res = await fetch(`/api/backend/day-prices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify({
          roomId: form.roomId,
          date,
          price: parseFloat(editPrice),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || 'Error al editar');
      } else {
        setEditing(null);
        setEditPrice('');
        fetchPrices();
      }
    } catch {
      alert('Error al editar');
    }
  };

  return (
    <DashboardLayout pageTitle='Precios diarios'>

      <h1>Precios diarios</h1>

      <form onSubmit={handleSubmit}>
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
          Fecha:
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Precio:
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            step="0.01"
            required
          />
        </label>
        <br />
        <button type="submit">Cargar precio</button>
      </form>

      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}

      {form.roomId && (
        <>
          <h2 style={{ marginTop: '2rem' }}>Precios existentes</h2>
          {loading ? (
            <p>Cargando precios...</p>
          ) : prices.length > 0 ? (
            <table border="1" cellPadding="8" style={{ marginTop: '1rem' }}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Precio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => (
                  <tr key={p.id}>
                    <td>{p.date.split('T')[0]}</td>
                    <td>
                      {editing === p.id ? (
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          style={{ width: '80px' }}
                        />
                      ) : (
                        `$${p.price}`
                      )}
                    </td>
                    <td>
                      {editing === p.id ? (
                        <>
                          <button onClick={() => handleEditSubmit(p.id, p.date)}>Guardar</button>
                          <button onClick={() => setEditing(null)}>Cancelar</button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditing(p.id);
                              setEditPrice(p.price);
                            }}
                            style={{ marginRight: '0.5rem' }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm(`¿Eliminar precio del ${p.date.split('T')[0]}?`)) return;

                              try {
                                await fetch(`/api/backend/day-prices/${p.id}`, {
                                  method: 'DELETE',
                                  headers: {
                                    Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
                                  },
                                });


                                if (res.ok) {
                                  fetchPrices();
                                } else {
                                  const data = await res.json();
                                  alert(data.message || 'Error al eliminar');
                                }
                              } catch {
                                alert('Error al eliminar');
                              }
                            }}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay precios cargados para esta habitación.</p>
          )}
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
