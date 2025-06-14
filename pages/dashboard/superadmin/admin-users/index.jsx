import { useEffect, useState } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../layout';
import Link from 'next/link';

function AdminUserList({ initialData }) {
  const [admins, setAdmins] = useState(initialData || []);
  const [message, setMessage] = useState(null);

  const fetchAdmins = async () => {
    setMessage(null);
    try {
      const res = await fetch('/api/backend/admin-users', {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al obtener administradores');

      setAdmins(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  return (
    <DashboardLayout pageTitle="Administradores">
      <h1>Administradores registrados</h1>

      <div style={{ margin: '1rem 0' }}>
        <Link href="/dashboard/superadmin/admin-users/create">
          <button>+ Crear nuevo administrador</button>
        </Link>
      </div>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {admins.length === 0 ? (
        <p>No hay administradores registrados.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Hostel</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>{admin.name}</td>
                <td>{admin.email}</td>
                <td>{admin.hostel?.name || '-'}</td>
                <td>
                  <Link href={`/dashboard/superadmin/admin-users/${admin.id}/edit`}>
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin-users`, {
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

export default AdminUserList;
