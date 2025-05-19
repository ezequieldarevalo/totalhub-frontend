import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../layout';
import Link from 'next/link';

function OperatorList({ initialData }) {
  const [operators, setOperators] = useState(initialData || []);
  const [message, setMessage] = useState(null);

  const fetchOperators = async () => {
    setMessage(null);
    try {
      const res = await fetch(`/api/backend/operators`, {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al obtener operadores');
      }

      const data = await res.json();
      setOperators(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Seguro que querés eliminar este operador?')) return;
    try {
      const res = await fetch(`/api/backend/operators/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al eliminar operador');
      }

      fetchOperators();
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  return (
    <DashboardLayout pageTitle="Operadores">
      <h1>Operadores</h1>

      <div style={{ margin: '1rem 0' }}>
        <Link href="/dashboard/operators/create">
          <button>+ Crear nuevo operador</button>
        </Link>
      </div>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {operators.length === 0 ? (
        <p>No hay operadores registrados.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {operators.map((op) => (
              <tr key={op.id}>
                <td>{op.name || '-'}</td>
                <td>{op.email}</td>
                <td>
                  <Link href={`/dashboard/operators/${op.id}/edit`}>
                    <button>Editar</button>
                  </Link>
                  <button
                    onClick={() => handleDelete(op.id)}
                    style={{
                      marginLeft: '0.5rem',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Eliminar
                  </button>
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/operators`, {
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

export default OperatorList;
