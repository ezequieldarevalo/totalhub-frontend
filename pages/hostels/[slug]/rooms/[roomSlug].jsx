// pages/hostels/[slug]/rooms/[roomSlug].js
import styled from 'styled-components';
import { useRouter } from 'next/router';

const Container = styled.div`
  max-width: 800px;
  margin: auto;
  padding: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Info = styled.p`
  font-size: 1.1rem;
  margin: 0.5rem 0;
`;

const Button = styled.button`
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #005bb5;
  }
`;

export default function RoomDetails({ room, from, to, guests }) {
  const router = useRouter();
  const { slug } = router.query;

  if (!room) {
    return (
      <Container>
        <Title>Habitación no encontrada</Title>
        <p>Verificá el enlace o volvé atrás.</p>
      </Container>
    );
  }

  const handleClick = () => {
    router.push({
      pathname: `/hostels/${slug}/reservations/new`,
      query: {
        roomId: room.id,
        roomName: room.name,
        from,
        to,
        guests,
      },
    });
  };

  return (
    <Container>
      <Title>{room.name}</Title>
      <Info><strong>Capacidad:</strong> {room.capacity} personas</Info>
      <Info><strong>Fechas seleccionadas:</strong> {from} a {to}</Info>
      <Info><strong>Huéspedes:</strong> {guests}</Info>

      <Button onClick={handleClick}>Confirmar reserva</Button>
    </Container>
  );
}

export async function getServerSideProps(context) {
  const { slug, roomSlug } = context.params;
  const { from = '', to = '', guests = '' } = context.query;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/hostels/${slug}/rooms/${roomSlug}`);
    const room = await res.json();

    if (!res.ok) {
      return { notFound: true };
    }

    return {
      props: {
        room,
        from,
        to,
        guests,
      },
    };
  } catch (err) {
    return {
      props: {
        room: null,
        from,
        to,
        guests,
      },
    };
  }
}
