import { useState } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../layout';

export default function NewRoom({ token }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    slug: '',
    capacity: 1,
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await fetch(`/api/backend/rooms`, {
        method: 'POST',
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
      if (!res.ok) throw new Error(data.message || 'Error al crear');

      router.push('/dashboard/rooms');
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <DashboardLayout pageTitle='Creación de habitacion'>
      <h1>Nueva habitación</h1>

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
        <button type="submit">Crear habitación</button>
      </form>

      {message && <p style={{ marginTop: '1rem', color: 'red' }}>{message}</p>}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';

  return {
    props: {
      token,
    },
  };
});
