import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../layout';
import { withAuth } from '@/lib/withAuth';

function EditGuest({ guest }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (guest) {
      setForm({
        name: guest.name || '',
        email: guest.email || '',
      });
    }
  }, [guest]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/backend/guests/${router.query.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar huésped');

      router.push(`/dashboard/guests/${router.query.id}`);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Editar huésped">
      <h1>Editar huésped</h1>

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
          Email:
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      <button
        onClick={() => router.push(`/dashboard/guests/${router.query.id}`)}
        style={{ marginTop: '1rem' }}
      >
        Cancelar
      </button>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';
  const { id } = ctx.params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/guests/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return { notFound: true };

    const guest = await res.json();
    return { props: { guest } };
  } catch {
    return { notFound: true };
  }
});

export default EditGuest;
