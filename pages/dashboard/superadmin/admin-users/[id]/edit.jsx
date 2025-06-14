import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../../layout';

function EditAdminUser({ initialData, hostels }) {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    hostelId: '',
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        hostelId: initialData.hostelId || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/backend/admin-users/${router.query.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          hostelId: form.hostelId,
          ...(form.password ? { password: form.password } : {}), // 👈 solo si fue completada
        }),        
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al actualizar administrador');

      router.push('/dashboard/superadmin/admin-users');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Editar administrador">
      <h1>Editar administrador</h1>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Nombre:
          <input type="text" name="name" value={form.name} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Email:
          <input type="email" name="email" value={form.email} onChange={handleChange} required />
        </label>
        <br />
        <label>
          Contraseña (opcional):
          <input type="password" name="password" value={form.password} onChange={handleChange} />
        </label>
        <br />
        <label>
          Hostel:
          <select name="hostelId" value={form.hostelId} onChange={handleChange} required>
            <option value="">Seleccionar</option>
            {hostels.map((h) => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
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
    const [adminRes, hostelsRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin-users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/hostels`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!adminRes.ok || !hostelsRes.ok) return { notFound: true };

    const [initialData, hostels] = await Promise.all([
      adminRes.json(),
      hostelsRes.json(),
    ]);

    return { props: { initialData, hostels } };
  } catch {
    return { notFound: true };
  }
});

export default EditAdminUser;
