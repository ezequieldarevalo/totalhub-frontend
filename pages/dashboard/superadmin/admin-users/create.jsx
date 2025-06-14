import { useState, useEffect } from 'react';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../layout';
import { useRouter } from 'next/router';

function CreateAdminUser() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    hostelId: '',
  });

  const [hostels, setHostels] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchHostels = async () => {
    try {
      const res = await fetch('/api/backend/hostels', {
        headers: {
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al obtener hostels');

      setHostels(data);
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (!form.hostelId) {
        setMessage('Debe seleccionar un hostel');
        setLoading(false);
        return;
      }      
      const res = await fetch('/api/backend/admin-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear administrador');

      router.push('/dashboard/superadmin/admin-users');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Nuevo administrador">
      <h1>Crear nuevo administrador</h1>

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
          Contraseña:
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
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
          {loading ? 'Creando...' : 'Crear administrador'}
        </button>
      </form>
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth();

export default CreateAdminUser;
