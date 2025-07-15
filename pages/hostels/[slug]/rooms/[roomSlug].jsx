// pages/hostels/[slug]/rooms/[roomSlug].js
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Image from 'next/image';

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

const Description = styled.p`
  margin-top: 1rem;
  font-size: 1.1rem;
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

const Gallery = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
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
      {room.description && <Description>{room.description}</Description>}
      <Info><strong>Capacidad:</strong> {room.capacity} personas</Info>
      <Info><strong>Fechas seleccionadas:</strong> {from} a {to}</Info>
      <Info><strong>Huéspedes:</strong> {guests}</Info>

      {room.photos?.length > 0 && (
        <Gallery>
          {room.photos.map((url, idx) => (
            <Image
              key={idx}
              src={url}
              alt={`Foto ${idx + 1}`}
              width={300}
              height={200}
              style={{ objectFit: 'cover', borderRadius: '8px' }}
            />
          ))}
        </Gallery>
      )}

      <Button onClick={handleClick}>Confirmar reserva</Button>
    </Container>
  );
}
