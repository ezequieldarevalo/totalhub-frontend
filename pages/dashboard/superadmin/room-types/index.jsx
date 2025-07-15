import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../layout';
import Link from 'next/link';

function RoomTypeList({ roomTypesInfo, message }) {

  return (
    <DashboardLayout pageTitle="Tipos de habitación">
      <h1>Tipos de habitación</h1>

      <div style={{ margin: '1rem 0' }}>
        <Link href="/dashboard/superadmin/room-types/create">
          <button>+ Crear nuevo tipo</button>
        </Link>
      </div>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      {roomTypesInfo.length === 0 ? (
        <p>No hay tipos de habitación registrados.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Slug</th>
              <th>Capacidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
              {roomTypesInfo.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.slug}</td>
                <td>{r.capacity}</td>
                <td>
                  <Link href={`/dashboard/superadmin/room-types/${r.id}/edit`}>
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room-types`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const roomTypesInfo = res.ok ? await res.json() : [];
    return { props: { roomTypesInfo, message: null } };
  } catch (err) {
    return { props: { roomTypesInfo: [], message: err.message } };
  }
});

export default RoomTypeList;
