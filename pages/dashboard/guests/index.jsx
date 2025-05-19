import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../layout';
import Link from 'next/link';

function GuestList({ initialData }) {
  const [guests, setGuests] = useState(initialData?.data || []);
  const [pagination, setPagination] = useState(initialData?.pagination || {});
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState(null);

  const fetchGuests = async () => {
    setMessage(null);
    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      params.append('page', page.toString());

      const res = await fetch(`/api/backend/guests/all?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al obtener huéspedes');
      }

      const data = await res.json();
      setGuests(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [query, page]);

  return (
    <DashboardLayout pageTitle="Huéspedes">
      <h1>Lista de huéspedes</h1>

      <div style={{ margin: '1rem 0' }}>
        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {guests.length === 0 ? (
        <p>No se encontraron huéspedes.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%', marginTop: '1rem' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id}>
                <td>{guest.name || '-'}</td>
                <td>{guest.email}</td>
                <td>
                  <Link href={`/dashboard/guests/${guest.id}/view`}>
                    <button>Ver</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {pagination?.totalPages > 1 && (
        <div style={{ marginTop: '1rem' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              disabled={pagination.page === i + 1}
              style={{
                marginRight: '0.3rem',
                backgroundColor: pagination.page === i + 1 ? '#007bff' : '#f0f0f0',
                color: pagination.page === i + 1 ? 'white' : 'black',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guests/all?page=1`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const initialData = res.ok ? await res.json() : { data: [], pagination: {} };
    return { props: { initialData } };
  } catch {
    return { props: { initialData: { data: [], pagination: {} } } };
  }
});

export default GuestList;
