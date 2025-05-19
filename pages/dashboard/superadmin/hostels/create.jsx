import { useState } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../layout';
import { useRouter } from 'next/router';

function CreateHostel() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    slug: '',
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch('/api/backend/superadmin/hostels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear hostel');

      router.push('/dashboard/superadmin/hostels');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Nuevo hostel">
      <h1>Crear nuevo hostel</h1>

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
          Slug (único):
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
          />
        </label>
        <br />

        <button type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear hostel'}
        </button>
      </form>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth();

export default CreateHostel;
