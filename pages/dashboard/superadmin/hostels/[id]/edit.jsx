import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../../layout';

function EditHostel({ initialData }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/backend/hostels/${router.query.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al actualizar hostel');
      }

      router.push('/dashboard/hostels');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Editar hostel">
      <h1>Editar hostel</h1>

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
        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';
  const { id } = ctx.params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hostels/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return { notFound: true };

    const initialData = await res.json();
    return { props: { initialData } };
  } catch {
    return { notFound: true };
  }
});

export default EditHostel;
