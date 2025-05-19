import { useState } from 'react';
import styled from 'styled-components';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

const Container = styled.div`
  max-width: 400px;
  margin: auto;
  padding: 3rem 1rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
`;

const Form = styled.form`
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
  background: #0070f3;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;

  &:hover {
    background: #005bb5;
  }
`;

const Message = styled.p`
  margin-top: 1rem;
  font-weight: bold;
`;

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/backend/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      console.log(res)

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');

      Cookies.set('token', data.access_token, { path: '/' });
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Title>Acceso al panel</Title>
      <Form onSubmit={handleSubmit}>
        <Field>
          Email
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </Field>
        <Field>
          Contraseña
          <Input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </Field>
        <Button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </Form>
      {error && <Message style={{ color: 'red' }}>{error}</Message>}
    </Container>
  );
}
