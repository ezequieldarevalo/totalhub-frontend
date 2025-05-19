import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../layout';
import Link from 'next/link';

function HostelList({ initialData }) {
  const [hostels, setHostels] = useState(initialData || []);
  const [message, setMessage] = useState(null);

  const fetchHostels = async () => {
    setMessage(null);
    try {
      const res = await fetch('/api/backend/hostels', {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al obtener hostels');
      }

      const data = await res.json();
      setHostels(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  return (
    <DashboardLayout pageTitle="Hostels">
      <h1>Hostels registrados</h1>

      <div style={{ margin: '1rem 0' }}>
        <Link href="/dashboard/superadmin/hostels/create">
          <button>+ Crear nuevo hostel</button>
        </Link>
      </div>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {hostels.length === 0 ? (
        <p>No hay hostels registrados.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {hostels.map((h) => (
              <tr key={h.id}>
                <td>{h.name}</td>
                <td>{h.slug}</td>
                <td>
                  <Link href={`/dashboard/superadmin/hostels/${h.id}/edit`}>
                    <button>Editar</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hostels`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const initialData = res.ok ? await res.json() : [];
    return { props: { initialData } };
  } catch {
    return { props: { initialData: [] } };
  }
});

export default HostelList;
