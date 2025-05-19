import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '../../layout';

function EditReservation({ initialReservation }) {
  const router = useRouter();
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    guests: '',
    name: '',
    email: '',
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalPreview, setTotalPreview] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (initialReservation) {
      setForm({
        startDate: initialReservation.startDate.split('T')[0],
        endDate: initialReservation.endDate.split('T')[0],
        guests: initialReservation.guests,
        name: initialReservation.name || '',
        email: initialReservation.email || '',
      });
    }
  }, [initialReservation]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await fetch(
          `/api/backend/reservations/${router.query.id}/payments`,
          {
            headers: {
              Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
            },
          }
        );
        if (!res.ok) throw new Error('Error al obtener pagos');

        const data = await res.json();
        setPayments(data);
      } catch (err) {
        console.error(err.message);
      }
    };

    if (router.query.id) fetchPayments();
  }, [router.query.id]);

  const handleChange = async (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);

    if (
      updatedForm.startDate &&
      updatedForm.endDate &&
      updatedForm.guests > 0
    ) {
      try {
        const res = await fetch(
          `/api/backend/reservations/${router.query.id}/preview-update?startDate=${updatedForm.startDate}&endDate=${updatedForm.endDate}&guests=${updatedForm.guests}`,
          {
            headers: {
              Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok && data.valid) {
          setTotalPreview(data.total);
          setBreakdown(data.breakdown || []);
          setMessage(null);
        } else {
          setTotalPreview(null);
          setBreakdown([]);
          setMessage(data.message || 'Error al calcular total');
        }
      } catch {
        setMessage('Error al calcular total');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/backend/reservations/${router.query.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${document.cookie.split('token=')[1]}`,
        },
        body: JSON.stringify({
          startDate: form.startDate,
          endDate: form.endDate,
          guests: parseInt(form.guests, 10),
          name: form.name || undefined,
          email: form.email || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error al actualizar reserva');
      }

      router.push('/dashboard/reservations');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Edición de reserva">
      <h1>Editar reserva</h1>

      {message && <p style={{ color: 'red' }}>{message}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Desde:
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Hasta:
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            required
          />
        </label>
        <br />
        <label>
          Huéspedes:
          <input
            type="number"
            name="guests"
            value={form.guests}
            onChange={handleChange}
            required
            min="1"
          />
        </label>
        <br />
        <label>
          Nombre del huésped:
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
        </label>
        <br />
        <label>
          Email del huésped:
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </label>
        <br />

        {totalPreview !== null && (
          <>
            <p>
              Total estimado: <strong>${totalPreview}</strong>
            </p>

            {breakdown.length > 0 && (
              <>
                <h4>Desglose por día:</h4>
                <ul>
                  {breakdown.map((item) => (
                    <li key={item.date}>
                      {item.date}: ${item.price} x {form.guests} ={' '}
                      <strong>${item.price * form.guests}</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>

      {payments.length > 0 && (
        <>
          <h3>Pagos registrados</h3>
          <ul>
            {payments.map((p, i) => (
              <li key={i}>${p.amount}</li>
            ))}
          </ul>
        </>
      )}
    </DashboardLayout>
  );
}

export const getServerSideProps = withAuth(async (ctx) => {
  const token = ctx.req.cookies.token || '';
  const { id } = ctx.params;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reservations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return { notFound: true };

    const initialReservation = await res.json();
    return { props: { initialReservation } };
  } catch {
    return { notFound: true };
  }
});

export default EditReservation;
