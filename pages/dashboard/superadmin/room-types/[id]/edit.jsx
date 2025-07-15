import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../../layout';

function EditRoomType({ roomTypeInfo, message: initialMessage }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: roomTypeInfo?.name || '',
    slug: roomTypeInfo?.slug || '',
    capacity: roomTypeInfo?.capacity || 1,
  });

  const [message, setMessage] = useState(initialMessage || null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/backend/room-types/${roomTypeInfo.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al editar tipo');

      router.push('/dashboard/superadmin/room-types');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Editar tipo de habitación">
      <h1>Editar tipo</h1>

      {message && <p style={{ color: 'red' }}>{message}</p>}

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
            min={1}
            required
          />
        </label>
        <br />

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const { id } = ctx.params;
  const token = ctx.req.cookies.token || '';

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/room-types/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error('No se pudo obtener la información');

    const roomTypeInfo = await res.json();
    return { props: { roomTypeInfo, message: null } };
  } catch (err) {
    return { props: { roomTypeInfo: null, message: err.message } };
  }
});

export default EditRoomType;
