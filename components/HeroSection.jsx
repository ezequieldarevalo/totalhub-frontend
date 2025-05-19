// components/HeroSection.js
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  color: #555;
  max-width: 600px;
  margin-bottom: 2rem;
`;

const Form = styled.form`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Input = styled.input`
  padding: 0.5rem;
  font-size: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #005bb5;
  }
`;

export default function HeroSection() {
  const router = useRouter();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!from || !to || !guests) return;
    router.push(`/availability?from=${from}&to=${to}&guests=${guests}`);
  };

  return (
    <Container>
      <Title>Bienvenido a TotalHub</Title>
      <Subtitle>Buscá disponibilidad en múltiples hostels, todo en un solo lugar.</Subtitle>
      <Form onSubmit={handleSubmit}>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
        <Input
          type="number"
          value={guests}
          min={1}
          onChange={(e) => setGuests(e.target.value)}
          required
          placeholder="Huéspedes"
        />
        <Button type="submit">Buscar disponibilidad</Button>
      </Form>
    </Container>
  );
}
