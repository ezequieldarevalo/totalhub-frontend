import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '@/components/Layout';

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  max-width: 500px;
  display: grid;
  gap: 1rem;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
  margin-top: 0.3rem;
`;

const Button = styled.button`
  padding: 0.75rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const Message = styled.p`
  margin-top: 1rem;
  font-weight: bold;
`;

export default function NewReservation() {
  const router = useRouter();
  const { slug, roomId, roomName, from, to, guests } = router.query;

  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug || !roomId || !from || !to || !guests) {
      setError('Faltan datos para completar la reserva.');
    }
  }, [slug, roomId, from, to, guests]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/backend/public/hostels/${slug}/reservations`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            roomId,
            from,
            to,
            guests: parseInt(guests, 10),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al reservar');

      setSuccess(data);
      setForm({ name: '', email: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Title>Confirmar reserva</Title>

      <p><strong>Habitación:</strong> {roomName}</p>
      <p><strong>Desde:</strong> {from}</p>
      <p><strong>Hasta:</strong> {to}</p>
      <p><strong>Huéspedes:</strong> {guests}</p>

      <Form onSubmit={handleSubmit}>
        <Field>
          Nombre completo:
          <Input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </Field>

        <Field>
          Email:
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Field>

        <Button type="submit" disabled={loading}>
          {loading ? 'Reservando...' : 'Confirmar reserva'}
        </Button>
      </Form>

      {error && <Message style={{ color: 'red' }}>{error}</Message>}
      {success && (
        <Message style={{ color: 'green' }}>
          ¡Reserva confirmada! ID: {success.reservation.id} – Total: ${success.total}
        </Message>
      )}
    </Layout>
  );
}
