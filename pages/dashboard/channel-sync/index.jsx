import { useEffect, useState } from 'react';
import DashboardLayout from '../layout';
import { withAuth } from '@/lib/withAuth';

export default function ChannelSyncPage({ hostelId }) {
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('');
  const [externalResId, setExternalResId] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      hostelId,
      page,
      limit,
    });

    if (status) params.append('status', status);
    if (externalResId) params.append('externalResId', externalResId);

    try {
      const res = await fetch(`/api/backend/channel-sync/logs?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setLogs(data.items);
        setTotal(data.total);
      } else {
        alert(data.message || 'Error al obtener logs');
      }
    } catch {
      alert('Error al obtener logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <DashboardLayout pageTitle="Sincronización de reservas">
      <h1>Sincronización de reservas</h1>

      <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
        <label>
          Estado:
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ marginLeft: '0.5rem', marginRight: '1rem' }}
          >
            <option value="">Todos</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="error">Error</option>
          </select>
        </label>
        <label>
          ID externo:
          <input
            type="text"
            value={externalResId}
            onChange={(e) => setExternalResId(e.target.value)}
            placeholder="Buscar por ID"
            style={{ marginLeft: '0.5rem' }}
          />
        </label>
        <button type="submit" style={{ marginLeft: '1rem' }}>
          Buscar
        </button>
      </form>

      {loading ? (
        <p>Cargando logs...</p>
      ) : (
        <>
          <table border="1" cellPadding="6" style={{ width: '100%', marginBottom: '1rem' }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>ID externo</th>
                <th>Estado</th>
                <th>Canal</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.externalResId}</td>
                  <td>{log.status}</td>
                  <td>{log.connection.channel.name}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Anterior
            </button>
            <span>
              Página {page} de {Math.ceil(total / limit) || 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
            >
              Siguiente
            </button>
          </div>
        </>
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
