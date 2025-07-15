import { useEffect, useState } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../layout';

function DayPricesBulkPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [conflictModalOpen, setConflictModalOpen] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      const res = await fetch('/api/backend/rooms', {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });
      const data = await res.json();
      setRooms(data);
    };
    fetchRooms();
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!from || !to || (!price && !capacity) || selectedRooms.length === 0) {
      setError('Completá todos los campos necesarios');
      return;
    }

    const res = await fetch('/api/backend/day-prices/check-conflicts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
      },
      body: JSON.stringify({ roomIds: selectedRooms, from, to }),
    });

    const result = await res.json();
    if (res.ok && result?.hasConflicts) {
      setConflictModalOpen(true);
    } else {
      await submitBulkUpdate(); // sin conflictos
    }
  };

  const submitBulkUpdate = async (overwrite = false) => {
    setConflictModalOpen(false);
    setError('');
    setSuccess(false);
    setLoading(true);

    const res = await fetch('/api/backend/day-prices/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
      },
      body: JSON.stringify({
        roomIds: selectedRooms,
        from,
        to,
        price: price ? parseFloat(price) : undefined,
        availableCapacity: capacity ? parseFloat(capacity) : undefined,
        overwrite,
      }),
    });

    const result = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      setError(result.message || 'Error al guardar');
    }
  };

  return (
    <DashboardLayout pageTitle="Carga masiva de precios">
      <h1>Carga masiva de precios y capacidad</h1>

      <div>
        <label>Desde:</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div>
        <label>Hasta:</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div>
        <label>Precio:</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <div>
        <label>Capacidad disponible:</label>
        <input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
      </div>
      <div>
        <label>Habitaciones:</label>
        <select
          multiple
          value={selectedRooms}
          onChange={(e) =>
            setSelectedRooms(Array.from(e.target.selectedOptions, (opt) => opt.value))
          }
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>{room.name}</option>
          ))}
        </select>
      </div>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>Guardado exitosamente</p>}

      {conflictModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
            <h3>Conflictos detectados</h3>
            <p>Ya hay valores cargados en algunos días para las habitaciones seleccionadas.</p>
            <p>¿Qué deseás hacer?</p>
            <button onClick={() => submitBulkUpdate(false)}>✅ Solo agregar donde está vacío</button>
            <button onClick={() => submitBulkUpdate(true)} style={{ marginLeft: '1rem' }}>❗Sobrescribir existentes</button>
            <button onClick={() => setConflictModalOpen(false)} style={{ marginLeft: '1rem' }}>Cancelar</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth();

export default DayPricesBulkPage;
