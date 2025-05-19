import styled from 'styled-components';
import Layout from '@/components/Layout';
import Link from 'next/link';

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const RoomCard = styled.div`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: white;
`;

const Price = styled.p`
  font-weight: bold;
  margin-top: 0.5rem;
`;

const ButtonLink = styled(Link)`
  display: inline-block;
  padding: 0.75rem 1.25rem;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: bold;
  border-radius: 4px;
  margin-top: 1rem;
  text-decoration: none;
  text-align: center;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }
`;

const NoResults = styled.p`
  font-style: italic;
`;

export default function AvailabilityPage({ hostel, availableRooms, from, to, guests }) {
  return (
    <Layout>
      <Title>Disponibilidad en {hostel.name}</Title>
      <p>
        Fechas: <strong>{from}</strong> a <strong>{to}</strong> – Huéspedes: <strong>{guests}</strong>
      </p>

      {availableRooms.length === 0 ? (
        <NoResults>No hay habitaciones disponibles en ese rango de fechas.</NoResults>
      ) : (
        availableRooms.map((room) => (
          <RoomCard key={room.id}>
            <h3>{room.name}</h3>
            <p>Capacidad: {room.capacity}</p>
            <Price>Total: ${room.price}</Price>

            <ButtonLink
              href={{
                pathname: `/hostels/${hostel.slug}/reservations/new`,
                query: {
                  roomId: room.slug,
                  roomName: room.name,
                  from,
                  to,
                  guests,
                },
              }}
            >
              Reservar
            </ButtonLink>
          </RoomCard>
        ))
      )}
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const { from, to, guests } = context.query;

  if (!slug || !from || !to || !guests) {
    return { notFound: true };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(
    `${baseUrl}/hostels/${slug}/availability?from=${from}&to=${to}&guests=${guests}`
  );

  if (!res.ok) {
    return { notFound: true };
  }

  const data = await res.json();

  return {
    props: {
      hostel: data.hostel,
      availableRooms: data.availableRooms,
      from,
      to,
      guests,
    },
  };
}
