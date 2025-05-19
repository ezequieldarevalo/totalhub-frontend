import Layout from '@/components/Layout';
import { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.main`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  font-family: sans-serif;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
  margin-top: 2rem;
`;

const RoomList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

const RoomItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid #eee;
`;

const Form = styled.form`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.label`
  display: flex;
  flex-direction: column;
  font-weight: bold;
`;

const Input = styled.input`
  padding: 6px;
  font-size: 1rem;
  margin-top: 4px;
`;

const Button = styled.button`
  padding: 10px;
  background: #004aad;
  color: white;
  border: none;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background: #003580;
  }
`;

export default function HostelPage({ hostel, rooms }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [guests, setGuests] = useState(1);

  return (
    <Layout>
      <Title>{hostel.name}</Title>

      <SectionTitle>Habitaciones</SectionTitle>
      <RoomList>
        {rooms.map((room) => (
          <RoomItem key={room.id}>
            <strong>{room.name}</strong> – {room.capacity} personas
          </RoomItem>
        ))}
      </RoomList>

      <SectionTitle>Buscar disponibilidad</SectionTitle>
      <Form method="GET" action={`/public/hostels/${hostel.slug}/availability`}>
        <Field>
          Desde:
          <Input type="date" name="from" value={from} onChange={(e) => setFrom(e.target.value)} required />
        </Field>
        <Field>
          Hasta:
          <Input type="date" name="to" value={to} onChange={(e) => setTo(e.target.value)} required />
        </Field>
        <Field>
          Huéspedes:
          <Input type="number" name="guests" value={guests} min={1} onChange={(e) => setGuests(e.target.value)} />
        </Field>
        <Button type="submit">Buscar</Button>
      </Form>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;
  console.log("pepe")

  const res = await fetch(`http://localhost:3001/public/hostels/${slug}/rooms`);
  if (!res.ok) {
    return { notFound: true };
  }

  const data = await res.json();

  return {
    props: {
      hostel: data.hostel,
      rooms: data.rooms,
    },
  };
}
