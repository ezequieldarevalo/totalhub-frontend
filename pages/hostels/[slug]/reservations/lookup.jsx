import { useState } from 'react';
import styled from 'styled-components';
import Layout from '@/components/Layout';

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
  display: grid;
  gap: 1rem;
  max-width: 400px;
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

const Card = styled.div`
  border: 1px solid #ddd;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 6px;
`;

export default function LookupReservations() {
  const [email, setEmail] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setReservations([]);
    setLoading(true);

    try {
      const res = await fetch(
        `/api/backend/public/hostels/reservations/lookup?email=${encodeURIComponent(email)}`
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al buscar reservas');

      setReservations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Title>Consultar mis reservas</Title>

      <Form onSubmit={handleSubmit}>
        <Field>
          Email de la reserva:
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Button type="submit" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar reservas'}
        </Button>
      </Form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {reservations.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Reservas encontradas:</h2>
          {reservations.map((r) => (
            <Card key={r.id}>
              <p><strong>ID:</strong> {r.id}</p>
              <p><strong>Habitación:</strong> {r.room || 'Desconocida'}</p>
              <p><strong>Desde:</strong> {r.from?.split('T')[0]}</p>
              <p><strong>Hasta:</strong> {r.to?.split('T')[0]}</p>
              <p><strong>Huéspedes:</strong> {r.guests}</p>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
