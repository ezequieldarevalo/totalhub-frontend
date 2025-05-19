// pages/dashboard/rooms/index.jsx
import { withAuth } from '@/lib/withAuth';
import Link from 'next/link';
import DashboardLayout from '../layout';

export default function RoomsIndex({ rooms }) {
  return (
    <DashboardLayout pageTitle='Habitaciones'>
      <h1>Habitaciones</h1>

      <Link
        href="/dashboard/rooms/new"
        style={{
          display: 'inline-block',
          marginBottom: '1rem',
          background: '#0070f3',
          color: 'white',
          padding: '0.5rem 1rem',
          textDecoration: 'none',
          borderRadius: '4px',
        }}
      >
        + Nueva habitación
      </Link>

      {rooms.length > 0 ? (
        <ul>
          {rooms.map((room) => (
            <li key={room.id} style={{ marginBottom: '1rem' }}>
              <strong>{room.name}</strong> – Capacidad: {room.capacity}
              <div style={{ marginTop: '0.5rem' }}>
                <Link
                  href={`/dashboard/rooms/${room.id}/edit`}
                  style={{
                    marginRight: '0.5rem',
                    background: '#0070f3',
                    color: 'white',
                    padding: '0.3rem 0.6rem',
                    textDecoration: 'none',
                    borderRadius: '4px',
                  }}
                >
                  Editar
                </Link>
                <button
                  onClick={async () => {
                    if (!confirm('¿Estás seguro de eliminar esta habitación?')) return;

                    const res = await fetch(`/api/backend/rooms/${room.id}`, {
                      method: 'DELETE',
                      headers: {
                        Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
                      },
                    });

                    if (res.ok) {
                      alert('Habitación eliminada');
                      window.location.reload();
                    } else {
                      const data = await res.json();
                      alert(data.message || 'Error al eliminar');
                    }
                  }}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    padding: '0.3rem 0.6rem',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay habitaciones registradas.</p>
      )}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (_ctx, user) => {
  const token = _ctx.req.cookies?.token ?? '';

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
