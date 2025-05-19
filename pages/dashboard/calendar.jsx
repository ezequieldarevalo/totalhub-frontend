import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { withAuth } from '@/lib/withAuth';
import Head from 'next/head';

function CalendarPage() {
  const [calendar, setCalendar] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState(null);

  const fetchCalendar = async () => {
    setMessage(null);
    try {
      const params = new URLSearchParams();
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const res = await fetch(`/api/backend/reservations/calendar/hostel?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al obtener calendario');
      }

      const data = await res.json();
      setCalendar(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    if (from && to) {
      fetchCalendar();
    }
  }, [from, to]);

  const getColor = (libres, capacity) => {
    if (libres === capacity) return '#28a745'; // Verde (totalmente libre)
    if (libres === 0) return '#dc3545';         // Rojo (ocupado)
    return '#ffc107';                          // Amarillo (parcial)
  };

  const days = calendar[0]?.availability.map((a) => a.date) || [];

  return (
    <Layout pageTitle="Calendario de Disponibilidad">
      <Head>
        <title>Calendario de Disponibilidad - Dashboard</title>
      </Head>

      <h1>Calendario de Disponibilidad</h1>

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

      {calendar.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ marginTop: '1rem', minWidth: '1000px', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr style={{ background: '#f0f0f0' }}>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Habitación</th>
                {days.map((day) => (
                  <th key={day} style={{ padding: '8px', border: '1px solid #ccc' }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendar.map((room) => (
                <tr key={room.id}>
                  <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>{room.name}</td>
                  {room.availability.map((a) => {
                    const libres = room.capacity - a.guests;
                    const color = getColor(libres, room.capacity);
                    return (
                      <td
                        key={a.date}
                        style={{
                          backgroundColor: color,
                          color: color === '#ffc107' ? 'black' : 'white',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          border: '1px solid #ccc',
                          padding: '8px',
                        }}
                      >
                        {libres}/{room.capacity}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {calendar.length === 0 && from && to && (
        <p style={{ marginTop: '1rem' }}>No hay datos disponibles para el rango seleccionado.</p>
      )}
    </Layout>
  );
}

export const getServerSideProps = withAuth(async () => {
  return { props: {} };
});

export default CalendarPage;
