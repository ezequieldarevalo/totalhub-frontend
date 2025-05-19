// pages/dashboard/rooms/[id]/edit.jsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../layout';

export default function EditRoom({ room, token }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: room.name,
    slug: room.slug,
    capacity: room.capacity,
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch(`/api/backend/rooms/${room.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          capacity: parseInt(form.capacity, 10),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar');

      router.push('/dashboard/rooms');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <DashboardLayout pageTitle='Edición de habitación'>
      <h1>Editar habitación</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Nombre:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Slug:
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Capacidad:
          <input
            type="number"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            min="1"
            required
          />
        </label>
        <br />
        <button type="submit">Guardar cambios</button>
      </form>

      {message && <p style={{ marginTop: '1rem', color: 'red' }}>{message}</p>}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx, user) => {
  const { id } = ctx.params;
  const token = ctx.req.cookies.token || '';

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const rooms = await res.json();
    const room = rooms.find((r) => r.id === id);

    if (!room) return { notFound: true };

    return {
      props: {
        room,
        token,
      },
    };
  } catch {
    return { notFound: true };
  }
});
