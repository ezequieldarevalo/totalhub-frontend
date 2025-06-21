import { useEffect, useState } from 'react';
import DashboardLayout from '../layout';
import { withAuth } from '@/lib/withAuth';

export default function ConfirmedReservationsPage({ hostelId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchConfirmed = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/backend/channel-sync/confirmed?hostelId=${hostelId}`, {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setLogs(data);
      } else {
        alert(data.message || 'Error al obtener reservas confirmadas');
      }
    } catch {
      alert('Error al obtener reservas confirmadas');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id) => {
    if (!confirm('¿Reintentar sincronización de esta reserva?')) return;

    try {
      const res = await fetch(`/api/backend/channel-sync/${id}/retry`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert('Sincronización reintentada con éxito');
        fetchConfirmed();
      } else {
        alert(data.message || 'Error al reintentar');
      }
    } catch {
      alert('Error al reintentar');
    }
  };

  useEffect(() => {
    fetchConfirmed();
  }, []);

  return (
    <DashboardLayout pageTitle="Reservas confirmadas (sincronización pendiente)">
      <h1>Reservas confirmadas (sin reserva interna aún)</h1>

      {loading ? (
        <p>Cargando reservas...</p>
      ) : logs.length === 0 ? (
        <p>No hay reservas confirmadas pendientes de sincronización.</p>
      ) : (
        <table border="1" cellPadding="6" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>ID externo</th>
              <th>Canal</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.createdAt).toLocaleString()}</td>
                <td>{log.externalResId}</td>
                <td>{log.connection.channel.name}</td>
                <td>
                  <button onClick={() => handleRetry(log.id)}>Sincronizar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx, user) => {
  return {
    props: {
      hostelId: user.hostelId || '',
    },
  };
});
