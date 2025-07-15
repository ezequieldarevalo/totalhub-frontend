import { useEffect, useState, useMemo } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../layout';
import { debounce } from '@/lib/utils/debounce';

export default function DayPricesIndex({ rooms }) {
  const today = new Date();
  const oneWeekLater = new Date();
  oneWeekLater.setDate(today.getDate() + 7);

  const formatDate = (date) => date.toISOString().split('T')[0];

  const [from, setFrom] = useState(formatDate(today));
  const [to, setTo] = useState(formatDate(oneWeekLater));
  
  const [data, setData] = useState([]); // [{ roomId, date, price, availableCapacity, id }]
  const [loading, setLoading] = useState(false);
  const [massPrice, setMassPrice] = useState('');
  const [massCapacity, setMassCapacity] = useState('');

  const fetchData = async () => {
    if (!from || !to) return;
    setLoading(true);

    const res = await fetch(`/api/backend/day-prices/range?from=${from}&to=${to}`, {
      headers: {
        Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
      },
    });

    const result = await res.json();

    if (res.ok) {
      const normalized = result.flatMap((roomEntry) =>
        roomEntry.prices.map((p) => ({
          id: p.id,
          roomId: roomEntry.room.id,
          roomName: roomEntry.room.name,
          roomCapacity: roomEntry.room.capacity,
          date: p.date,
          price: p.price,
          availableCapacity: p.availableCapacity,
        }))
      );
      setData(normalized);
    } else {
      alert(result.message || 'Error al cargar datos');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [from, to]);

  const updateValue = async (id, field, value, oldValue) => {
    try {
      const res = await fetch(`/api/backend/day-prices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify({ [field]: parseFloat(value) }),
      });

      if (!res.ok) {
        throw new Error('Falló la actualización');
      }
    } catch (err) {
      alert('Error al guardar, se restaurará el valor anterior');
      setData((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, [field]: oldValue } : entry
        )
      );
    }
  };

  const debouncedUpdate = useMemo(() => debounce(updateValue, 500), []);

  const handleChange = (id, field, value) => {
    setData((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry
      )
    );
    const oldEntry = data.find((entry) => entry.id === id);
    const oldValue = oldEntry?.[field];
    debouncedUpdate(id, field, value, oldValue);
  };

  const uniqueDates = [...new Set(data.map((d) => d.date).filter(Boolean))].sort();

  return (
    <DashboardLayout pageTitle="Precios por día">
      <h1>Precios diarios por habitación</h1>

      <div>
        <label>Desde: </label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <label>Hasta: </label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>


      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>Habitación</th>
                {uniqueDates.map((date) => (
                  <th key={date}>{date?.split('T')[0]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td>{room.name}</td>
                  {uniqueDates.map((date) => {
                    const record = data.find((d) => d.roomId === room.id && d.date === date);
                    console.log(record)
                    if (!record || !record.id) {
                      console.warn('⚠️ Record sin ID detectado', { room, date, record });
                      return (
                        <td key={date}>
                          <span style={{ color: 'gray' }}>–</span>
                        </td>
                      );
                    }

                    return (
                      <td key={date}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <input
                            type="number"
                            placeholder="Precio"
                            value={record.price ?? ''}
                            onChange={(e) =>
                              handleChange(record.id, 'price', e.target.value)
                            }
                            style={{ width: '80px' }}
                          />
                          <input
                            type="number"
                            placeholder="Capacidad"
                            value={record.availableCapacity ?? ''}
                            onChange={(e) =>
                              handleChange(record.id, 'availableCapacity', e.target.value)
                            }
                            style={{ width: '80px', marginTop: '4px' }}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx, user) => {
  const token = ctx.req.cookies.token || '';
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { props: { rooms: [] } };
    const rooms = await res.json();
    return { props: { rooms } };
  } catch {
    return { props: { rooms: [] } };
  }
});
